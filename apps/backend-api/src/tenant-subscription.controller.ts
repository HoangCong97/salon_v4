import { Controller, Get, Post, Put, Body, Param, HttpStatus, HttpException } from "@nestjs/common";
import { prisma } from "@salon/database";
import * as fs from "fs";
import * as path from "path";
import { NotificationGateway } from "./notification.gateway";

@Controller("api/tenants")
export class TenantSubscriptionController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

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

      // Emit WebSocket event to internal admin dashboard
      this.notificationGateway.broadcast("tenant.buy-plan", {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        tenantId,
        tenantName: tenant.name,
        planName: plan.name,
        planCode: plan.code,
        amount: Number(invoice.amount),
        createdAt: invoice.createdAt.toISOString()
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

  // 4. GET TENANT PROFILE / BRAND SETTINGS
  @Get(":tenantId")
  async getTenant(@Param("tenantId") tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new HttpException("Tenant not found", HttpStatus.NOT_FOUND);
      }

      return tenant;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to fetch tenant: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 5. UPDATE TENANT PROFILE / BRAND SETTINGS
  @Put(":tenantId")
  async updateTenant(
    @Param("tenantId") tenantId: string,
    @Body() body: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      brandName?: string;
      slogan?: string;
      logoUrl?: string;
      bannerUrl?: string;
      hotline?: string;
      fanpageUrl?: string;
      instagramUrl?: string;
      tiktokUrl?: string;
      websiteUrl?: string;
    }
  ) {
    try {
      if (!body.name) {
        throw new HttpException("Tenant name is required", HttpStatus.BAD_REQUEST);
      }

      const existing = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!existing) {
        throw new HttpException("Tenant not found", HttpStatus.NOT_FOUND);
      }

      return await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: body.name,
          email: body.email ?? null,
          phone: body.phone ?? null,
          address: body.address ?? null,
          brandName: body.brandName ?? null,
          slogan: body.slogan ?? null,
          logoUrl: body.logoUrl ?? null,
          bannerUrl: body.bannerUrl ?? null,
          hotline: body.hotline ?? null,
          fanpageUrl: body.fanpageUrl ?? null,
          instagramUrl: body.instagramUrl ?? null,
          tiktokUrl: body.tiktokUrl ?? null,
          websiteUrl: body.websiteUrl ?? null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update tenant: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 6. QUICK UPLOAD FILE (BASE64 TO DISK SEPARATED BY CATEGORY OR SUPABASE)
  @Post(":tenantId/upload")
  async uploadFile(
    @Param("tenantId") tenantId: string,
    @Body() body: { file: string; category: string; filename?: string }
  ) {
    try {
      if (!body.file) {
        throw new HttpException("File data is required", HttpStatus.BAD_REQUEST);
      }
      if (!body.category) {
        throw new HttpException("Category is required", HttpStatus.BAD_REQUEST);
      }

      // 1. Convert base64 data to Buffer
      let buffer: Buffer;
      let extension = "png";
      let contentType = "image/png";
      const matches = body.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        contentType = matches[1];
        extension = matches[1].split("/")[1] || "png";
        if (extension === "jpeg") extension = "jpg";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(body.file, "base64");
      }

      // 2. Build directories by category
      let categoryFolder = body.category.toLowerCase();
      if (categoryFolder === "transactions") {
        const todayStr = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
        categoryFolder = path.join("transactions", todayStr);
      }

      // 3. Build unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      let baseName = "file";
      if (body.filename) {
        baseName = path.basename(body.filename, path.extname(body.filename))
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
      }
      const finalFilename = `${baseName}-${uniqueSuffix}.${extension}`;

      // Check if Supabase Storage is configured
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const bucketName = process.env.DATABASE_BUCKET_NAME || "saas-salon-images";
      
      const useSupabase = 
        supabaseUrl && 
        supabaseKey && 
        supabaseKey !== "PLACEHOLDER_CHANGE_ME" && 
        supabaseKey !== "";

      if (useSupabase) {
        console.log(`[Upload] Uploading to Supabase Storage bucket: ${bucketName}...`);
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Build forward-slash path in the bucket (e.g. tenantId/category/filename)
        const uploadPath = `${tenantId}/${categoryFolder.replace(/\\/g, "/")}/${finalFilename}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(uploadPath, buffer, {
            contentType: contentType,
            upsert: true
          });

        if (error) {
          console.error("[Upload] Supabase upload failed, falling back to disk:", error.message);
          // Fallback to disk on upload error
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadPath);

          console.log("[Upload] Supabase upload successful. Public URL:", publicUrl);
          return { url: publicUrl };
        }
      }

      // FALLBACK: Save file to local disk
      console.log("[Upload] Falling back to local disk storage.");
      const uploadDir = path.join(process.cwd(), "uploads", tenantId, categoryFolder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const destFilePath = path.join(uploadDir, finalFilename);
      fs.writeFileSync(destFilePath, buffer);

      const relativeUrl = `/uploads/${tenantId}/${categoryFolder.replace(/\\/g, "/")}/${finalFilename}`;
      const fileUrl = `http://localhost:3000${relativeUrl}`;

      return { url: fileUrl };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to upload file: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
