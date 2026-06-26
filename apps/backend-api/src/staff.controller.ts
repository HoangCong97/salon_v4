import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

// Helper function to ensure standard roles exist for a tenant
async function ensureStandardRoles(tenantId: string) {
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
    }
    roles.push(found);
  }
  return roles;
}

// Helper function to ensure system-wide standard permissions exist
async function ensureStandardPermissions() {
  const standardPermissions = [
    { slug: "booking.create", groupName: "Booking", name: "Tạo lịch hẹn", description: "Cho phép đặt lịch hẹn mới" },
    { slug: "booking.view", groupName: "Booking", name: "Xem lịch hẹn", description: "Xem danh sách lịch hẹn" },
    { slug: "invoice.create", groupName: "Invoice", name: "Tạo hóa đơn", description: "Tạo và in hóa đơn thanh toán" },
    { slug: "report.view", groupName: "Report", name: "Xem báo cáo", description: "Xem báo cáo thống kê doanh thu" },
    { slug: "staff.manage", groupName: "Staff", name: "Quản lý nhân viên", description: "Quản lý thợ và phân ca ca kíp" }
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
  return permissions;
}

async function getAdminUserId(tenantId: string): Promise<string | null> {
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

  return adminUser?.id || null;
}

@Controller("api/tenants/:tenantId")
export class StaffController {

  // 1. GET ALL ROLES (AND ENSURE STANDARD ROLES EXIST)
  @Get("roles")
  async getRoles(@Param("tenantId") tenantId: string) {
    try {
      return await ensureStandardRoles(tenantId);
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
      await ensureStandardRoles(tenantId);

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
