import { Controller, Post, Body, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import { ensureStandardRolesAndPermissions } from "./staff.controller";

@Controller("api/auth")
export class AuthController {

  @Post("login")
  async login(@Body() body: { tenantRef?: string; loginId?: string; email?: string; password?: string }) {
    try {
      const tenantRef = body.tenantRef;
      const loginIdVal = body.loginId || body.email;
      const { password } = body;

      if (!loginIdVal || !password) {
        throw new HttpException("ID đăng nhập và Mật khẩu là bắt buộc", HttpStatus.BAD_REQUEST);
      }

      let tenantId: string | undefined;
      if (tenantRef && tenantRef.trim().length > 0) {
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { phone: tenantRef.trim() },
              { name: { contains: tenantRef.trim(), mode: 'insensitive' } },
              { brandName: { contains: tenantRef.trim(), mode: 'insensitive' } }
            ],
            deletedAt: null
          }
        });

        if (!tenant) {
          throw new HttpException("Cửa hàng / Thương hiệu không tồn tại", HttpStatus.NOT_FOUND);
        }
        tenantId = tenant.id;
      }

      // Query users matching loginId with role and permissions included in a single query
      const users = await prisma.user.findMany({
        where: {
          loginId: loginIdVal.toLowerCase().trim(),
          tenantId: tenantId,
          deletedAt: null
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      if (users.length === 0) {
        throw new HttpException("Tài khoản không tồn tại trong hệ thống", HttpStatus.UNAUTHORIZED);
      }

      // Find user with correct password if duplicate loginIds exist across tenants
      const fullUser = users.find(u => u.password === password) || users[0];

      // Plaintext password comparison for local development
      if (fullUser.password !== password) {
        throw new HttpException("Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED);
      }

      if (fullUser.status !== "ACTIVE") {
        throw new HttpException("Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);
      }

      // Ensure all standard roles and permissions exist for this tenant (run in background to avoid blocking login latency)
      ensureStandardRolesAndPermissions(fullUser.tenantId).catch(err => {
        console.error("Failed to ensure roles in background:", err);
      });

      // Map role name to standard frontend roles
      let mappedRole: "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE" = "EMPLOYEE";
      if (fullUser.role) {
        const rName = fullUser.role.name.toUpperCase();
        if (rName === "ADMIN" || rName === "SUPER_ADMIN") {
          mappedRole = "ADMIN";
        } else if (rName === "MANAGER") {
          mappedRole = "MANAGER";
        } else if (rName === "CASHIER") {
          mappedRole = "CASHIER";
        }
      }

      // Map all permissions assigned to this user's role
      const permissions = fullUser.role?.permissions.map(rp => rp.permission.slug) || [];

      return {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        loginId: fullUser.loginId,
        role: mappedRole,
        tenantId: fullUser.tenantId,
        avatar: fullUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        permissions
      };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Đăng nhập thất bại: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
