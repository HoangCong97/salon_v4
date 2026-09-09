# BẢN ĐỒ DỰ ÁN & NGỮ CẢNH HỆ THỐNG (`.agents/AI_CONTEXT.md`)

Tài liệu này cung cấp bản đồ kiến trúc, vai trò của các ứng dụng, gói thư viện và các luồng nghiệp vụ cốt lõi trong hệ thống SaaS Salon App (`salon_v4`) để AI Agent định vị và thao tác chính xác nhất.

---

## 1. Cấu Trúc Tổng Quan & Vai Trò Thư Mục

Dự án sử dụng mô hình Monorepo quản lý bởi `pnpm` (workspace) và `turbo`:

### Thư mục `apps/` (Các ứng dụng độc lập)

- **[`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal)**:
  - _Vai trò:_ Cổng điều hành chính dành cho Chủ Salon (Owner), Quản lý chi nhánh (Manager) và Nhân viên/Thu ngân (Desktop Web App).
  - _Công nghệ:_ React (Vite), Zustand (State management), TanStack Query v5, TailwindCSS / CSS Modules, Lucide Icons.
  - _Nghiệp vụ chính:_ Quản lý nhân sự, ca trực, xoay tua thợ (Daily Turns), POS bán hàng, thanh toán hóa đơn, xem báo cáo doanh thu, kho hàng.
- **[`apps/backend-api`](file:///c:/Workspace/salon_v4/apps/backend-api)**:
  - _Vai trò:_ Hệ thống API Gateway và xử lý toàn bộ logic nghiệp vụ (REST API + WebSockets).
  - _Công nghệ:_ NestJS, Prisma Client (`@salon/database`), RxJS, WebSockets (`ws`).
  - _Nghiệp vụ chính:_ Authentication (JWT), phân quyền động, thanh toán, CRUD tài nguyên, WebSocket truyền tin thời gian thực đa Tenant.
- **[`apps/customer-booking`](file:///c:/Workspace/salon_v4/apps/customer-booking)**:
  - _Vai trò:_ Cổng đặt lịch hẹn trực tuyến dành cho khách hàng của các salon.
  - _Công nghệ:_ React / Next.js App Router (tối ưu hóa SEO và trải nghiệm mobile-first).
- **[`apps/internal-admin`](file:///c:/Workspace/salon_v4/apps/internal-admin)**:
  - _Vai trò:_ Trang quản trị nội bộ dành cho Super Admin hệ thống SaaS.
  - _Công nghệ:_ React (Vite SPA).
  - _Nghiệp vụ chính:_ Quản lý các gói dịch vụ (Subscription Plans), quản lý các Tenant đăng ký, giám sát vận hành hệ thống.

### Thư mục `packages/` (Các gói dùng chung trong Monorepo)

- **[`packages/database`](file:///c:/Workspace/salon_v4/packages/database)**:
  - _Vai trò:_ Định nghĩa Prisma Schema và khởi tạo kết nối Prisma Client duy nhất cho toàn hệ thống (`@salon/database`).
  - _Nội dung:_ `prisma/schema.prisma` (Định nghĩa model Postgres), `prisma/seed.ts` (Dữ liệu mẫu ban đầu).
- **[`packages/shared-types`](file:///c:/Workspace/salon_v4/packages/shared-types)**:
  - _Vai trò:_ Chứa các khai báo kiểu TypeScript dùng chung giữa Backend và các ứng dụng Frontend (`@salon/shared-types`).
- **[`packages/shared-utils`](file:///c:/Workspace/salon_v4/packages/shared-utils)**:
  - _Vai trò:_ Các hàm tiện ích thuần túy (format tiền tệ VNĐ/USD, tính toán thời gian, validate dữ liệu Zod) dùng chung (`@salon/shared-utils`).

---

## 2. Các Luồng Nghiệp Vụ Cốt Lõi (Core Business Flows)

### A. Quản lý xoay tua thợ (Daily Turns)
- Cơ chế chia lượt nhận khách công bằng cho thợ Walk-in tại mỗi chi nhánh.
- _Frontend:_ `apps/tenant-portal/src/pages/desktop/StaffManagement/DailyTurnsTable.tsx`
- _Backend:_ `apps/backend-api/src/turns.controller.ts` và Service tương ứng.
- _Real-time:_ Khi lượt phục vụ thay đổi, backend phát sự kiện WebSocket `"turns.updated"` để mọi máy thu ngân/quản lý cùng chi nhánh cập nhật tức thì.

### B. Quản lý phân quyền động (Dynamic RBAC Permissions)
- Hỗ trợ tạo Chức vụ (Role) tùy biến và gán Quyền hạn (Permissions) linh hoạt theo Tenant.
- _Frontend:_ `apps/tenant-portal/src/pages/desktop/StaffManagement/RolePermissionPanel.tsx`
- _Backend:_ `apps/backend-api/src/staff.controller.ts` (các endpoint `/roles`, `/permissions`).

### C. Đồng bộ dữ liệu thời gian thực theo Tenant (Real-time Tenant Sync)
- Tự động đồng bộ các dữ liệu nhạy cảm (nhân sự, ca làm việc, lượt thợ, lịch hẹn, thanh toán POS, kho hàng) giữa toàn bộ người dùng trong cùng một Tenant.
- _Frontend:_ `apps/tenant-portal/src/hooks/useWebSocketSync.ts` (lắng nghe sự kiện để tự động invalidate cache TanStack Query và hiển thị Toast nếu có biến động từ đồng nghiệp).
- _Backend Gateway:_ `apps/backend-api/src/notification.gateway.ts` (quản lý kết nối chia phòng theo `tenantId` và định tuyến sự kiện chuẩn xác).

---

## 3. Bản Đồ Kết Nối & Môi Trường

- **Frontend -> Backend API**: Mặc định qua URL `http://localhost:3000/api` (hoặc cấu hình qua biến môi trường `VITE_API_BASE_URL`).
- **Backend -> Database**: Kết nối PostgreSQL qua Prisma ORM sử dụng biến môi trường `DATABASE_URL` trong `.env`.
