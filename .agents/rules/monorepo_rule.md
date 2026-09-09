# QUY TẮC RANH GIỚI & QUẢN LÝ MONOREPO (`pnpm` + `turbo`)

Tài liệu này quy định ranh giới phụ thuộc và các câu lệnh chuẩn khi làm việc trong hệ thống Monorepo của dự án `salon_v4`.

---

### 1. Ranh Giới Giữa Các Ứng Dụng (`apps/`)

- **Quy tắc cô lập (App Isolation)**:
  - Mỗi thư mục trong `apps/` là một ứng dụng độc lập hoàn toàn về mặt runtime.
  - **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP IMPORT TRỰC TIẾP** mã nguồn giữa các ứng dụng với nhau.
    - ❌ *Sai:* `import { UserRole } from '../../apps/backend-api/src/...'` trong `tenant-portal`.
    - ✅ *Đúng:* `import { UserRole } from '@salon/shared-types'`
- Nếu hai ứng dụng cần dùng chung bất kỳ kiểu dữ liệu (Type/Interface), hàm tiện ích (Utils), hoặc hằng số (Constants):
  - Chuyển thành phần đó vào gói tương ứng trong `packages/` (`@salon/shared-types` hoặc `@salon/shared-utils`).

---

### 2. Các Gói Thư Viện Dùng Chung (`packages/`)

1. **`@salon/database`** ([`packages/database`](file:///c:/Workspace/salon_v4/packages/database)):
   - Chứa Prisma Schema, Prisma Client và Migrations.
   - Chỉ được import và sử dụng tại `apps/backend-api` (hoặc các script seed/migration nội bộ).
   - **Cấm tuyệt đối**: Không được import `@salon/database` vào các ứng dụng Frontend (`tenant-portal`, `customer-booking`, `internal-admin`) để tránh rò rỉ bảo mật và tăng kích thước bundle client.

2. **`@salon/shared-types`** ([`packages/shared-types`](file:///c:/Workspace/salon_v4/packages/shared-types)):
   - Chứa DTO interfaces, enum trạng thái đơn hàng, kiểu dữ liệu xoay tua thợ, kiểu trả về của REST API.
   - Không chứa mã logic thực thi runtime (chỉ chứa khai báo type/interface).

3. **`@salon/shared-utils`** ([`packages/shared-utils`](file:///c:/Workspace/salon_v4/packages/shared-utils)):
   - Chứa các hàm thuần túy (pure functions): tính tiền tệ, format số điện thoại, validate schema bằng Zod.
   - Không chứa mã phụ thuộc vào framework cụ thể (không chứa React hooks hay NestJS decorators).

---

### 3. Quy Chuẩn Quản Lý Phụ Thuộc (Package Management với `pnpm`)

- **Không cài đặt bừa bãi tại thư mục gốc**:
  - Thư mục gốc chỉ chứa các công cụ phát triển toàn cục (`turbo`, `prettier`, `typescript`).
- **Cài đặt thư viện cho một ứng dụng cụ thể**:
  ```bash
  pnpm --filter <tên_workspace> add <tên_thư_viện>
  # Ví dụ:
  pnpm --filter @salon/backend-api add @nestjs/jwt
  pnpm --filter @salon/tenant-portal add lucide-react
  ```
- **Cài đặt dev dependency**:
  ```bash
  pnpm --filter <tên_workspace> add -D <tên_thư_viện>
  ```
- **Thêm gói nội bộ làm phụ thuộc**:
  ```bash
  pnpm --filter @salon/tenant-portal add @salon/shared-types@workspace:*
  ```

---

### 4. Lệnh Vận Hành Toàn Cục (Turbo Pipelines)

- Chạy toàn bộ hệ thống ở chế độ phát triển:
  ```bash
  pnpm dev
  # hoặc: turbo run dev
  ```
- Kiểm tra lỗi cú pháp và lint toàn Monorepo:
  ```bash
  pnpm lint
  # hoặc: turbo run lint
  ```
- Build toàn bộ các ứng dụng để kiểm tra Type Safety:
  ```bash
  pnpm build
  # hoặc: turbo run build
  ```
- Tự động định dạng lại toàn bộ code:
  ```bash
  pnpm format
  ```
