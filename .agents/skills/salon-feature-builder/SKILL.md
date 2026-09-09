---
name: salon-feature-builder
description: >-
  Use this skill when developing or refactoring an end-to-end fullstack feature across the Monorepo (from Database schema and Shared Types to NestJS Backend API, WebSockets, and React Frontend UI).
---

# Quy Trình Phát Triển Tính Năng Fullstack Monorepo (`salon-feature-builder`)

Quy trình chuẩn từng bước giúp AI Agent xây dựng một tính năng mới hoặc tái cấu trúc tính năng lớn xuyên suốt các tầng của hệ thống SaaS Salon App.

---

## 1. Khảo Sát Tác Động & Phân Tích (Impact Survey with CodeGraph)

Trước khi viết bất kỳ dòng mã nào:
1. **Gọi CodeGraph**: Sử dụng MCP tool `codegraph_explore` với tên các symbols/files liên quan tới tính năng mới và `projectPath: "c:\\Workspace\\salon_v4"`.
2. Xác định các module, DTOs hoặc bảng dữ liệu hiện có có thể tái sử dụng để tránh tạo trùng lặp.
3. Đọc kĩ [`.agents/AI_CONTEXT.md`](file:///c:/Workspace/salon_v4/.agents/AI_CONTEXT.md) để kiểm tra tính năng có ảnh hưởng đến 3 luồng lõi (Daily Turns, Dynamic Permissions, WebSocket Sync) hay không.

---

## 2. Thiết Kế Cơ Sở Dữ Liệu & Gói Dùng Chung (DB & Shared Packages)

1. **Cập nhật Schema Database**:
   - Nếu tính năng cần thêm bảng hoặc cột mới, mở [`packages/database/prisma/schema.prisma`](file:///c:/Workspace/salon_v4/packages/database/prisma/schema.prisma).
   - Đảm bảo có đủ khóa chính UUID, khóa ngoại, `created_at`, `updated_at`, `deleted_at` và index phù hợp theo [`.agents/rules/database_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/database_rule.md).
   - Sinh migration:
     ```bash
     pnpm --filter @salon/database exec prisma migrate dev --name add_<feature_name>
     pnpm --filter @salon/database exec prisma generate
     ```
2. **Khai báo Shared Types**:
   - Cập nhật các interface DTO, request/response types tại [`packages/shared-types`](file:///c:/Workspace/salon_v4/packages/shared-types).
   - Export các types trong file `index.ts` của package.

---

## 3. Xây Dựng Tầng Backend API (NestJS 4 Layers)

Triển khai module mới tại [`apps/backend-api/src/modules/<feature_name>/`](file:///c:/Workspace/salon_v4/apps/backend-api/src/modules/):

1. **DTOs (`dto/`)**:
   - Định nghĩa `create-<feature>.dto.ts` và `update-<feature>.dto.ts` sử dụng `class-validator`.
2. **Repository (`repository/`)**:
   - Đóng gói các hàm truy vấn Prisma tương tác với PostgreSQL.
3. **Service (`service/`)**:
   - Xử lý logic nghiệp vụ, tính toán chiết khấu/thời gian.
   - Bọc trong `prisma.$transaction` nếu ghi dữ liệu nhiều bước.
   - Nếu cần đồng bộ realtime cho Tenant, gọi `NotificationGateway` để phát sự kiện.
4. **Controller (`controller/`)**:
   - Gắn Guard phân quyền (`@UseGuards(JwtAuthGuard, RolesGuard)`).
   - Tiếp nhận input đã qua ValidationPipe, chuyển tiếp tới Service và trả về response.
5. **Đăng ký Module**: Thêm `<Feature>Module` vào `app.module.ts`.

---

## 4. Xây Dựng Tầng Giao Diện Người Dùng (React Frontend)

Triển khai tại [`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal) hoặc ứng dụng frontend tương ứng:

1. **Service / API Client**:
   - Tạo file service gọi các endpoint API mới vừa tạo ở Backend.
2. **Custom Hooks (TanStack Query v5)**:
   - Viết hook `use<Feature>Query` (`useQuery`) và `use<Feature>Mutation` (`useMutation`).
   - Đặt query key rõ ràng (ví dụ: `['<feature>', tenantId, branchId]`).
3. **Xây Dựng UI Components**:
   - Tận dụng các Atomic UI components trong `src/components/ui/` theo tiêu chuẩn [`.agents/rules/frontend_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/frontend_rule.md).
   - Xử lý đầy đủ 3 trạng thái: **Loading** (Skeleton), **Empty** (trống dữ liệu), **Error** (báo lỗi & retry).
4. **Lắng nghe Real-time Sync**:
   - Nếu dữ liệu cần đồng bộ tức thì giữa các thiết bị thu ngân/chủ salon, đăng ký sự kiện trong hook `useWebSocketSync.ts` để tự động invalidate cache TanStack Query.

---

## 5. Xác Minh & Kiểm Tra Cuối Cùng (Verification)

1. Kiểm tra lỗi type và linter toàn monorepo:
   ```bash
   pnpm lint
   ```
2. Build thử nghiệm:
   ```bash
   pnpm build
   ```
3. Đảm bảo: Không có `any`, không có `console.log`, không import chéo giữa các `apps/`.
