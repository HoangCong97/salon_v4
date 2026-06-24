# 📋 DANH SÁCH NHIỆM VỤ PHÁT TRIỂN (PROJECT ROADMAP & TASKS)

Tài liệu này chia nhỏ toàn bộ các chức năng màn hình và nghiệp vụ của dự án thành các Module và Task nhỏ hơn để AI có thể thực hiện tuần tự và độc lập, tránh xung đột mã nguồn.

---

## 🛠️ PHẦN 1: CƠ SỞ HẠ TẦNG & DỮ LIỆU CHUNG (INFRASTRUCTURE)

### [ ] MODULE 1: ĐỒNG BỘ SCHEMA DATABASE & THƯ VIỆN DÙNG CHUNG
- [x] **Task 1.1**: Thiết kế chi tiết và đồng bộ file `schema.prisma` tại package `@salon/database` dựa trên `schema.sql` (bổ sung đầy đủ các bảng `sal_`, UUID v7, deleted_at, composite indexes).
- [x] **Task 1.2**: Chạy lệnh sinh Prisma Client (`db:generate`) và tích hợp xuất bản client dùng chung qua `@salon/database`.
- [x] **Task 1.3**: Xây dựng bộ kiểu dữ liệu chung (Dockets, DTOs, API Response structure) tại `@salon/shared-types`.
- [x] **Task 1.4**: Định nghĩa các hàm tiện ích định dạng tiền VND, phần trăm, thời gian và Zod Validation Schemas chung tại `@salon/shared-utils`.
- [x] **Task 1.5**: Tạo script Seed dữ liệu mẫu cơ bản (Hệ thống quyền `sal_permissions`, nhóm Admin mặc định, cấu hình hệ thống ban đầu).

### [ ] MODULE 2: THIẾT LẬP BACKEND CORE & PHÂN TÁCH TENANT (TENANT ISOLATION)
- [x] **Task 2.1**: Cấu hình `TenantResolverMiddleware` tại `backend-api` để giải mã `tenant_id` từ Request Header (`X-Tenant-ID`) hoặc Subdomain.
- [x] **Task 2.2**: Cấu hình Guards bảo mật JWT (`AuthGuard`) và phân quyền RBAC (`PermissionsGuard`) dựa trên JWT payload.
- [x] **Task 2.3**: Xây dựng Global Interceptor chuẩn hóa định dạng API Response trả về (`ApiResponse<T>`) và Global Exception Filter.
- [x] **Task 2.4**: Viết API kiểm tra sức khỏe hệ thống (Health Check) và tích hợp ghi nhật ký hoạt động (Audit Logs).

---

## 🖥️ PHẦN 2: PHÁT TRIỂN SITE NỘI BỘ (SUPER ADMIN PORTAL)

### [ ] MODULE 3: QUẢN TRỊ HỆ THỐNG SAAS (apps/internal-admin)
- [x] **Task 3.1**: Cấu hình khung giao diện chính Super Admin Layout (Sidebar cố định 260px, Topbar 70px, Content Area co giãn).
- [x] **Task 3.2**: Trang Dashboard Super Admin: Lưới 4 thẻ KPIs tổng thể, biểu đồ Line Chart doanh thu MRR, biểu đồ tròn phân bố gói dịch vụ.
- [x] **Task 3.3**: Quản lý Tenant: Giao diện bảng danh sách salon, tính năng Khóa/Mở khóa, Drawer xem chi tiết, tính năng giả lập quyền truy cập (Impersonate).
- [x] **Task 3.4**: Quản lý Gói dịch vụ & Hóa đơn: Tạo mới các gói subscription, theo dõi lịch sử thanh toán tiền phần mềm của các salon.
- [x] **Task 3.5**: Cấu hình hệ thống & Tích hợp: Form thiết lập API Key SMS, cổng thanh toán VNPay/Momo, lưu trữ S3.

---

## 🏬 PHẦN 3: PHÁT TRIỂN SITE TENANT (SALON PORTAL - ADAPTIVE)

