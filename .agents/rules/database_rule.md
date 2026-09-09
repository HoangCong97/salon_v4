# TIÊU CHUẨN THIẾT KẾ CƠ SỞ DỮ LIỆU & PRISMA (Database Standards)

Tài liệu này quy định các tiêu chuẩn thiết kế cơ sở dữ liệu PostgreSQL và quản lý mô hình Prisma ORM trong gói [`packages/database`](file:///c:/Workspace/salon_v4/packages/database) cho hệ thống SaaS Salon App (`salon_v4`).

---

### 1. Nguyên Tắc Cốt Lõi (Database First Principles)

- **Chuẩn hóa dữ liệu**: Luôn ưu tiên chuẩn 3NF. Chỉ denormalize khi có lý do hiệu năng đặc biệt và đã được đo lường cụ thể.
- **Không lưu dữ liệu phái sinh (Derived Data)**: Không tạo cột lưu giá trị có thể tính toán tức thì từ các trường khác (ví dụ: tổng tiền hóa đơn = tổng dịch vụ + phụ phí - chiết khấu).
- **Mỗi bảng một thực thể**: Một bảng chỉ đại diện cho một khái niệm/thực thể nghiệp vụ duy nhất.
- **Tính toàn vẹn dữ liệu**: Ràng buộc toàn vẹn phải được bảo vệ từ tầng CSDL (Foreign Keys, Constraints, Unique) trước khi bảo vệ ở tầng ứng dụng.

---

### 2. Quy Chuẩn Đặt Tên (Naming Conventions)

#### A. Tên bảng (Tables)
- Dạng `snake_case`, danh từ số nhiều:
  - `tenants`, `branches`, `users`, `roles`, `permissions`
  - `services`, `categories`, `staff_turns`, `appointments`, `invoices`, `invoice_items`

#### B. Tên cột (Columns)
- Dạng `snake_case`, danh từ số ít:
  - Khóa chính: `id` (UUID hoặc CUID)
  - Khóa ngoại: `<tên_bảng_số_ít>_id` (ví dụ: `tenant_id`, `branch_id`, `customer_id`, `invoice_id`)
  - Trường thời gian: `created_at`, `updated_at`, `deleted_at`
  - Trường trạng thái: `status`, `is_active`, `payment_method`

---

### 3. Khóa Chính & Khóa Ngoại (Keys & Relations)

- **Khóa chính (Primary Key)**:
  - Mỗi bảng bắt buộc phải có khóa chính.
  - Sử dụng chuỗi UUID (`@default(uuid())`) hoặc CUID (`@default(cuid())`).
  - Tuyệt đối không dùng dữ liệu nghiệp vụ thay đổi được (số điện thoại, email, mã căn cước) làm khóa chính.
- **Khóa ngoại (Foreign Key & Relations)**:
  - Mọi quan hệ giữa các bảng phải được khai báo quan hệ rõ ràng trong Prisma Schema (`@relation(...)`).
  - Thiết lập `onDelete` phù hợp (`Cascade`, `SetNull`, hoặc `Restrict`).
  - Không được phép tạo dữ liệu mồ côi (orphan records).

---

### 4. Xóa Mềm & Dấu Thời Gian (Soft Delete & Timestamps)

- Tất cả các bảng nghiệp vụ chính đều phải có 3 trường:
  - `created_at DateTime @default(now()) @map("created_at")`
  - `updated_at DateTime @updated_at @map("updated_at")`
  - `deleted_at DateTime? @map("deleted_at")`
- **Nguyên tắc xóa**: Không xóa vật lý (`HARD DELETE`) các thực thể có liên quan đến hóa đơn, dòng tiền, lịch sử thợ hoặc dữ liệu khách hàng. Luôn cập nhật `deleted_at = now()`.

---

### 5. Chỉ Mục & Ràng Buộc Độc Nhất (Indexes & Unique Constraints)

- **Bắt buộc đánh index (`@@index`) cho**:
  - Mọi cột khóa ngoại (Foreign Keys) thường dùng để JOIN hoặc lọc theo Tenant: `[tenant_id]`, `[branch_id]`.
  - Các cột thường xuyên xuất hiện trong mệnh đề `WHERE`, lọc theo ngày tháng hoặc sắp xếp: `[tenant_id, created_at]`.
  - Các cột tìm kiếm phổ biến: `phone`, `code`.
- **Ràng buộc duy nhất (`@@unique`)**:
  - Email hoặc số điện thoại trong cùng một Tenant: `@@unique([tenant_id, phone])`.
  - Mã nhân viên hoặc mã hóa đơn trong Tenant: `@@unique([tenant_id, invoice_code])`.
- **Tránh index dư thừa**: Không đánh index cho các bảng quá nhỏ hoặc các cột có độ biến thiên giá trị quá thấp (ví dụ: cột boolean `is_active` đứng một mình).

---

### 6. Quy Chuẩn Prisma Schema (`packages/database/prisma/schema.prisma`)

- Mỗi model phải có ánh xạ tên bảng rõ ràng: `@@map("tên_bảng_số_nhiều")`.
- Mỗi trường snake_case nên được ánh xạ qua `@map("tên_cột_snake_case")` nếu tên thuộc tính TypeScript dùng camelCase.
- Khai báo quan hệ hai chiều đầy đủ để Prisma Client tự động sinh các kiểu liên kết chính xác.

---

### 7. Quy Trình Chạy Migration An Toàn (Prisma Migrate)

1. Khi thay đổi schema:
   ```bash
   pnpm --filter @salon/database exec prisma migrate dev --name <ten_thay_doi_ngan_gon>
   ```
2. Sinh lại Prisma Client để các ứng dụng nhận diện kiểu dữ liệu mới:
   ```bash
   pnpm --filter @salon/database exec prisma generate
   ```
3. **Cấm**: Tuyệt đối không chỉnh sửa thủ công các file migration đã commit vào git hoặc đã áp dụng trên cơ sở dữ liệu production.
