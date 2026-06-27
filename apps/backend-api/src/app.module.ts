import { Module } from "@nestjs/common";
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

@Module({
  imports: [ImportEngineModule],
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
    BookingController
  ],
  providers: [AppService],
})
export class AppModule {}