### [x] MODULE 4: KHUNG GIAO DIỆN THÍCH ỨNG (ADAPTIVE LAYOUT SHELL)
- [x] **Task 4.1**: Thiết lập định tuyến thích ứng (`Adaptive Router`) tại `tenant-portal` để nhận diện kích thước màn hình & vai trò người dùng nhằm tải Layout phù hợp.
- [x] **Task 4.2**: Xây dựng Desktop Layout (Sidebar điều hướng nâng cao, Topbar tích hợp Branch Selector).
- [x] **Task 4.3**: Xây dựng Mobile Layout (Mobile Header, Bottom Navigation Bar cố định 64px dưới cùng dành cho nhân viên).

### [x] MODULE 5: QUẢN LÝ THÔNG TIN & THIẾT LẬP CỬA HÀNG (PC)
- [x] **Task 5.1**: API & UI Quản lý chi nhánh: Thêm/Sửa thông tin các chi nhánh trực thuộc chuỗi salon.
- [x] **Task 5.2**: API & UI Thiết lập danh mục dịch vụ: Quản lý dịch vụ lẻ, Combo đa dịch vụ, thiết lập giá bán và thời gian thực hiện dịch vụ.
- [x] **Task 5.3**: API & UI Quản lý kho hàng (Inventories): Nhập kho, xuất kho, thiết lập mức cảnh báo hết hàng cho sản phẩm tại chi nhánh.

### [x] MODULE 6: QUẢN LÝ NHÂN SỰ, CA LÀM VIỆC & XOAY TUA (PC & MOBILE)
- [x] **Task 6.1**: API & UI Quản lý tài khoản nhân sự: Thêm nhân viên mới, phân quyền chức vụ (Manager, Cashier, Employee), gán chi nhánh hoạt động.
- [x] **Task 6.2**: API & UI Phân ca trực (Employee Shifts): Lên lịch trực ca tuần/tháng cho nhân sự chi nhánh (PC). Nhân viên xem ca trực cá nhân trên Mobile.
- [x] **Task 6.3**: API & UI Hệ thống tua làm việc hàng ngày (Daily Turns): Thuật toán tự động xếp hàng xoay tua thợ, tự động nhảy số lượt nhận khách (PC & Mobile).

### [ ] MODULE 7: QUẢN LÝ ĐẶT LỊCH HẸN & LƯỚI BẢN ĐỒ (SCHEDULER GRID)
- [ ] **Task 7.1**: API Quản lý đặt lịch (Bookings): Tạo lịch đặt, kiểm tra va chạm khung giờ (overlap) và trạng thái thợ bận.
- [ ] **Task 7.2**: UI Lưới lịch biểu (Scheduler Grid) trên PC: Hiển thị dạng Timeline/Calendar trực quan, hỗ trợ kéo thả đổi giờ/thợ, click để đặt lịch nhanh.
- [ ] **Task 7.3**: UI Lịch hẹn Mobile (Employee): Hiển thị danh sách khách hàng gán trong ngày theo timeline, hỗ trợ thao tác vuốt ngang (Swipe) để xác nhận đang làm hoặc đã hoàn thành.

### [ ] MODULE 8: HỆ THỐNG ĐIỂM DANH & CHẤM CÔNG (PC & MOBILE)
- [ ] **Task 8.1**: API chấm công: Ghi nhận giờ check-in/out, tính toán thời gian đi muộn/về sớm tự động dựa trên cấu hình ca.
- [ ] **Task 8.2**: UI Chấm công trên Mobile (Employee): Tích hợp định vị GPS (khoảng cách tới chi nhánh) để hiển thị nút check-in/out nổi.
- [ ] **Task 8.3**: UI Giám sát chấm công trên PC (Manager/Admin): Xem bảng chấm công chi tiết của nhân viên chi nhánh theo tháng, phê duyệt yêu cầu nghỉ phép/sửa giờ chấm công.

