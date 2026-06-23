import { Controller, Get, Post, Put, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/super-admin")
export class SuperAdminController {
  
  // 1. GET DASHBOARD STATS
  @Get("dashboard/stats")
  async getDashboardStats() {
    try {
      // MRR: Sum plan prices for ACTIVE tenants
      const activeTenants = await prisma.tenant.findMany({
        where: { status: "ACTIVE", deletedAt: null },
        include: { plan: true }
      });
      const mrr = activeTenants.reduce((sum, t) => sum + (t.plan ? Number(t.plan.price) : 0), 0);

      // Total Tenants & Active/Suspended counts
      const totalTenantsCount = await prisma.tenant.count({ where: { deletedAt: null } });
      const activeTenantsCount = activeTenants.length;
      const suspendedTenantsCount = await prisma.tenant.count({ where: { status: "SUSPENDED", deletedAt: null } });
      const pendingTenantsCount = await prisma.tenant.count({ where: { status: "PENDING", deletedAt: null } });

      // Total Branches
      const totalBranches = await prisma.branch.count({ where: { deletedAt: null } });

      // Total Bookings on the platform
      const totalBookings = await prisma.booking.count({ where: { deletedAt: null } });

      return {
        mrr,
        totalTenants: totalTenantsCount,
        activeTenants: activeTenantsCount,
        suspendedTenants: suspendedTenantsCount,
        pendingTenants: pendingTenantsCount,
        totalBranches,
        totalBookings,
        uptime: "99.98%"
      };
    } catch (error) {
      throw new HttpException(`Failed to fetch stats: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 2. GET ALL SAAS PLANS
  @Get("plans")
  async getPlans() {
    try {
      return await prisma.saasPlan.findMany({
        where: { deletedAt: null },
        orderBy: { price: "asc" }
      });
    } catch (error) {
      throw new HttpException(`Failed to fetch plans: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. UPDATE SAAS PLAN QUOTAS & PRICE
  @Put("plans/:id")
  async updatePlan(
    @Param("id") id: string,
    @Body() body: { price: number; maxBranches: string; maxStaff: string }
  ) {
    try {
      // Parse values
      const maxBranchesInt = body.maxBranches.includes("Không giới hạn") ? -1 : parseInt(body.maxBranches) || 1;
      const maxStaffInt = body.maxStaff.includes("Không giới hạn") ? -1 : parseInt(body.maxStaff) || 5;

      return await prisma.saasPlan.update({
        where: { id },
        data: {
          price: body.price,
          maxBranches: maxBranchesInt,
          maxStaff: maxStaffInt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new HttpException(`Failed to update plan: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. GET ALL TENANTS
  @Get("tenants")
  async getTenants() {
    try {
      const tenantsList = await prisma.tenant.findMany({
        where: { deletedAt: null },
        include: {
          plan: true,
          _count: {
            select: { branches: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // Map count property to match frontend expectations
      return tenantsList.map(t => ({
        id: t.id,
        name: t.name,
        owner: t.ownerName || "Chưa thiết lập",
        phone: t.phone || "",
        email: t.email || "",
        address: t.address || "",
        status: t.status,
        plan: t.plan ? t.plan.code : "FREE",
        branchesCount: t._count.branches,
        createdAt: t.createdAt.toISOString()
      }));
    } catch (error) {
      throw new HttpException(`Failed to fetch tenants: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 5. CREATE NEW TENANT (SALON)
  @Post("tenants")
  async createTenant(
    @Body() body: { name: string; owner: string; phone: string; email: string; plan: string; address: string }
  ) {
    try {
      // Find the plan by code
      const plan = await prisma.saasPlan.findFirst({
        where: { code: body.plan.toUpperCase(), deletedAt: null }
      });

      const tenant = await prisma.tenant.create({
        data: {
          name: body.name,
          ownerName: body.owner,
          phone: body.phone,
          email: body.email,
          address: body.address,
          status: "ACTIVE",
          planId: plan ? plan.id : null
        },
        include: {
          plan: true
        }
      });

      // Auto-create a default branch for the new salon tenant
      await prisma.branch.create({
        data: {
          tenantId: tenant.id,
          name: `${body.name} - Chi nhánh Trụ Sở`,
          phone: body.phone,
          email: body.email,
          address: body.address
        }
      });

      return {
        id: tenant.id,
        name: tenant.name,
        owner: tenant.ownerName,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address,
        status: tenant.status,
        plan: tenant.plan ? tenant.plan.code : "FREE",
        branchesCount: 1,
        createdAt: tenant.createdAt.toISOString()
      };
    } catch (error) {
      throw new HttpException(`Failed to create tenant: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 6. TOGGLE TENANT STATUS (ACTIVE / SUSPENDED)
  @Put("tenants/:id/status")
  async toggleTenantStatus(
    @Param("id") id: string,
    @Body() body: { status: string }
  ) {
    try {
      const updated = await prisma.tenant.update({
        where: { id },
        data: {
          status: body.status,
          updatedAt: new Date()
        },
        include: {
          plan: true,
          _count: {
            select: { branches: true }
          }
        }
      });

      return {
        id: updated.id,
        name: updated.name,
        owner: updated.ownerName || "Chưa thiết lập",
        phone: updated.phone || "",
        email: updated.email || "",
        address: updated.address || "",
        status: updated.status,
        plan: updated.plan ? updated.plan.code : "FREE",
        branchesCount: updated._count.branches,
        createdAt: updated.createdAt.toISOString()
      };
    } catch (error) {
      throw new HttpException(`Failed to toggle tenant status: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 7. CHANGE TENANT PLAN
  @Put("tenants/:id/plan")
  async changeTenantPlan(
    @Param("id") id: string,
    @Body() body: { planCode: string }
  ) {
    try {
      // Find the plan by code
      const plan = await prisma.saasPlan.findFirst({
        where: { code: body.planCode.toUpperCase(), deletedAt: null }
      });

      if (!plan) {
        throw new HttpException("Plan not found", HttpStatus.NOT_FOUND);
      }

      const updated = await prisma.tenant.update({
        where: { id },
        data: {
          planId: plan.id,
          updatedAt: new Date()
        },
        include: {
          plan: true,
          _count: {
            select: { branches: true }
          }
        }
      });

      return {
        id: updated.id,
        name: updated.name,
        owner: updated.ownerName || "Chưa thiết lập",
        phone: updated.phone || "",
        email: updated.email || "",
        address: updated.address || "",
        status: updated.status,
        plan: updated.plan ? updated.plan.code : "FREE",
        branchesCount: updated._count.branches,
        createdAt: updated.createdAt.toISOString()
      };
    } catch (error) {
      throw new HttpException(`Failed to change tenant plan: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 8. GET ALL SAAS BILLING INVOICES
  @Get("invoices")
  async getInvoices() {
    try {
      const invoicesList = await prisma.saasInvoice.findMany({
        where: { deletedAt: null },
        include: {
          tenant: true,
          plan: true
        },
        orderBy: { createdAt: "desc" }
      });

      return invoicesList.map(inv => ({
        id: inv.invoiceNumber,
        dbId: inv.id, // Keep the primary key UUID for backend calls
        salonName: inv.tenant.name,
        planName: inv.plan ? inv.plan.name.replace("Gói ", "").replace(" (Free Trial)", "").replace(" (Basic)", "").replace(" (Premium)", "") : "Free",
        amount: Number(inv.amount),
        date: inv.createdAt.toISOString(),
        status: inv.paymentStatus,
        paymentMethod: inv.paymentMethod || "Chưa xác định"
      }));
    } catch (error) {
      throw new HttpException(`Failed to fetch invoices: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 9. APPROVE SAAS INVOICE PAYMENT
  @Put("invoices/:id/approve")
  async approveInvoice(@Param("id") id: string) {
    try {
      // ID here can be the invoiceNumber (e.g., INV-2026-001)
      const inv = await prisma.saasInvoice.findFirst({
        where: { invoiceNumber: id, deletedAt: null }
      });

      if (!inv) {
        throw new HttpException("Invoice not found", HttpStatus.NOT_FOUND);
      }

      const updated = await prisma.saasInvoice.update({
        where: { id: inv.id },
        data: {
          paymentStatus: "PAID",
          updatedAt: new Date()
        },
        include: {
          tenant: true,
          plan: true
        }
      });

      return {
        id: updated.invoiceNumber,
        dbId: updated.id,
        salonName: updated.tenant.name,
        planName: updated.plan ? updated.plan.name : "Free",
        amount: Number(updated.amount),
        date: updated.createdAt.toISOString(),
        status: updated.paymentStatus,
        paymentMethod: updated.paymentMethod || "Chưa xác định"
      };
    } catch (error) {
      throw new HttpException(`Failed to approve invoice: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
