---
name: salon-db-migration
description: >-
  Use this skill when modifying Prisma database schema, creating or running database migrations, or updating database seed data in packages/database.
---

# Quy Trình Cập Nhật CSDL & Migration An Toàn (`salon-db-migration`)

Hướng dẫn chuẩn từng bước cho AI Agent khi thao tác với cơ sở dữ liệu PostgreSQL thông qua Prisma ORM tại [`packages/database`](file:///c:/Workspace/salon_v4/packages/database).

---

## 1. Nguyên Tắc Thiết Kế Trước Khi Sửa Schema

Trước khi mở file `packages/database/prisma/schema.prisma`:
1. Đọc lại quy chuẩn thiết kế tại [`.agents/rules/database_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/database_rule.md).
2. Kiểm tra xem bảng hoặc cột mới có:
   - Tên bảng: `snake_case` số nhiều (`@@map("...")`).
   - Tên cột: `snake_case` số ít.
   - Khóa chính: UUID (`@default(uuid())`) hoặc CUID.
   - Quan hệ: Khóa ngoại có quan hệ 2 chiều rõ ràng và hành vi xóa (`onDelete: Cascade` / `SetNull`).
   - Thời gian: `created_at`, `updated_at`, và `deleted_at` (nếu hỗ trợ soft delete).
   - Chỉ mục: Đã đánh `@@index` cho các khóa ngoại và cột lọc dữ liệu chưa?

---

## 2. Quy Trình Chạy Migration Trên Môi Trường Phát Triển

1. **Thực hiện chỉnh sửa** trong file `packages/database/prisma/schema.prisma`.
2. **Tạo và áp dụng migration**:
   Mở terminal tại thư mục gốc dự án và chạy:
   ```bash
   pnpm --filter @salon/database exec prisma migrate dev --name <ten_thay_doi_ngan_gon>
   ```
   *Ví dụ:* `pnpm --filter @salon/database exec prisma migrate dev --name add_employee_commission`
3. **Sinh lại Prisma Client**:
   ```bash
   pnpm --filter @salon/database exec prisma generate
   ```
4. **Kiểm tra file SQL sinh ra**:
   Vào thư mục `packages/database/prisma/migrations/` kiểm tra file SQL vừa sinh để chắc chắn rằng không vô tình làm mất cột (DROP COLUMN) hoặc mất dữ liệu hiện có.

---

## 3. Cập Nhật Dữ Liệu Mẫu (Seed Data)

1. Nếu tính năng mới yêu cầu dữ liệu mẫu khởi đầu (vai trò mặc định, cấu hình hệ thống, dịch vụ mẫu), cập nhật file [`packages/database/prisma/seed.ts`](file:///c:/Workspace/salon_v4/packages/database/prisma/seed.ts).
2. Chạy lệnh seed để nạp dữ liệu:
   ```bash
   pnpm --filter @salon/database db:seed
   ```

---

## 4. Đồng Bộ Kiểu Dữ Liệu Lên `@salon/shared-types`

Sau khi Prisma Client được cập nhật:
1. Mở [`packages/shared-types`](file:///c:/Workspace/salon_v4/packages/shared-types).
2. Thêm hoặc cập nhật các DTO/Interface phản ánh cấu trúc bảng mới để các ứng dụng Frontend (`apps/tenant-portal`, `apps/customer-booking`) có thể sử dụng type-safe.

---

## 5. Những Điều Tuyệt Đối Tránh (Safety Rules)

- ❌ **KHÔNG** chỉnh sửa file migration đã release hoặc đã commit trước đó.
- ❌ **KHÔNG** chạy lệnh `prisma db push` trên môi trường có dữ liệu thật (lệnh này có thể xóa bảng không báo trước).
- ❌ **KHÔNG** import Prisma Client trực tiếp vào bất kỳ gói frontend nào ngoài `apps/backend-api`.
