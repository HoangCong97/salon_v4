# MÔ TẢ CHI TIẾT CÁC NHÁNH THƯ MỤC & FILE CHÍNH (DIRECTORY_DESCRIPTIONS.md)

Tài liệu này cung cấp danh sách mô tả chi tiết của từng nhánh thư mục và các file mã nguồn cốt lõi trong dự án để hỗ trợ tối ưu việc đọc hiểu cấu trúc cho AI Agent về sau.

---

## 1. Thư mục `apps/` (Các Ứng Dụng Độc Lập)

### A. `apps/backend-api/` (NestJS Backend Service)
Dịch vụ API RESTful & WebSocket phục vụ toàn bộ nghiệp vụ cho ứng dụng.
*   **`src/main.ts`**: Điểm khởi chạy ứng dụng NestJS, cấu hình CORS, Port và Global Guards.
*   **`src/app.module.ts`**: Module gốc đăng ký toàn bộ Controller, Service và database provider.
*   **`src/staff.controller.ts`**: Xử lý API quản lý nhân viên, vai trò chức vụ, phân quyền và cấu hình lương. Chứa cơ chế In-memory cache tối ưu tốc độ load.
*   **`src/turns.controller.ts`**: Xử lý API sắp xếp thứ tự và lượt xoay tua thợ nhận khách (Walk-in vs Booked) tại chi nhánh.
*   **`src/import-engine/`**: Bộ engine lõi phân tích, đối chiếu và nhập dữ liệu từ Excel/CSV thông qua AI.

### B. `apps/tenant-portal/` (React Desktop Management Web App)
Trang Web quản trị chính của chủ cửa hàng salon và các quản lý chi nhánh.
*   **`src/pages/desktop/StaffManagement/`**: Module quản lý nhân sự.
    *   `index.tsx`: Component giao diện chính (Presentation Component), nhận dữ liệu từ Custom Hook để render các Tabs và Modals.
    *   `useStaffManagement.ts`: Custom Hook (Logic Component) chứa toàn bộ state giao diện, logic xử lý API và bộ lọc tìm kiếm nhân viên.
    *   `types.ts`: Khai báo TypeScript Interfaces và các hàm helper xác định mã màu sắc trạng thái/chức vụ.
    *   `StaffTable.tsx`: Bảng hiển thị thông tin nhân sự với chế độ chỉnh sửa trực tiếp (inline Excel-like editing).
    *   `RolePermissionPanel.tsx`: Giao diện cấu hình phân quyền động (ma trận checkboxes) cho từng chức vụ.
    *   `DailyTurnsTable.tsx`: Bảng điều hành xoay tua thợ nhận khách trong ngày.
*   **`src/components/desktop/ui/`**: Thư mục chứa các Component nguyên tử dùng chung (Atomic UI) chỉ cho Desktop được viết bằng CSS Modules và CSS Variables chuẩn thiết kế:
    *   `Button.tsx`: Nút bấm đa năng hỗ trợ variant, size, loading và icons.
    *   `Input.tsx`: Input field có label, validation error feedback.
    *   `Modal.tsx`: Modal bọc createPortal tự động xử lý z-index, overlay blur và phím Escape.
    *   `Tooltip.tsx`: Tooltip hover tính toán tọa độ động và dùng hiệu ứng fade CSS mượt mà.

### C. `apps/customer-booking/` (Next.js Portal đặt lịch cho khách hàng)
*   Cho phép khách hàng chọn chi nhánh, chọn dịch vụ làm đẹp, chọn stylist yêu thích và đặt giờ hẹn làm dịch vụ.

### D. `apps/internal-admin/` (Super Admin Portal)
*   Trang quản lý các Salon Đăng ký dịch vụ SaaS (Tenants), tạo lập và thay đổi các gói cước dịch vụ (Plans), theo dõi hóa đơn và báo cáo tổng.

---

## 2. Thư mục `packages/` (Thư Viện Dùng Chung)

### A. `packages/database/` (Prisma Database Client)
*   **`prisma/schema.prisma`**: Tệp tin định nghĩa cấu trúc dữ liệu quan hệ (Postgres tables) bao gồm Tenant, User, Role, Permission, EmployeeDailyTurn, v.v.
*   **`prisma/seed.ts`**: File chạy dữ liệu mẫu (mặc định tạo ra các gói SaaS, chi nhánh mẫu, nhân viên demo).

### B. `packages/shared-types/` (TypeScript Types & Interfaces)
*   Gom các kiểu dữ liệu chung như `UserSession`, `BranchInfo` để đảm bảo đồng bộ kiểu dữ liệu Type-safe ở cả Backend và Frontend.

### C. `packages/shared-utils/` (Helper Utilities)
*   Các hàm định dạng ngày giờ, định dạng tiền tệ VND, hàm mã hóa hoặc validate số điện thoại dùng chung.
