import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/services")
export class ServiceController {

  // 1. GET ALL SERVICES FOR TENANT (OPTIONAL BRANCH FILTER)
  @Get()
  async getServices(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId?: string
  ) {
    try {
      const whereClause: any = {
        tenantId,
        deletedAt: null
      };

      if (branchId) {
        whereClause.OR = [
          { branchId: branchId },
          { branchId: null } // Include tenant-wide global services too
        ];
      }

      const services = await prisma.service.findMany({
        where: whereClause,
        include: {
          category: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return services.map((s) => ({
        ...s,
        discountPrice: Number(s.price) - Number(s.discountAmount || 0)
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch services: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 1.5. GET ALL PACKAGES FOR TENANT (OPTIONAL BRANCH FILTER)
  @Get("packages")
  async getPackages(
    @Param("tenantId") tenantId: string,
    @Query("branchId") branchId?: string
  ) {
    try {
      const whereClause: any = {
        tenantId,
        deletedAt: null
      };

      if (branchId) {
        whereClause.OR = [
          { branchId: branchId },
          { branchId: null }
        ];
      }

      const packages = await prisma.servicePackage.findMany({
        where: whereClause,
        include: {
          details: {
            include: {
              service: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return packages.map((pkg) => ({
        ...pkg,
        discountPrice: Number(pkg.price) - Number(pkg.discountAmount || 0),
        details: pkg.details.map((detail) => ({
          ...detail,
          service: detail.service ? {
            ...detail.service,
            discountPrice: Number(detail.service.price) - Number(detail.service.discountAmount || 0)
          } : null
        }))
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch service packages: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. CREATE NEW SERVICE
  @Post()
  async createService(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      serviceCategory?: string;
      categoryId?: string;
      price: number;
      discountPrice?: number;
      discountAmount?: number;
      duration?: number;
      imageUrl?: string;
      branchId?: string;
      additionalPrices?: number[];
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Service name is required", HttpStatus.BAD_REQUEST);
      }

      const price = body.price || 0;
      const discountAmount = body.discountAmount ?? (body.discountPrice !== undefined && body.discountPrice !== null ? (price - body.discountPrice) : 0);

      const created = await prisma.service.create({
        data: {
          tenantId,
          branchId: body.branchId || null,
          name: body.name,
          serviceCategory: body.serviceCategory || null,
          categoryId: body.categoryId || null,
          price: price,
          discountAmount: discountAmount,
          additionalPrices: body.additionalPrices ? body.additionalPrices.map(Number) : [],
          duration: body.duration || null,
          imageUrl: body.imageUrl || null
        },
        include: {
          category: true
        }
      });

      return {
        ...created,
        discountPrice: Number(created.price) - Number(created.discountAmount || 0)
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create service: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. UPDATE SERVICE
  @Put(":id")
  async updateService(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      name: string;
      serviceCategory?: string;
      categoryId?: string;
      price: number;
      discountPrice?: number;
      discountAmount?: number;
      duration?: number;
      imageUrl?: string;
      branchId?: string;
      additionalPrices?: number[];
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Service name is required", HttpStatus.BAD_REQUEST);
      }

      // Ensure service exists and belongs to tenant
      const existing = await prisma.service.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Service not found", HttpStatus.NOT_FOUND);
      }

      const price = body.price || 0;
      const discountAmount = body.discountAmount ?? (body.discountPrice !== undefined && body.discountPrice !== null ? (price - body.discountPrice) : 0);

      const updated = await prisma.service.update({
        where: { id },
        data: {
          name: body.name,
          branchId: body.branchId || null,
          serviceCategory: body.serviceCategory ?? null,
          categoryId: body.categoryId ?? null,
          price: price,
          discountAmount: discountAmount,
          additionalPrices: body.additionalPrices ? body.additionalPrices.map(Number) : undefined,
          duration: body.duration || null,
          imageUrl: body.imageUrl ?? null,
          updatedAt: new Date()
        },
        include: {
          category: true
        }
      });

      return {
        ...updated,
        discountPrice: Number(updated.price) - Number(updated.discountAmount || 0)
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update service: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. SOFT DELETE SERVICE
  @Delete(":id")
  async deleteService(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      // Ensure service exists and belongs to tenant
      const existing = await prisma.service.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Service not found or already deleted", HttpStatus.NOT_FOUND);
      }

      await prisma.service.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Service deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete service: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
