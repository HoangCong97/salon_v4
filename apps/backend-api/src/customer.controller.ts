import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/customers")
export class CustomerController {

  // 1. GET ALL CUSTOMERS FOR TENANT (OPTIONAL BRANCH FILTER)
  @Get()
  async getCustomers(
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
          { branchId: null } // Include tenant-wide global customers too
        ];
      }

      const customers = await prisma.customer.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc"
        }
      });

      return customers;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch customers: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. CREATE NEW CUSTOMER
  @Post()
  async createCustomer(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      phone?: string;
      email?: string;
      password?: string;
      credibilityScore?: number;
      branchId?: string;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Customer name is required", HttpStatus.BAD_REQUEST);
      }

      const created = await prisma.customer.create({
        data: {
          tenantId,
          branchId: body.branchId || null,
          name: body.name,
          phone: body.phone || null,
          email: body.email || null,
          password: body.password || null,
          credibilityScore: body.credibilityScore !== undefined ? Number(body.credibilityScore) : 100
        }
      });

      return created;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create customer: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. UPDATE CUSTOMER
  @Put(":id")
  async updateCustomer(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: {
      name: string;
      phone?: string;
      email?: string;
      password?: string;
      credibilityScore?: number;
      branchId?: string;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Customer name is required", HttpStatus.BAD_REQUEST);
      }

      // Ensure customer exists and belongs to tenant
      const existing = await prisma.customer.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Customer not found", HttpStatus.NOT_FOUND);
      }

      const updated = await prisma.customer.update({
        where: { id },
        data: {
          name: body.name,
          branchId: body.branchId || null,
          phone: body.phone ?? null,
          email: body.email ?? null,
          password: body.password ?? null,
          credibilityScore: body.credibilityScore !== undefined ? Number(body.credibilityScore) : undefined,
          updatedAt: new Date()
        }
      });

      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update customer: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 4. SOFT DELETE CUSTOMER
  @Delete(":id")
  async deleteCustomer(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    try {
      // Ensure customer exists and belongs to tenant
      const existing = await prisma.customer.findFirst({
        where: { id, tenantId, deletedAt: null }
      });

      if (!existing) {
        throw new HttpException("Customer not found or already deleted", HttpStatus.NOT_FOUND);
      }

      await prisma.customer.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to delete customer: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
