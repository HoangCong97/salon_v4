import { Controller, Get, Post, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";

@Controller("api/tenants")
export class TenantSubscriptionController {

  // 1. GET TENANT SUBSCRIPTION STATUS AND RESOURCE LIMITS
  @Get(":tenantId/subscription")
  async getSubscription(@Param("tenantId") tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true }
      });

      if (!tenant) {
        throw new HttpException("Tenant not found", HttpStatus.NOT_FOUND);
      }

      // Count active branches and staff (users) for this tenant
      const [currentBranchesCount, currentStaffCount] = await Promise.all([
        prisma.branch.count({
          where: { tenantId, deletedAt: null }
        }),
        prisma.user.count({
          where: { tenantId, deletedAt: null }
        })
      ]);

      // Calculate status based on planExpiresAt date (safety fallback)
      let planStatus = tenant.planStatus || "TRIAL";
      if (tenant.planExpiresAt && new Date() > new Date(tenant.planExpiresAt)) {
        planStatus = "EXPIRED";
      }

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        planId: tenant.planId,
        planName: tenant.plan ? tenant.plan.name : "Dùng Thử (Free Trial)",
        planCode: tenant.plan ? tenant.plan.code : "FREE",
        planPrice: tenant.plan ? Number(tenant.plan.price) : 0,
        planStartedAt: tenant.planStartedAt ? tenant.planStartedAt.toISOString() : null,
        planExpiresAt: tenant.planExpiresAt ? tenant.planExpiresAt.toISOString() : null,
        planStatus,
        maxBranches: tenant.plan ? tenant.plan.maxBranches : 1,
        maxStaff: tenant.plan ? tenant.plan.maxStaff : 5,
        currentBranchesCount,
        currentStaffCount,
        features: tenant.plan ? tenant.plan.features : [
          "Đặt lịch trực tuyến cơ bản",
          "Báo cáo doanh thu ngày",
          "Phân quyền Nhân viên/Khách hàng",
          "Thời hạn: 14 ngày"
        ]
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch subscription: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 2. GET ALL PLANS (PUBLIC FOR TENANTS TO CHOOSE/COMPARE)
  @Get("plans")
  async getPlans() {
    try {
      const plans = await prisma.saasPlan.findMany({
        where: { deletedAt: null },
        orderBy: { price: "asc" }
      });
      return plans.map(p => ({
        ...p,
        price: Number(p.price)
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch plans: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 3. CREATE PENDING PURCHASE INVOICE FOR A PACKAGE
  @Post(":tenantId/buy-plan")
  async buyPlan(
    @Param("tenantId") tenantId: string,
    @Body() body: { planCode: string }
  ) {
    try {
      const { planCode } = body;
      if (!planCode) {
        throw new HttpException("Plan code is required", HttpStatus.BAD_REQUEST);
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new HttpException("Tenant not found", HttpStatus.NOT_FOUND);
      }

      const plan = await prisma.saasPlan.findFirst({
        where: { code: planCode.toUpperCase(), deletedAt: null }
      });

      if (!plan) {
        throw new HttpException("Plan not found", HttpStatus.NOT_FOUND);
      }

      // Generate invoice number
      const count = await prisma.saasInvoice.count();
      const year = new Date().getFullYear();
      const invoiceNumber = `INV-SAAS-${year}-${String(count + 1).padStart(4, "0")}`;

      const invoice = await prisma.saasInvoice.create({
        data: {
          tenantId,
          planId: plan.id,
          amount: plan.price,
          paymentMethod: "Chuyển khoản ngân hàng",
          paymentStatus: "PENDING",
          invoiceNumber
        },
        include: {
          plan: true
        }
      });

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(invoice.amount),
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        planName: plan.name,
        planCode: plan.code,
        createdAt: invoice.createdAt.toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to create purchase invoice: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
