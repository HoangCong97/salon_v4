import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import { NotificationGateway } from "./notification.gateway";

@Controller("api/super-admin")
export class SuperAdminController {
  constructor(private readonly notificationGateway: NotificationGateway) {}
  
  // 1. GET DASHBOARD STATS
  @Get("dashboard/stats")
  async getDashboardStats() {
    try {
      // Parallel DB queries for tenants data, branch count, and booking count
      const [tenants, totalBranches, totalBookings] = await Promise.all([
        prisma.tenant.findMany({
          where: { deletedAt: null },
          select: {
            status: true,
            plan: {
              select: {
                code: true,
                price: true
              }
            }
          }
        }),
        prisma.branch.count({ where: { deletedAt: null } }),
        prisma.booking.count({ where: { deletedAt: null } })
      ]);

      // Calculate stats in a single pass in-memory
      const totalTenantsCount = tenants.length;
      let activeTenantsCount = 0;
      let suspendedTenantsCount = 0;
      let pendingTenantsCount = 0;
      let mrr = 0;
      const plansDistribution = { premium: 0, basic: 0, free: 0 };

      for (const t of tenants) {
        if (t.status === "ACTIVE") {
          activeTenantsCount++;
          if (t.plan) {
            mrr += Number(t.plan.price);
          }
        } else if (t.status === "SUSPENDED") {
          suspendedTenantsCount++;
        } else if (t.status === "PENDING") {
          pendingTenantsCount++;
        }

        const planCode = t.plan ? t.plan.code.toUpperCase() : "FREE";
        if (planCode === "PREMIUM") {
          plansDistribution.premium++;
        } else if (planCode === "BASIC") {
          plansDistribution.basic++;
        } else {
          plansDistribution.free++;
        }
      }

      return {
        mrr,
        totalTenants: totalTenantsCount,
        activeTenants: activeTenantsCount,
        suspendedTenants: suspendedTenantsCount,
        pendingTenants: pendingTenantsCount,
        totalBranches,
        totalBookings,
        plansDistribution,
        uptime: "99.98%"
      };
    } catch (error) {
      throw new HttpException(`Failed to fetch stats: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 1b. GET DASHBOARD HEALTH
  @Get("dashboard/health")
  async getDashboardHealth() {
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;

      const aiUrl = process.env.AI_BASE_URL || "https://api.deepseek.com";

      const [twilio, sendgrid, vnpay, ai] = await Promise.all([
        this.pingServiceHelper("https://api.twilio.com"),
        this.pingServiceHelper("https://api.sendgrid.com"),
        this.pingServiceHelper("https://sandbox.vnpayment.vn"),
        this.pingServiceHelper(aiUrl)
      ]);

      return {
        database: { status: "UP", latency: dbLatency },
        twilio,
        sendgrid,
        vnpay,
        ai
      };
    } catch (error) {
      throw new HttpException(`Failed to fetch health metrics: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 1c. INDIVIDUAL DYNAMIC HEALTH CHECKS
  @Get("dashboard/health/database")
  async getDatabaseHealth() {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "UP", latency: Date.now() - start };
    } catch (error) {
      return { status: "DOWN", latency: Date.now() - start };
    }
  }

  @Get("dashboard/health/twilio")
  async getTwilioHealth() {
    return this.pingServiceHelper("https://api.twilio.com");
  }

  @Get("dashboard/health/sendgrid")
  async getSendgridHealth() {
    return this.pingServiceHelper("https://api.sendgrid.com");
  }

  @Get("dashboard/health/vnpay")
  async getVnpayHealth() {
    return this.pingServiceHelper("https://sandbox.vnpayment.vn");
  }

  @Get("dashboard/health/ai")
  async getAiHealth() {
    const aiUrl = process.env.AI_BASE_URL || "https://api.deepseek.com";
    return this.pingServiceHelper(aiUrl);
  }

  private async pingServiceHelper(url: string): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: { "User-Agent": "Node-Fetch" }
      });
      clearTimeout(timeoutId);
      const latency = Date.now() - start;
      if (res.status >= 500) {
        return { status: "DOWN", latency };
      }
      return { status: "UP", latency };
    } catch (error) {
      clearTimeout(timeoutId);
      return { status: "DOWN", latency: Date.now() - start };
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
    @Body() body: { price: number; maxBranches: any; maxStaff: any; features?: string[] }
  ) {
    try {
      // Parse values
      let maxBranchesInt = 1;
      if (typeof body.maxBranches === "number") {
        maxBranchesInt = body.maxBranches;
      } else if (typeof body.maxBranches === "string") {
        maxBranchesInt = body.maxBranches.includes("Không giới hạn") ? -1 : parseInt(body.maxBranches) || 1;
      }

      let maxStaffInt = 5;
      if (typeof body.maxStaff === "number") {
        maxStaffInt = body.maxStaff;
      } else if (typeof body.maxStaff === "string") {
        maxStaffInt = body.maxStaff.includes("Không giới hạn") ? -1 : parseInt(body.maxStaff) || 5;
      }

      const updateData: any = {
        price: body.price,
        maxBranches: maxBranchesInt,
        maxStaff: maxStaffInt,
        updatedAt: new Date()
      };

      if (body.features) {
        updateData.features = body.features;
      }

      return await prisma.saasPlan.update({
        where: { id },
        data: updateData
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
      return tenantsList.map((t: any) => ({
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

      // Emit WebSocket event
      this.notificationGateway.broadcast("tenant.created", {
        id: tenant.id,
        name: tenant.name,
        owner: tenant.ownerName,
        phone: tenant.phone,
        email: tenant.email,
        planCode: tenant.plan ? tenant.plan.code : "FREE",
        createdAt: tenant.createdAt.toISOString()
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

      // Emit WebSocket event
      this.notificationGateway.broadcast("tenant.status-updated", {
        id: updated.id,
        name: updated.name,
        status: updated.status
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

      // Emit WebSocket event
      this.notificationGateway.broadcast("tenant.plan-changed", {
        id: updated.id,
        name: updated.name,
        planCode: updated.plan ? updated.plan.code : "FREE"
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

      return invoicesList.map((inv: any) => ({
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

      // Automatically activate or renew the tenant's SaaS plan upon invoice approval
      if (updated.planId && updated.tenantId) {
        const planStartedAt = new Date();
        const planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + 1); // 30 days plan duration

        await prisma.tenant.update({
          where: { id: updated.tenantId },
          data: {
            planId: updated.planId,
            planStatus: "ACTIVE",
            planStartedAt,
            planExpiresAt,
            updatedAt: new Date()
          }
        });
      }

      // Emit WebSocket event
      this.notificationGateway.broadcast("invoice.approved", {
        id: updated.invoiceNumber,
        dbId: updated.id,
        salonName: updated.tenant.name,
        tenantId: updated.tenantId,
        planName: updated.plan ? updated.plan.name : "Free",
        amount: Number(updated.amount),
        date: updated.createdAt.toISOString(),
        status: updated.paymentStatus,
        paymentMethod: updated.paymentMethod || "Chuyển khoản ngân hàng"
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

  // 10. UPDATE TENANT DETAILS
  @Put("tenants/:id")
  async updateTenant(
    @Param("id") id: string,
    @Body() body: { name: string; owner: string; phone: string; email: string; address: string }
  ) {
    try {
      const updated = await prisma.tenant.update({
        where: { id },
        data: {
          name: body.name,
          ownerName: body.owner,
          phone: body.phone,
          email: body.email,
          address: body.address,
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
      throw new HttpException(`Failed to update tenant: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 11. DELETE TENANT (SOFT DELETE)
  @Delete("tenants/:id")
  async deleteTenant(@Param("id") id: string) {
    try {
      await prisma.tenant.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });
      return { id };
    } catch (error) {
      throw new HttpException(`Failed to delete tenant: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 12. GET INVOICES FOR A TENANT
  @Get("tenants/:id/invoices")
  async getTenantInvoices(@Param("id") id: string) {
    try {
      const invoicesList = await prisma.saasInvoice.findMany({
        where: { tenantId: id, deletedAt: null },
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      });
      return invoicesList.map((inv: any) => ({
        id: inv.invoiceNumber,
        dbId: inv.id,
        planName: inv.plan ? inv.plan.name : "Free",
        amount: Number(inv.amount),
        date: inv.createdAt.toISOString(),
        status: inv.paymentStatus,
        paymentMethod: inv.paymentMethod || "Chưa xác định"
      }));
    } catch (error) {
      throw new HttpException(`Failed to fetch tenant invoices: ${(error as any).message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
