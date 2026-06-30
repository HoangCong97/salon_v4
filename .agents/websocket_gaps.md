# BÁO CÁO CÁC VỊ TRÍ CHƯA ĐỒNG BỘ WEBSOCKET (WEBSOCKET GAPS REPORT)

Tài liệu này ghi nhận các mô-đun, API endpoints và tính năng hiện chưa tích hợp đồng bộ thời gian thực qua WebSocket. Đây là cơ sở để xem xét mở rộng và nâng cấp hệ thống trong tương lai.

---

## 1. Các khoảng trống ở Backend (NestJS API Gateway)

### A. Quản lý chi nhánh (`BranchController` - `branch.controller.ts`)
*   **Các API chưa có WS**:
    *   `createBranch` (POST `/api/tenants/:tenantId/branches`)
    *   `updateBranch` (PUT `/api/tenants/:tenantId/branches/:id`)
    *   `deleteBranch` (DELETE `/api/tenants/:tenantId/branches/:id`)
*   **Ảnh hưởng**: Khi Salon Owner tạo chi nhánh mới hoặc cập nhật thông tin địa chỉ/logo của chi nhánh, các quản lý/thu ngân đang đăng nhập ở các chi nhánh khác sẽ không thấy cập nhật trên menu lựa chọn chi nhánh nếu không tải lại trang.
*   **Giải pháp đề xuất**:
    *   Phát sự kiện `"branches.updated"` khi có thay đổi.

### B. Quản lý lương & Tạm ứng (`PayrollController` - `payroll.controller.ts`)
*   **Các API chưa có WS**:
    *   `generateMonthlyPayrolls` (POST)
    *   `updatePayrollStatus` (PUT)
    *   `requestSalaryAdvance` (POST `/advances`)
    *   `approveSalaryAdvance` (PUT `/advances/:id/status`)
*   **Ảnh hưởng**: Khi nhân viên gửi yêu cầu tạm ứng lương từ App Mobile, hoặc khi Kế toán duyệt tạm ứng, dữ liệu trên Dashboard của Quản lý hoặc màn hình Profile của nhân viên sẽ không tự động cập nhật ngay lập tức.
*   **Giải pháp đề xuất**:
    *   Phát sự kiện `"payrolls.updated"` khi chốt bảng lương hoặc thay đổi trạng thái chi trả lương.
    *   Phát sự kiện `"advances.updated"` khi có đơn tạm ứng lương mới hoặc được duyệt.

### C. Đặt lịch tự phục vụ từ khách hàng (`CustomerPortalController` - `customer-portal.controller.ts`)
*   **Các API chưa có WS**:
    *   Khách hàng đặt lịch hẹn online, hủy lịch, hoặc thay đổi giờ hẹn từ trang Booking bên ngoài dành cho khách.
*   **Ảnh hưởng**: Lịch hẹn do khách tự đặt online sẽ được ghi vào cơ sở dữ liệu nhưng màn hình grid lịch hẹn của thu ngân/lễ tân ở Salon (`tenant-portal`) sẽ không tự xuất hiện thẻ lịch hẹn mới cho đến khi họ bấm F5 hoặc tự động refetch định kỳ. Đây là một gap lớn ảnh hưởng đến trải nghiệm vận hành Walk-in và Online booking.
*   **Giải pháp đề xuất**:
    *   Tại các method xử lý booking của khách hàng trong `customer-portal.controller.ts`, cần gọi phát sự kiện `"appointments.updated"` tới Tenant tương ứng để màn hình Admin Portal tự động invalidate cache và vẽ lại thẻ lịch hẹn mới.

### D. Công cụ nhập dữ liệu hàng loạt (`ImportEngineModule` - `import-engine/`)
*   **Các API chưa có WS**:
    *   `executeImport` (POST `/api/import/execute/:entity`) nhập hàng loạt nhân sự, dịch vụ hoặc kho hàng từ file Excel.
*   **Ảnh hưởng**: Quá trình phân tích và nhập file Excel lớn có thể mất vài giây. Việc thiếu WebSocket khiến client không thể hiển thị thanh tiến trình (progress bar) nhập dữ liệu theo thời gian thực (ví dụ: "Đang nhập 10/200 dòng...").
*   **Giải pháp đề xuất**:
    *   Phát sự kiện `"import.progress"` định kỳ sau mỗi 20-50 dòng được xử lý thành công để hiển thị tiến trình trên Wizard Import của client.

---

## 2. Các khoảng trống ở Frontend (React Tenant Portal)

### A. Widget biểu đồ tổng quan trên Dashboard (`Dashboard` - `src/pages/desktop/Dashboard/`)
*   **Ảnh hưởng**: Mặc dù các sự kiện POS Checkout (`invoices.updated`) hoặc Đặt lịch hẹn (`appointments.updated`) đã có WebSocket, màn hình Dashboard (doanh thu hôm nay, số lượt phục vụ, số khách hàng mới) hiện chưa lắng nghe các sự kiện này để invalidate cache. Dashboard chỉ hiển thị dữ liệu tĩnh tại thời điểm truy cập.
*   **Giải pháp đề xuất**:
    *   Đăng ký lắng nghe sự kiện `"invoices.updated"` và `"appointments.updated"` trong trang Dashboard để invalidate các truy vấn biểu đồ doanh thu ngày/tuần.

### B. Giao diện quản lý Chi nhánh (`Branches` - `src/pages/desktop/Branches/`)
*   **Ảnh hưởng**: Chưa lắng nghe WebSocket để tự tải lại danh sách chi nhánh khi có thay đổi cấu hình chi nhánh từ Salon Owner.

### C. Giao diện quản lý Lương & Tạm ứng (`Payroll` - `src/pages/desktop/Payroll/` & `AttendanceCalendar`)
*   **Ảnh hưởng**: Chưa lắng nghe WebSocket để cập nhật danh sách phiếu lương hoặc hiển thị toast khi thợ xin tạm ứng thành công.
