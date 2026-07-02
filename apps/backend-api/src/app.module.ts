import { Module, NestModule, MiddlewareConsumer, RequestMethod, HttpStatus, HttpException } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SuperAdminController } from "./super-admin.controller";
import { BranchController } from "./branch.controller";
import { ServiceController } from "./service.controller";
import { InventoryController } from "./inventory.controller";
import { AuthController } from "./auth.controller";
import { ServiceCategoryController } from "./service-category.controller";
import { StaffController } from "./staff.controller";
import { ShiftsController } from "./shifts.controller";
import { TurnsController } from "./turns.controller";
import { InvoiceController } from "./invoice.controller";
import { TenantSubscriptionController } from "./tenant-subscription.controller";
import { ImportEngineModule } from "./import-engine/import-engine.module";
import { CustomerController } from "./customer.controller";
import { BookingController } from "./booking.controller";
import { PayrollController } from "./payroll.controller";
import { CustomerPortalController } from "./customer-portal.controller";
import { NotificationModule } from "./notification.module";
import { Request, Response, NextFunction } from "express";

@Module({
  imports: [ImportEngineModule, NotificationModule],
  controllers: [
    AppController, 
    SuperAdminController,
    BranchController,
    ServiceController,
    InventoryController,
    AuthController,
    ServiceCategoryController,
    StaffController,
    ShiftsController,
    TurnsController,
    InvoiceController,
    TenantSubscriptionController,
    CustomerController,
    BookingController,
    PayrollController,
    CustomerPortalController
  ],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const method = req.method;
        const xUserStatus = req.headers["x-user-status"];
        const path = req.path;

        // If user is suspended, block any mutations (POST, PUT, DELETE) except login/auth paths
        if (
          xUserStatus === "SUSPENDED" &&
          ["POST", "PUT", "DELETE"].includes(method) &&
          !path.includes("/api/auth/login")
        ) {
          throw new HttpException(
            "Tài khoản đang bị tạm ngưng, không được phép thực hiện thao tác này.",
            HttpStatus.FORBIDDEN
          );
        }
        next();
      })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}


