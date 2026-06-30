import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import { NotificationGateway } from "./notification.gateway";

@Controller("api/tenants/:tenantId/inventories")
export class InventoryController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

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

      const inventories = await prisma.inventory.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc"
        }
      });

      return inventories.map((item) => ({
        ...item,
        discountPrice: Number(item.sellPrice) - Number(item.discountAmount || 0)
      }));
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
    @Headers("x-user-id") senderId: string,
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

      const sellPrice = body.sellPrice || 0;
      const discountPrice = body.discountPrice !== undefined && body.discountPrice !== null ? body.discountPrice : sellPrice;
      const discountAmount = Math.max(0, sellPrice - discountPrice);

      const created = await prisma.inventory.create({
        data: {
          tenantId,
          branchId: body.branchId || null,
          name: body.name,
          costPrice: body.costPrice || 0,
          sellPrice: sellPrice,
          quantity: body.quantity ?? 0,
          discountAmount: discountAmount,
          imageUrl: body.imageUrl || null
        }
      });

      this.notificationGateway.broadcastToTenant(tenantId, "inventories.updated", { branchId: created.branchId, senderId });

      return {
        ...created,
        discountPrice: Number(created.sellPrice) - Number(created.discountAmount || 0)
      };
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
    @Headers("x-user-id") senderId: string,
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

      const sellPrice = body.sellPrice || 0;
      const discountPrice = body.discountPrice !== undefined && body.discountPrice !== null ? body.discountPrice : sellPrice;
      const discountAmount = Math.max(0, sellPrice - discountPrice);

      const updated = await prisma.inventory.update({
        where: { id },
        data: {
          name: body.name,
          branchId: body.branchId || null,
          costPrice: body.costPrice || 0,
          sellPrice: sellPrice,
          quantity: body.quantity ?? 0,
          discountAmount: discountAmount,
          imageUrl: body.imageUrl ?? null,
          updatedAt: new Date()
        }
      });

      this.notificationGateway.broadcastToTenant(tenantId, "inventories.updated", { branchId: updated.branchId, senderId });

      return {
        ...updated,
        discountPrice: Number(updated.sellPrice) - Number(updated.discountAmount || 0)
      };
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
    @Param("id") id: string,
    @Headers("x-user-id") senderId: string
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

      this.notificationGateway.broadcastToTenant(tenantId, "inventories.updated", { branchId: existing.branchId, senderId });

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