### [ ] MODULE 9: CẤU HÌNH LƯƠNG & HOA HỒNG TỰ ĐỘNG (PAYROLL)
- [ ] **Task 9.1**: API & UI Tạo Template hoa hồng (Commission Templates): Thiết lập quy định hưởng % hoa hồng theo giá dịch vụ, bán sản phẩm, thẻ liệu trình.
- [ ] **Task 9.2**: API & UI Cấu hình lương nhân viên: Gán lương cứng và template hoa hồng cho từng nhân sự.
- [ ] **Task 9.3**: API & UI Tính toán bảng lương tháng (Monthly Payroll): Tự động tổng hợp lương cứng, hoa hồng từ các hóa đơn đã làm, tiền tips, các khoản giảm trừ (đi muộn) và tạm ứng.
- [ ] **Task 9.4**: UI Thống kê Hoa hồng trên Mobile (Employee): Hiển thị doanh thu thực hiện hôm nay, hoa hồng tạm tính thời gian thực và lịch sử bảng lương.

### [ ] MODULE 10: HÓA ĐƠN & THANH TOÁN POS TẠI QUẦY (PC)
- [ ] **Task 10.1**: API Tạo hóa đơn & POS checkout: Tạo hóa đơn nháp, liên kết lịch hẹn, gán mã nhân viên (`staff_id`) cho từng dòng dịch vụ/sản phẩm để tính hoa hồng.
- [ ] **Task 10.2**: UI Bán hàng POS Checkout: Thiết lập Split-Pane, hỗ trợ tìm kiếm nhanh sản phẩm/dịch vụ, chọn thông tin khách hàng, nhập mã Voucher giảm giá, trừ số buổi thẻ liệu trình.
- [ ] **Task 10.3**: API & UI Xử lý thanh toán: Tích hợp hiển thị mã QR động VNPAY/PayOS chuyển khoản đối soát, lưu ảnh giao dịch, in hóa đơn nhiệt.
- [ ] **Task 10.4**: API & UI Đối soát cuối ca (Cashier reconciliation): Thống kê doanh thu thực tế thu được trong ca, bàn giao két tiền mặt.

---

## 📱 PHẦN 4: PHÁT TRIỂN SITE KHÁCH HÀNG (CUSTOMER PORTAL)

### [ ] MODULE 11: SITE KHÁCH HÀNG ĐẶT LỊCH (apps/customer-booking)
- [ ] **Task 11.1**: Xây dựng trang Landing Page (Next.js SSR): Tìm kiếm chi nhánh gần nhất, hiển thị thông tin giới thiệu salon, hình ảnh thực tế.
- [ ] **Task 11.2**: Quy trình đặt lịch trực tuyến 4 bước: 
  - Bước 1: Chọn dịch vụ (hoặc gói liệu trình).
  - Bước 2: Chọn kỹ thuật viên mong muốn (hoặc ngẫu nhiên).
  - Bước 3: Chọn ngày & khung giờ trống.
  - Bước 4: Xác nhận thông tin và tạo lịch hẹn (PENDING).
- [ ] **Task 11.3**: Trang Hồ sơ cá nhân (Profile): Quản lý điểm tích lũy, hạng thành viên, danh sách thẻ dịch vụ đang sở hữu (số buổi còn lại), lịch sử đặt lịch.
- [ ] **Task 11.4**: Đánh giá & Phản hồi (Reviews): Form gửi đánh giá 1-5 sao và bình luận chất lượng phục vụ cho lịch hẹn đã hoàn thành.

---

## 📊 PHẦN 5: BÁO CÁO & ĐỒNG BỘ CHI TIẾT

### [ ] MODULE 12: HỆ THỐNG BÁO CÁO DOANH THU & HIỆU SUẤT (PC)
- [ ] **Task 12.1**: API tự động tổng hợp báo cáo ngày (`daily_revenue_reports`, `daily_branch_revenue`, `daily_employee_revenue`) bằng Cron Job.
- [ ] **Task 12.2**: UI Báo cáo chi nhánh (Manager/Admin): Xem biểu đồ doanh thu theo ngày/tháng, doanh thu theo phương thức thanh toán, chi phí vận hành chi nhánh.
- [ ] **Task 12.3**: UI Báo cáo hiệu suất thợ (Stylist Performance): Xếp hạng thợ làm nhiều dịch vụ nhất, thợ đạt doanh số cao nhất chi nhánh.
