import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/branches")
export class BranchController {
  
  // 1. GET ALL BRANCHES FOR TENANT
  @Get()
  async getBranches(@Param("tenantId") tenantId: string) {
    try {
      return await prisma.branch.findMany({
        where: {
          tenantId,
          deletedAt: null
        },
        orderBy: {
          createdAt: "asc"
        }
      });
    } catch (error) {
      throw new HttpException(
        `Failed to fetch branches: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. CREATE NEW BRANCH
  @Post()
  async createBranch(
    @Param("tenantId") tenantId: string,
    @Body() body: { name: string; phone?: string; email?: string; address?: string }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Branch name is required", HttpStatus.BAD_REQUEST);
      }

      return await prisma.branch.create({
        data: {
          tenantId,
          name: body.name,
          phone: body.phone || null,
          email: body.email || null,
          address: body.address || null
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create branch: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. UPDATE BRANCH
  @Put(":id")
  async updateBranch(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: { name: string; phone?: string; email?: string; address?: string }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Branch name is required", HttpStatus.BAD_REQUEST);
      }

      // Ensure branch exists and belongs to this tenant
      const existing = await prisma.branch.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Branch not found", HttpStatus.NOT_FOUND);
      }

      return await prisma.branch.update({
        where: { id },
        data: {
          name: body.name,
          phone: body.phone ?? null,
          email: body.email ?? null,
          address: body.address ?? null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update branch: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. SOFT DELETE BRANCH
  @Delete(":id")
  async deleteBranch(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      // Ensure branch exists and belongs to this tenant
      const existing = await prisma.branch.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Branch not found or already deleted", HttpStatus.NOT_FOUND);
      }

      await prisma.branch.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Branch deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete branch: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
