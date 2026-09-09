# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE BACKEND (NestJS + Prisma)

Tài liệu này quy định các tiêu chuẩn bắt buộc khi phát triển, mở rộng hoặc sửa lỗi tầng Backend ([`apps/backend-api`](file:///c:/Workspace/salon_v4/apps/backend-api)) trong hệ thống SaaS Salon App (`salon_v4`).

---

### 1. Nguyên Tắc Cơ Bản (General)
- **TypeScript**: `strict: true`. Tuyệt đối không dùng `any` bừa bãi.
- **Tuân thủ chuẩn**: SOLID, DRY, KISS.
- **Công cụ điều tra code**: Trước khi can thiệp vào bất kỳ module nào, hãy gọi MCP tool `codegraph_explore` để kiểm tra các symbols, imports, controller và services liên quan.

---

### 2. Cấu Trúc Thư Mục Chuẩn Cho Một Module
Mỗi domain nghiệp vụ nằm trong `apps/backend-api/src/modules/<feature_name>/` với cấu trúc 4 tầng phân lập rõ ràng:

```text
src/modules/<feature>/
 ├── controller/
 │    └── <feature>.controller.ts      # Tiếp nhận HTTP request, gọi Service, trả response
 ├── service/
 │    └── <feature>.service.ts         # Xử lý toàn bộ business logic, transactions
 ├── repository/
 │    └── <feature>.repository.ts      # Chỉ truy vấn dữ liệu thông qua Prisma Client
 ├── dto/
 │    ├── create-<feature>.dto.ts      # Validate dữ liệu đầu vào (class-validator)
 │    └── update-<feature>.dto.ts
 ├── entities/
 │    └── <feature>.entity.ts          # Định nghĩa kiểu dữ liệu domain hoặc view model
 └── <feature>.module.ts               # Khai báo dependency injection của NestJS
```

---

### 3. Kiến Trúc 4 Tầng & Ranh Giới Trách Nhiệm (Layer Architecture)

```text
HTTP Request
     ↓
Controller     (Chỉ parse DTO, gán Guard/User context, gọi Service, trả DTO response)
     ↓
Service        (Chứa toàn bộ Business Logic, điều phối Repository, phát WebSocket event)
     ↓
Repository     (Chỉ truy vấn cơ sở dữ liệu qua Prisma, không chứa logic nghiệp vụ)
     ↓
Prisma Client  (@salon/database)
     ↓
PostgreSQL
```

> [!CAUTION]
> **2 ĐIỀU CẤM KỴ TUYỆT ĐỐI**:
> 1. **KHÔNG** inject hoặc gọi Prisma Client trực tiếp từ Controller.
> 2. **KHÔNG** viết business logic hoặc tính toán nghiệp vụ trong Controller.

---

### 4. Chi Tiết Từng Tầng

#### A. Controller
- Luôn sử dụng ValidationPipe toàn cục để validate tự động qua DTO.
- Sử dụng Guards để xác thực và phân quyền (ví dụ: `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`).
- Trả về mã HTTP status rõ ràng (`@HttpStatus.CREATED`, `@HttpStatus.OK`, `@HttpStatus.NO_CONTENT`).

#### B. Service
- Chịu trách nhiệm toàn bộ logic nghiệp vụ (tính toán chiết khấu, tính lượt xoay tua thợ, kiểm tra xung đột lịch hẹn).
- Nếu cần thực hiện nhiều thao tác ghi dữ liệu phụ thuộc nhau, **bắt buộc** dùng `prisma.$transaction`.
- Khi có thay đổi trạng thái cần thời gian thực (real-time), gọi `NotificationGateway` để phát sự kiện tới Tenant tương ứng.

#### C. Repository
- Bao bọc các truy vấn Prisma (`findMany`, `create`, `update`, `delete`).
- Không để rò rỉ ngoại lệ database chưa qua xử lý lên tầng ngoài nếu cần ẩn chi tiết nhạy cảm.

#### D. DTO & Validation
- Sử dụng `class-validator` và `class-transformer` (`@IsString()`, `@IsNotEmpty()`, `@IsUUID()`, `@IsOptional()`, `@Type()`, v.v.).
- Khai báo kiểu dữ liệu rõ ràng cho từng trường.

---

### 5. Xử Lý Lỗi & Logging

- **HttpException**: Sử dụng các exception có sẵn của NestJS (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`).
- **Catch block**: Không bao giờ để `catch (e) {}` rỗng. Luôn log lỗi hoặc rethrow phù hợp.
- **Bảo mật phản hồi lỗi**: Không trả full stack trace hoặc chi tiết SQL error cho client ở môi trường production.
- **Logging**:
  - Luôn sử dụng `private readonly logger = new Logger(ServiceName.name)`.
  - Nghiêm cấm sử dụng `console.log` trong code commit.

---

### 6. Quản Lý Môi Trường & Cấu Hình
- Toàn bộ secret (JWT secret, API keys, database credentials) phải được đọc qua `ConfigService` (`@nestjs/config`).
- Tuyệt đối không hard-code secret hay credentials trong mã nguồn.

---

### 7. Checklist Kiểm Tra Code Backend Trước Khi Hoàn Tất
- [ ] Controller không chứa logic tính toán nghiệp vụ hay gọi Prisma.
- [ ] Mọi endpoint POST/PUT/PATCH đều có DTO validation chặt chẽ.
- [ ] Không còn `any` không có lý do chính đáng.
- [ ] Không có `console.log` còn sót lại.
- [ ] Có transaction cho các thao tác ghi dữ liệu nhiều bước.
- [ ] Các sự kiện cập nhật quan trọng (thợ, lịch hẹn, thanh toán) đã phát WebSocket tương ứng.
