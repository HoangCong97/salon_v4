import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/service-categories")
export class ServiceCategoryController {

  // 1. GET ALL CATEGORIES FOR TENANT
  @Get()
  async getCategories(@Param("tenantId") tenantId: string) {
    try {
      return await prisma.serviceCategory.findMany({
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
        `Failed to fetch service categories: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. CREATE NEW SERVICE CATEGORY
  @Post()
  async createCategory(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      color: string;
      defaultCommission?: number;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Category name is required", HttpStatus.BAD_REQUEST);
      }
      if (!body.color) {
        throw new HttpException("Category color is required", HttpStatus.BAD_REQUEST);
      }

      return await prisma.serviceCategory.create({
        data: {
          tenantId,
          name: body.name,
          color: body.color,
          defaultCommission: body.defaultCommission || 0
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create service category: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. UPDATE SERVICE CATEGORY
  @Put(":id")
  async updateCategory(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      name: string;
      color: string;
      defaultCommission?: number;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Category name is required", HttpStatus.BAD_REQUEST);
      }
      if (!body.color) {
        throw new HttpException("Category color is required", HttpStatus.BAD_REQUEST);
      }

      // Ensure category exists and belongs to tenant
      const existing = await prisma.serviceCategory.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Service category not found", HttpStatus.NOT_FOUND);
      }

      return await prisma.serviceCategory.update({
        where: { id },
        data: {
          name: body.name,
          color: body.color,
          defaultCommission: body.defaultCommission ?? 0,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update service category: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. SOFT DELETE SERVICE CATEGORY
  @Delete(":id")
  async deleteCategory(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      // Ensure category exists and belongs to tenant
      const existing = await prisma.serviceCategory.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Service category not found or already deleted", HttpStatus.NOT_FOUND);
      }

      await prisma.serviceCategory.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Service category deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete service category: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
