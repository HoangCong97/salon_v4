import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SuperAdminController } from "./super-admin.controller";

@Module({
  imports: [],
  controllers: [AppController, SuperAdminController],
  providers: [AppService],
})
export class AppModule {}
