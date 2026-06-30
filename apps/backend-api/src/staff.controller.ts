import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

const defaultRolePermissions: Record<string, string[]> = {
  admin: [
    "booking.view", "booking.create", "booking.edit", "booking.delete",
    "pos.view", "invoice.view", "invoice.create",
    "customer.view", "customer.manage",
    "service.view", "service.manage",
    "inventory.view", "inventory.manage",
    "staff.view", "staff.manage",
    "shift.view", "shift.manage",
    "report.view",
    "branch.view", "branch.manage"
  ],
  manager: [
    "booking.view", "booking.create", "booking.edit", "booking.delete",
    "pos.view", "invoice.view", "invoice.create",
    "customer.view", "customer.manage",
    "service.view", "service.manage",
    "inventory.view", "inventory.manage",
    "staff.view", "shift.view", "shift.manage",
    "report.view",
    "branch.view"
  ],
  cashier: [
    "booking.view", "booking.create", "booking.edit",
    "pos.view", "invoice.view", "invoice.create",
    "customer.view", "customer.manage"
  ],
  employee: [
    "booking.view",
    "shift.view"
  ]
};

// Memory caches to optimize performance and prevent database connection pool bottlenecks
let cachedPermissions: any[] | null = null;
const initializedTenants = new Set<string>();
const tenantAdminCache = new Map<string, string | null>();

// Helper function to ensure standard roles exist for a tenant and link them to default permissions
export async function ensureStandardRolesAndPermissions(tenantId: string) {
  if (initializedTenants.has(tenantId)) {
    return prisma.role.findMany({
      where: {
        tenantId,
        deletedAt: null
      }
    });
  }

  // Ensure permissions exist in DB first
  const dbPermissions = await ensureStandardPermissions();

  const standardRoles = [
    { name: "Admin", description: "Quản trị viên tối cao của salon" },
    { name: "Manager", description: "Quản lý chi nhánh" },
    { name: "Cashier", description: "Nhân viên thu ngân" },
    { name: "Employee", description: "Kỹ thuật viên / Thợ làm tóc" }
  ];

  const existingRoles = await prisma.role.findMany({
    where: {
      tenantId,
      deletedAt: null
    }
  });

  const roles = [];
  const newlyCreatedRoleIds = new Set<string>();

  for (const r of standardRoles) {
    let found = existingRoles.find(
      (er) => er.name.toLowerCase() === r.name.toLowerCase()
    );
    if (!found) {
      found = await prisma.role.create({
        data: {
          tenantId,
          name: r.name,
          description: r.description
        }
      });
      newlyCreatedRoleIds.add(found.id);
    }
    roles.push(found);
  }

  // Bulk query all rolePermissions for standard roles to avoid count in loop
  const roleIds = roles.map((role) => role.id);
  const existingRolePermissions = await prisma.rolePermission.findMany({
    where: {
      roleId: { in: roleIds }
    }
  });

  // Check and populate default permissions for roles in-memory
  for (const found of roles) {
    const isNew = newlyCreatedRoleIds.has(found.id);
    const currentPermCount = existingRolePermissions.filter(
      (rp) => rp.roleId === found.id
    ).length;

    if (isNew || currentPermCount === 0) {
      const defaultSlugs = defaultRolePermissions[found.name.toLowerCase()] || [];
      const permIdsToLink = dbPermissions
        .filter((p) => defaultSlugs.includes(p.slug))
        .map((p) => p.id);

      if (permIdsToLink.length > 0) {
        await prisma.rolePermission.createMany({
          data: permIdsToLink.map((permissionId) => ({
            roleId: found.id,
            permissionId
          })),
          skipDuplicates: true
        });
      }
    }
  }

  initializedTenants.add(tenantId);
  return roles;
}

