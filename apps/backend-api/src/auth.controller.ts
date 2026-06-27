import { Controller, Post, Body, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import { ensureStandardRolesAndPermissions } from "./staff.controller";

@Controller("api/auth")
export class AuthController {

  @Post("login")
  async login(@Body() body: { email?: string; password?: string }) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        throw new HttpException("Email and password are required", HttpStatus.BAD_REQUEST);
      }

      // Query user first to check credentials
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          deletedAt: null
        }
      });

      if (!user) {
        throw new HttpException("Tài khoản không tồn tại trong hệ thống", HttpStatus.UNAUTHORIZED);
      }

      // Plaintext password comparison for local development
      if (user.password !== password) {
        throw new HttpException("Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED);
      }

      if (user.status !== "ACTIVE") {
        throw new HttpException("Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);
      }

      // Ensure all standard roles and permissions exist for this tenant
      await ensureStandardRolesAndPermissions(user.tenantId);

      // Re-query user and join with their role and permissions
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
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

      if (!fullUser) {
        throw new HttpException("Không tìm thấy thông tin người dùng", HttpStatus.NOT_FOUND);
      }

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
