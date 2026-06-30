# BẢN ĐỒ DỰ ÁN (AI_CONTEXT.md)

Tài liệu này cung cấp bản đồ cấu trúc dự án và vai trò của các thư mục chính cho AI Agent để nhanh chóng định vị, phát triển và sửa lỗi trong hệ thống SaaS Salon App.

---

## 1. Cấu Trúc Tổng Quan & Vai Trò Thư Mục

Dự án sử dụng mô hình Monorepo quản lý bởi `pnpm` và `turbo`. Các thành phần chính bao gồm:

### Thư mục `apps/` (Các ứng dụng độc lập)
*   **`tenant-portal/`**: 
    *   *Vai trò:* Trang quản lý chính dành cho Salon Owner/Manager (Desktop Web App).
    *   *Công nghệ:* React (Vite), Zustand (State management), TailwindCSS / Vanilla CSS, Lucide Icons.
    *   *Nghiệp vụ:* Quản lý nhân viên, xếp lịch trực ca, xoay tua thợ nhận khách (Turns), POS bán hàng, thanh toán hóa đơn, xem báo cáo doanh thu.
*   **`backend-api/`**:
    *   *Vai trò:* Hệ thống API Gateway và xử lý logic nghiệp vụ chính (REST API + WebSockets).
    *   *Công nghệ:* NestJS, Prisma Client, RxJS, WS (WebSockets).
    *   *Nghiệp vụ:* Authentication, thanh toán, quản lý cơ sở dữ liệu (CRUD), WebSockets truyền tin thời gian thực (xoay tua thợ, thông báo hóa đơn).
*   **`customer-booking/`**:
    *   *Vai trò:* Cổng đặt lịch trực tuyến dành cho khách hàng của các salon.
    *   *Công nghệ:* React / Next.js.
*   **`internal-admin/`**:
    *   *Vai trò:* Trang quản trị nội bộ dành cho Super Admin hệ thống SaaS để quản lý các gói đăng ký (Plans), đăng ký Tenant và theo dõi hiệu suất hệ thống.

### Thư mục `packages/` (Các thư viện dùng chung)
*   **`database/`**:
    *   *Vai trò:* Định nghĩa Schema Database và quản lý kết nối Prisma Client.
    *   *Nội dung:* `prisma/schema.prisma` (Định nghĩa các bảng dữ liệu Postgres), `prisma/seed.ts` (Dữ liệu mẫu ban đầu).
*   **`shared-types/`**:
    *   *Vai trò:* Chứa các khai báo kiểu TypeScript dùng chung giữa Backend và các ứng dụng Frontend.
*   **`shared-utils/`**:
    *   *Vai trò:* Các hàm xử lý tiện ích chung (định dạng tiền tệ, xử lý ngày tháng, validate dữ liệu).

---

## 2. Luồng Nghiệp Vụ Quan Trọng

### A. Quản lý xoay tua thợ (Daily Turns)
*   Quy trình xoay tua thợ đảm bảo sự công bằng trong việc chia lượt nhận khách Walk-in tại mỗi chi nhánh.
*   *Frontend:* `apps/tenant-portal/src/pages/desktop/StaffManagement/DailyTurnsTable.tsx`
*   *Backend:* `apps/backend-api/src/turns.controller.ts`

### B. Quản lý phân quyền động (Dynamic Permissions)
*   Hệ thống hỗ trợ tạo Chức vụ (Role) tùy chỉnh và gán Quyền hạn (Permissions) động theo nhóm nghiệp vụ.
*   *Frontend:* `apps/tenant-portal/src/pages/desktop/StaffManagement/RolePermissionPanel.tsx`
*   *Backend:* `apps/backend-api/src/staff.controller.ts` (các endpoint liên quan tới `/roles` và `/permissions`).

### C. Đồng bộ dữ liệu thời gian thực theo Tenant (Real-time Tenant Sync)
*   Hệ thống tự động đồng bộ dữ liệu (nhân sự, phân ca, lượt xoay tua thợ, lịch hẹn, hóa đơn POS, kho hàng) giữa toàn bộ người dùng trong cùng một Tenant.
*   *Frontend:* `apps/tenant-portal/src/hooks/useWebSocketSync.ts` (lắng nghe sự kiện để tự động tải lại dữ liệu nền qua React Query và hiển thị Toast nếu có cập nhật từ người khác).
*   *Backend:* `apps/backend-api/src/notification.gateway.ts` (quản lý kết nối chia theo Tenant và định tuyến sự kiện chính xác).

---

## 3. Bản Đồ Kết Nối API & Dữ Liệu
*   Frontend kết nối Backend qua API URL mặc định: `http://localhost:3000/api`
*   Database kết nối trực tiếp qua Prisma Client sử dụng biến môi trường `DATABASE_URL` trong `.env`.