// Helper function to ensure system-wide standard permissions exist
export async function ensureStandardPermissions() {
  if (cachedPermissions) {
    return cachedPermissions;
  }

  const standardPermissions = [
    { slug: "booking.view", groupName: "Lịch hẹn", name: "Xem lịch hẹn", description: "Xem danh sách lịch hẹn" },
    { slug: "booking.create", groupName: "Lịch hẹn", name: "Tạo lịch hẹn", description: "Cho phép đặt lịch hẹn mới" },
    { slug: "booking.edit", groupName: "Lịch hẹn", name: "Sửa lịch hẹn", description: "Cho phép chỉnh sửa lịch hẹn" },
    { slug: "booking.delete", groupName: "Lịch hẹn", name: "Xóa lịch hẹn", description: "Cho phép hủy/xóa lịch hẹn" },

    { slug: "pos.view", groupName: "Bán hàng POS", name: "Truy cập POS", description: "Cho phép truy cập màn hình bán hàng POS" },
    { slug: "invoice.view", groupName: "Hóa đơn", name: "Xem hóa đơn", description: "Xem lịch sử danh sách hóa đơn" },
    { slug: "invoice.create", groupName: "Hóa đơn", name: "Tạo hóa đơn", description: "Tạo và in hóa đơn thanh toán" },

    { slug: "customer.view", groupName: "Khách hàng", name: "Xem khách hàng", description: "Xem danh sách khách hàng" },
    { slug: "customer.manage", groupName: "Khách hàng", name: "Quản lý khách hàng", description: "Thêm, sửa, xóa khách hàng" },

    { slug: "service.view", groupName: "Dịch vụ", name: "Xem dịch vụ", description: "Xem danh mục và bảng giá dịch vụ" },
    { slug: "service.manage", groupName: "Dịch vụ", name: "Quản lý dịch vụ", description: "Thêm, sửa, xóa dịch vụ" },

    { slug: "inventory.view", groupName: "Kho hàng", name: "Xem kho hàng", description: "Xem số lượng tồn kho sản phẩm" },
    { slug: "inventory.manage", groupName: "Kho hàng", name: "Quản lý kho hàng", description: "Nhập, xuất, điều chỉnh kho hàng" },

    { slug: "staff.view", groupName: "Nhân sự", name: "Xem nhân sự", description: "Xem danh sách thông tin nhân viên" },
    { slug: "staff.manage", groupName: "Nhân sự", name: "Quản lý nhân sự", description: "Thêm, sửa, xóa và cấu hình lương nhân viên" },

    { slug: "shift.view", groupName: "Lịch trực", name: "Xem lịch trực ca", description: "Xem lịch ca kíp của nhân viên" },
    { slug: "shift.manage", groupName: "Lịch trực", name: "Phân ca xếp lịch", description: "Xếp lịch làm việc và chấm công" },

    { slug: "report.view", groupName: "Báo cáo", name: "Xem báo cáo", description: "Xem báo cáo thống kê doanh thu và hoạt động" },

    { slug: "branch.view", groupName: "Chi nhánh", name: "Xem chi nhánh", description: "Xem danh sách chi nhánh" },
    { slug: "branch.manage", groupName: "Chi nhánh", name: "Quản lý chi nhánh", description: "Thêm, sửa, cấu hình chi nhánh" },
  ];

  const existing = await prisma.permission.findMany({
    where: { deletedAt: null }
  });

  const permissions = [];
  for (const sp of standardPermissions) {
    let found = existing.find(e => e.slug === sp.slug);
    if (!found) {
      found = await prisma.permission.create({
        data: sp
      });
    }
    permissions.push(found);
  }
  cachedPermissions = permissions;
  return permissions;
}

