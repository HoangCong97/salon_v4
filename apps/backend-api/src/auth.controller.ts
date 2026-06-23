import { Controller, Post, Body, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/auth")
export class AuthController {

  @Post("login")
  async login(@Body() body: { email?: string; password?: string }) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        throw new HttpException("Email and password are required", HttpStatus.BAD_REQUEST);
      }

      // Query user and join with their role
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          deletedAt: null
        },
        include: {
          role: true
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

      // Map role name to standard frontend roles
      let mappedRole: "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE" = "EMPLOYEE";
      if (user.role) {
        const rName = user.role.name.toUpperCase();
        if (rName === "ADMIN" || rName === "SUPER_ADMIN") {
          mappedRole = "ADMIN";
        } else if (rName === "MANAGER") {
          mappedRole = "MANAGER";
        } else if (rName === "CASHIER") {
          mappedRole = "CASHIER";
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: mappedRole,
        tenantId: user.tenantId,
        avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
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
