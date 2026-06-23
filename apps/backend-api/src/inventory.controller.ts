import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/inventories")
export class InventoryController {

  // 1. GET ALL INVENTORY ITEMS FOR TENANT (OPTIONAL BRANCH FILTER)
  @Get()
  async getInventories(
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
          { branchId: null } // Include tenant-wide global inventory items too
        ];
      }

      return await prisma.inventory.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc"
        }
      });
    } catch (error) {
      throw new HttpException(
        `Failed to fetch inventory: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. ADD NEW PRODUCT TO INVENTORY
  @Post()
  async createInventory(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      costPrice: number;
      sellPrice: number;
      quantity: number;
      discountPrice?: number;
      imageUrl?: string;
      branchId?: string;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Product name is required", HttpStatus.BAD_REQUEST);
      }

      return await prisma.inventory.create({
        data: {
          tenantId,
          branchId: body.branchId || null,
          name: body.name,
          costPrice: body.costPrice || 0,
          sellPrice: body.sellPrice || 0,
          quantity: body.quantity ?? 0,
          discountPrice: body.discountPrice ?? body.sellPrice ?? 0,
          imageUrl: body.imageUrl || null
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to add inventory: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. UPDATE/ADJUST PRODUCT INVENTORY
  @Put(":id")
  async updateInventory(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      name: string;
      costPrice: number;
      sellPrice: number;
      quantity: number;
      discountPrice?: number;
      imageUrl?: string;
      branchId?: string;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Product name is required", HttpStatus.BAD_REQUEST);
      }

      // Ensure item exists and belongs to tenant
      const existing = await prisma.inventory.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
      }

      return await prisma.inventory.update({
        where: { id },
        data: {
          name: body.name,
          branchId: body.branchId || null,
          costPrice: body.costPrice || 0,
          sellPrice: body.sellPrice || 0,
          quantity: body.quantity ?? 0,
          discountPrice: body.discountPrice ?? body.sellPrice ?? 0,
          imageUrl: body.imageUrl ?? null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update inventory: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. SOFT DELETE INVENTORY ITEM
  @Delete(":id")
  async deleteInventory(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      // Ensure item exists and belongs to tenant
      const existing = await prisma.inventory.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Product not found or already deleted", HttpStatus.NOT_FOUND);
      }

      await prisma.inventory.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete product: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