async function getAdminUserId(tenantId: string): Promise<string | null> {
  if (tenantAdminCache.has(tenantId)) {
    return tenantAdminCache.get(tenantId)!;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  let adminUser = await prisma.user.findFirst({
    where: {
      tenantId,
      deletedAt: null,
      OR: [
        { email: tenant?.email ? tenant.email.toLowerCase() : undefined },
        { phone: tenant?.phone ? tenant.phone : undefined }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!adminUser) {
    adminUser = await prisma.user.findFirst({
      where: {
        tenantId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  const adminId = adminUser?.id || null;
  tenantAdminCache.set(tenantId, adminId);
  return adminId;
}

@Controller("api/tenants/:tenantId")
export class StaffController {

  // 1. GET ALL ROLES (AND ENSURE STANDARD ROLES EXIST)
  @Get("roles")
  async getRoles(@Param("tenantId") tenantId: string) {
    try {
      return await ensureStandardRolesAndPermissions(tenantId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch roles: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. GET ALL STAFF MEMBERS
  @Get("staff")
  async getStaff(@Param("tenantId") tenantId: string) {
    try {
      // Ensure standard roles exist first
      await ensureStandardRolesAndPermissions(tenantId);

      const staffList = await prisma.user.findMany({
        where: {
          tenantId,
          deletedAt: null
        },
        include: {
          role: true,
          userBranches: {
            where: {
              deletedAt: null
            },
            include: {
              branch: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      const adminUserId = await getAdminUserId(tenantId);

      // Map to a clean response format
      return staffList.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password || "",
        phone: user.phone || "",
        sex: user.sex || "",
        baseSalary: Number(user.baseSalary),
        status: user.status,
        note: user.note || "",
        avatar: user.avatar || "",
        role: user.role ? { id: user.role.id, name: user.role.name } : null,
        branches: user.userBranches.map((ub) => ({
          id: ub.branch.id,
          name: ub.branch.name
        })),
        isAdmin: user.id === adminUserId,
        createdAt: user.createdAt.toISOString()
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch staff: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. CREATE NEW STAFF MEMBER
  @Post("staff")
  async createStaff(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      email: string;
      password?: string;
      phone?: string;
      sex?: string;
      baseSalary?: number;
      roleId?: string;
      status?: string;
      note?: string;
      branchIds?: string[];
      avatar?: string;
    }
  ) {
    try {
      if (!body.name || !body.email) {
        throw new HttpException("Tên và Email là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      // Check if email already exists for this tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email.toLowerCase(),
          tenantId,
          deletedAt: null
        }
      });

      if (existingUser) {
        throw new HttpException("Email này đã được sử dụng trong hệ thống", HttpStatus.CONFLICT);
      }

      // Default password to 123456 if not provided
      const password = body.password || "123456";

      // Create user
      const user = await prisma.user.create({
        data: {
          tenantId,
          name: body.name,
          email: body.email.toLowerCase(),
          password,
          phone: body.phone || null,
          sex: body.sex || null,
          baseSalary: body.baseSalary || 0,
          roleId: body.roleId || null,
          status: body.status || "ACTIVE",
          note: body.note || null,
          avatar: body.avatar || null
        }
      });

      tenantAdminCache.delete(tenantId);

      // Create settings for user
      await prisma.userSetting.create({
        data: {
          userId: user.id,
          theme: "light",
          language: "vi"
        }
      });

      // Assign to branches
      if (body.branchIds && body.branchIds.length > 0) {
        await prisma.userBranch.createMany({
          data: body.branchIds.map((branchId) => ({
            userId: user.id,
            branchId
          }))
        });
      }

      // Fetch completed user with relation details to return
      const createdUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: true,
          userBranches: {
            where: { deletedAt: null },
            include: { branch: true }
          }
        }
      });

      if (!createdUser) {
        throw new Error("Failed to retrieve created user");
      }

      const adminUserId = await getAdminUserId(tenantId);

      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone || "",
        sex: createdUser.sex || "",
        baseSalary: Number(createdUser.baseSalary),
        status: createdUser.status,
        note: createdUser.note || "",
        avatar: createdUser.avatar || "",
        role: createdUser.role ? { id: createdUser.role.id, name: createdUser.role.name } : null,
        branches: createdUser.userBranches.map((ub) => ({
          id: ub.branch.id,
          name: ub.branch.name
        })),
        isAdmin: createdUser.id === adminUserId,
        createdAt: createdUser.createdAt.toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create staff member: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. UPDATE STAFF MEMBER
  @Put("staff/:id")
  async updateStaff(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      name: string;
      email: string;
      password?: string;
      phone?: string;
      sex?: string;
      baseSalary?: number;
      roleId?: string;
      status?: string;
      note?: string;
      branchIds?: string[];
      avatar?: string;
    }
  ) {
    try {
      if (!body.name || !body.email) {
        throw new HttpException("Tên và Email là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      // Ensure staff member exists
      const existing = await prisma.user.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy thông tin nhân viên", HttpStatus.NOT_FOUND);
      }

      // Check email uniqueness if email changed
      if (body.email.toLowerCase() !== existing.email.toLowerCase()) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: body.email.toLowerCase(),
            tenantId,
            id: { not: id },
            deletedAt: null
          }
        });

        if (emailExists) {
          throw new HttpException("Email này đã được sử dụng bởi nhân viên khác", HttpStatus.CONFLICT);
        }
      }

      // Prepare updates
      const updateData: any = {
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone ?? null,
        sex: body.sex ?? null,
        baseSalary: body.baseSalary ?? 0,
        roleId: body.roleId ?? null,
        status: body.status ?? "ACTIVE",
        note: body.note ?? null,
        updatedAt: new Date()
      };

      if (body.avatar !== undefined) {
        updateData.avatar = body.avatar || null;
      }

      if (body.password && body.password.trim().length > 0) {
        updateData.password = body.password;
      }

      // Update User
      await prisma.user.update({
        where: { id },
        data: updateData
      });

      tenantAdminCache.delete(tenantId);

      // Update user branches: Delete all existing user-branch links, and create new ones
      if (body.branchIds) {
        await prisma.userBranch.deleteMany({
          where: { userId: id }
        });

        if (body.branchIds.length > 0) {
          await prisma.userBranch.createMany({
            data: body.branchIds.map((branchId) => ({
              userId: id,
              branchId
            }))
          });
        }
      }

      // Fetch updated user with relation details to return
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          userBranches: {
            where: { deletedAt: null },
            include: { branch: true }
          }
        }
      });

      if (!updatedUser) {
        throw new Error("Failed to retrieve updated user");
      }

      const adminUserId = await getAdminUserId(tenantId);

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        sex: updatedUser.sex || "",
        baseSalary: Number(updatedUser.baseSalary),
        status: updatedUser.status,
        note: updatedUser.note || "",
        avatar: updatedUser.avatar || "",
        role: updatedUser.role ? { id: updatedUser.role.id, name: updatedUser.role.name } : null,
        branches: updatedUser.userBranches.map((ub) => ({
          id: ub.branch.id,
          name: ub.branch.name
        })),
        isAdmin: updatedUser.id === adminUserId,
        createdAt: updatedUser.createdAt.toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update staff member: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 5. SOFT DELETE STAFF MEMBER
  @Delete("staff/:id")
  async deleteStaff(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      const existing = await prisma.user.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy thông tin nhân viên hoặc đã bị xóa trước đó", HttpStatus.NOT_FOUND);
      }

      // Soft delete user
      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      tenantAdminCache.delete(tenantId);

      // Soft delete branch relationships as well to keep cleanliness
      await prisma.userBranch.updateMany({
        where: { userId: id, deletedAt: null },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Nhân viên đã được xóa thành công" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete staff member: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 6. GET ALL SYSTEM PERMISSIONS
  @Get("permissions")
  async getPermissions() {
    try {
      return await ensureStandardPermissions();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch permissions: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 7. GET PERMISSIONS OF A SPECIFIC ROLE
  @Get("roles/:roleId/permissions")
  async getRolePermissions(@Param("roleId") roleId: string) {
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        select: { permissionId: true }
      });
      return rolePermissions.map(rp => rp.permissionId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch role permissions: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 8. UPDATE PERMISSIONS OF A SPECIFIC ROLE
  @Put("roles/:roleId/permissions")
  async updateRolePermissions(
    @Param("roleId") roleId: string,
    @Body() body: { permissionIds: string[] }
  ) {
    try {
      const { permissionIds } = body;
      if (!Array.isArray(permissionIds)) {
        throw new HttpException("permissionIds must be an array of strings", HttpStatus.BAD_REQUEST);
      }

      // Delete old permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      });

      // Insert new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId
          }))
        });
      }

      return { success: true, message: "Permissions updated successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update role permissions: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 9. CREATE CUSTOM ROLE
  @Post("roles")
  async createRole(
    @Param("tenantId") tenantId: string,
    @Body() body: { name: string; description?: string }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Tên vai trò là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      return await prisma.role.create({
        data: {
          tenantId,
          name: body.name,
          description: body.description || null
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create role: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 10. UPDATE ROLE DETAILS
  @Put("roles/:id")
  async updateRole(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: { name: string; description?: string }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Tên vai trò là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      const existing = await prisma.role.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy vai trò hoặc vai trò đã bị xóa", HttpStatus.NOT_FOUND);
      }

      return await prisma.role.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description ?? null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update role: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 11. DELETE ROLE (SOFT DELETE)
  @Delete("roles/:id")
  async deleteRole(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      const existing = await prisma.role.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Không tìm thấy vai trò hoặc vai trò đã bị xóa", HttpStatus.NOT_FOUND);
      }

      // Check if any users are assigned to this role
      const userCount = await prisma.user.count({
        where: { roleId: id, deletedAt: null }
      });

      if (userCount > 0) {
        throw new HttpException("Không thể xóa vai trò đang được gán cho nhân viên", HttpStatus.BAD_REQUEST);
      }

      await prisma.role.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Xóa vai trò thành công" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete role: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
