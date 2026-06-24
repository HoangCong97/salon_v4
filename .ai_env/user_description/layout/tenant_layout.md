# ĐỀ XUẤT THIẾT KẾ LAYOUT - SITE TENANT (SALON PORTAL)

Tài liệu này chi tiết hóa cấu trúc Layout thích ứng (Adaptive Layout), lưới giao diện (Grid System), luồng điều hướng (Navigation Flow), và thiết kế giao diện (UI/UX Specification) dành cho Site Tenant (Salon Portal), phục vụ cả nhóm quản lý (Admin, Manager, Cashier trên PC/Tablet) và nhân viên (Employee trên Mobile).

---

## 📐 I. KẾ THỪA VÀ PHÂN BỔ BỐ CỤC CHUNG (GLOBAL LAYOUT GRID & INHERITANCE)

Phân hệ Tenant Portal kế thừa toàn bộ các thiết lập CSS variables, cấu trúc layout cơ bản, và phong cách thiết kế (Dark Glassmorphism, harmonious HSL palettes) từ [super_layout](file:///c:/Workspace/Web09_salon-app/.ai_env/user_description/layout/super_layout).

### 1. Bảng màu & Giao diện (Color & Theming)
- **Hệ màu chủ đạo (HSL)**:
  - Nền hệ thống: `var(--bg-system-gray)` (Light: `#F8FAFC` / Dark: `#0F172A`).
  - Màu thương hiệu (Brand Accent): `var(--color-primary)` (Slate/Charcoal cao cấp kết hợp với Rose Gold hoặc Emerald HSL).
- **Màu sắc trạng thái (Status Colors)**:
  - **Lịch hẹn (Booking)**:
    - *Chờ xác nhận*: `var(--color-warning)` (Amber/Orange).
    - *Đã xác nhận*: `var(--color-info)` (Sky Blue).
    - *Đã hoàn thành*: `var(--color-success)` (Emerald/Green).
    - *Đã hủy / Khách không đến*: `var(--color-danger)` (Crimson/Red).
  - **Hóa đơn & Thanh toán (Invoice)**:
    - *Đã thanh toán*: `var(--color-success)`.
    - *Chờ thanh toán*: `var(--color-warning)`.
    - *Đã hủy*: `var(--color-danger)`.
- **Hiệu ứng mượt mà**:
  - Áp dụng **Glassmorphism** nhẹ (`backdrop-filter: blur(12px)`) đối với các thanh điều hướng, modal nổi và ngăn kéo chi tiết (Drawers).

### 2. Định dạng thích ứng (Adaptive Layout Grid)
Hệ thống sử dụng **Adaptive Routing & Layout** dựa trên vai trò người dùng (JWT Role) và kích thước màn hình để quyết định render layout phù hợp:

- **A. Desktop/Tablet Layout (Admin, Manager, Cashier)**:
  - Cấu trúc 3 vùng: **Sidebar** (Cố định 260px/68px) + **Topbar** (Cao 70px) + **Main Content Area** (Cuộn độc lập, padding 24px).
  - Khung cha: `display: flex; height: 100vh; overflow: hidden;`

- **B. Mobile Layout (Employee)**:
  - Giao diện Mobile-first hoàn chỉnh được nhúng trong ứng dụng Tenant Portal.
  - Cấu trúc: **Mobile Header** (Cao 60px) + **Mobile Content Area** (Cuộn dọc, padding 16px, cách đáy 80px) + **Bottom Navigation Bar** (Cao 64px, cố định dưới cùng).
  - Khung cha: `width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-system-gray);`

---

## 🖥️ II. CHI TIẾT GIAO DIỆN DESKTOP (ADMIN, MANAGER, CASHIER VIEW)

### 1. Bổ sung Topbar Tenant
Khác với `super_layout`, Topbar của Tenant Portal bổ sung:
- **Thanh chọn chi nhánh (Branch Selector Dropdown)**: Cho phép chuyển đổi nhanh giữa các chi nhánh (`branch_id`) mà người dùng có quyền quản lý.
- **Trạng thái tua làm việc (Turn System status)**: Đối với Cashier/Manager, hiển thị nhanh số lượng thợ đang trong ca và trạng thái xoay tua.

```
+-----------------------------------------------------------------------------------+
|  LOGO  | [Toggle]  [Chi nhánh: Quận 1 ▾]       [Tìm kiếm toàn cục...]  (🔔)  (👤) |
| (64px) | Chiều cao: 70px                                                          |
+--------+--------------------------------------------------------------------------+
```

### 2. Sidebar Điều hướng (Tenant Navigation)
- **`Tổng quan` (Dashboard)**: Báo cáo nhanh doanh số chi nhánh, lượt khách, hiệu suất nhân viên.
- **`Lịch hẹn` (Scheduler Grid)**: Lưới quản lý đặt lịch hẹn thời gian thực.
- **`Bán hàng & POS` (Checkout)**: Màn hình tạo hóa đơn, chọn dịch vụ và thanh toán.
- **`Khách hàng` (Customers)**: Quản lý thông tin, hạng thành viên, lịch sử mua thẻ liệu trình.
- **`Nhân sự & Chấm công` (Staff & Attendances)**: Phân ca kíp, giám sát tua thợ, bảng chấm công.
- **`Cấu hình Lương & Hoa hồng` (Payroll Config)**: Áp dụng template hoa hồng, tính lương tháng.
- **`Dịch vụ & Sản phẩm` (Services & Inventories)**: Quản lý menu dịch vụ và kho hàng chi nhánh.
- **`Cấu hình Chi nhánh` (Branch Settings)**: Cài đặt giờ mở cửa, thông tin liên hệ.

---

## ✏️ III. BLUEPRINT CÁC TRANG CHÍNH TRÊN DESKTOP

### 1. Trang Quản Lý Lịch Hẹn (Scheduler Grid Layout)
Giao diện hiển thị lịch hẹn dạng lưới trực quan theo nhân viên và dòng thời gian trong ngày.

```
+----------------------------------------------------------------------------------+
| [Bộ lọc: Ngày hôm nay ▾] [Thợ chính ▾] [Thợ phụ ▾]           [Nút: + Đặt lịch mới] |
+----------------------------------------------------------------------------------+
| (LƯỚI LỊCH BIỂU - SCHEDULER GRID)                                                 |
| GIỜ      | THỢ A (Stylist)         | THỢ B (Stylist)         | THỢ C (Nail Tech)     |
|----------|-------------------------|-------------------------|-----------------------|
| 09:00 AM | [Khách Hùng - Cắt tóc]  | (Trống - click để đặt)  | [Khách Lan - Nail Art]|
| 09:30 AM | [    (Trạng thái: Đã xác|                         | [     (Trạng thái: In-|
| 10:00 AM |      nhận CONFIRMED)  ] |                         |      progress)       ]|
| 10:30 AM |                         | [Khách Nam - Nhuộm]     |                       |
| 11:00 AM | (Trống)                 | [    (Trạng thái: Đã    | (Trống)               |
| 11:30 AM |                         |     thanh toán DONE)  ] |                       |
+----------------------------------------------------------------------------------+
```

- **Tính năng tương tác (UX Interactions)**:
  - **Drag-and-Drop (Kéo thả)**: Cho phép kéo thẻ lịch hẹn từ thợ này sang thợ khác hoặc đổi khung giờ trực quan.
  - **Click to Create**: Click vào ô trống trên lưới để mở nhanh Form Đặt Lịch với thông tin giờ và nhân viên được tự động điền.
  - **Hover Tooltip**: Di chuột vào thẻ lịch hẹn để xem chi tiết: Tên khách, số điện thoại, ghi chú dịch vụ và tổng tiền dự kiến.

### 2. Màn hình Bán hàng tại Quầy & POS Checkout (Split-Pane Layout)
Sử dụng bố cục Split-Pane bất đối xứng chia màn hình thành 2 phần chính:

- **Phía bên trái (7/12) - Khu vực Lựa chọn & Tìm kiếm nhanh**:
  - **Phía trên cùng**: Danh sách nhân viên của chi nhánh đang hoạt động, hiển thị dưới dạng thẻ hoặc nút bấm giúp cashier click nhanh để gán công việc.
  - **Phía dưới danh sách nhân viên**: Ô tìm kiếm kết hợp các nút bấm phân loại lớn: **[ Tất cả ]**, **[ Dịch vụ ]**, **[ Sản phẩm ]**, **[ Gói ]** để tối ưu tốc độ nhấn trực tiếp. (hien thi tren cung 1 hang)
  - **Phía dưới cùng**: Chứa tất cả item bao gồm dịch vụ, sản phẩm và gói, hiển thị đồng bộ nhưng được ngăn cách rõ ràng bằng tiêu đề Section và phân biệt bằng màu sắc nền riêng biệt cho từng loại.

```
+----------------------------------------------------------------------------------+
| (BÊN TRÁI - 7/12): CHỌN DỊCH VỤ & THỢ             | (BÊN PHẢI - 5/12): HÓA ĐƠN      |
| +----------------------------------------------+ | +-----------------------------+ |
| | NHÂN VIÊN ĐANG HOẠT ĐỘNG:                    | | | KHÁCH HÀNG: [ Nguyễn Văn A] | |
| | [Thợ A] [Thợ B] [Thợ C] [Thợ D]              | | | Hạng thẻ: Vàng (Tích lũy)   | |
| |----------------------------------------------| | +-----------------------------+ |
| | [Kính lúp] Tìm dịch vụ, sản phẩm, gói...     | | | CÁC MỤC CHỌN (CART ITEMS)     | |
| | [ Tất cả ] [ Dịch vụ ] [ Sản phẩm ] [ Gói ]  | | | 1. Cắt tóc nam - Thợ A      | |
| |----------------------------------------------| | |    Lương cứng + 15% Hoa hồng  | |
| | -- DỊCH VỤ (Màu theo phân loại dịch vu) ---------------- | | | 2. Dầu gội phục hồi - Thợ B   | |
| | [ Cắt tóc nam - 150k ] [ Uốn tóc - 500k ]    | | |    Hoa hồng: 10k              | |
| |                                              | | +-----------------------------+ |
| | -- SẢN PHẨM (Màu nâu gỗ) ------------------ | | | Mã giảm giá: [ VOUCHER10% ]   | |
| | [ Dầu gội - 180k ]    [ Sáp vuốt - 220k ]    | | | Phương thức: [ Chuyển khoản ] | |
| |                                              | | |                               | |
| | -- GÓI / COMBO (Màu tím) ------------------- | | | TỔNG CỘNG:          650.000đ  | |
| | [ Combo Gội & Massage - 120k ]               | | | GIẢM GIÁ:           -65.000đ  | |
| +----------------------------------------------+ | | THÀNH TIỀN:         585.000đ  | |
|                                                  | | [ BUTTON: IN & THANH TOÁN ]   | |
|                                                  | | +-----------------------------+ |
+----------------------------------------------------------------------------------+
```

---

## 📱 IV. CHI TIẾT GIAO DIỆN DI ĐỘNG (EMPLOYEE VIEW)

Giao diện dành riêng cho nhân viên thực hiện dịch vụ được thiết kế theo triết lý **Mobile-first** nhằm mang lại trải nghiệm tối giản, mượt mà như một ứng dụng Native trên iOS/Android.

### 1. Thanh điều hướng dưới cùng (Bottom Navigation Bar)
Cố định dưới đáy màn hình giúp nhân viên dễ dàng chuyển đổi tab chỉ bằng một tay.
- **`Lịch Hẹn` (Calendar/List Icon)**: Xem lịch làm việc và danh sách khách hàng được gán trong ngày.
- **`Chấm Công` (Clock/Check-in Icon)**: Nút bấm điểm danh check-in/out, xem ca trực tuần.
- **`Hoa Hồng` (Dollar/Chart Icon)**: Bảng thống kê thu nhập tạm tính, tua thợ của ngày và lịch sử lương.
- **`Cá Nhân` (User Icon)**: Thông tin tài khoản, đổi mật khẩu, xem KPI cá nhân.

```
+-------------------------------------------------------------+
|                                                             |
|                                                             |
|                   [ KHU VỰC HIỂN THỊ NỘI DUNG ]             |
|                                                             |
|                                                             |
+-------------------------------------------------------------+
|    (📅)            (⏰)            (💵)            (👤)     |
|  Lịch Hẹn       Chấm Công       Hoa Hồng        Cá Nhân     |
+-------------------------------------------------------------+
```

### 2. Thiết kế các màn hình chính trên Mobile
- **Trang Lịch Hẹn cá nhân (Shift Worklist)**:
  - Hiển thị theo dòng thời gian (Timeline) các khung giờ đã có khách đặt.
  - Các thẻ lịch hẹn phân biệt rõ ràng trạng thái qua màu sắc badge.
  - Hỗ trợ nút trượt (Swipe action) để nhanh chóng cập nhật trạng thái lịch hẹn: Vuốt sang phải để xác nhận **Đang thực hiện (In-progress)**, Vuốt sang trái để đánh dấu **Hoàn thành (Done)**.
- **Trang Chấm Công (Attendance Board)**:
  - Hiển thị bản đồ định vị GPS chi nhánh hiện tại và nút bấm to tròn `Check-in / Check-out` hiệu ứng sóng âm khi nhân viên đến salon.
  - Bảng tổng hợp ca trực tuần hiện tại: Ngày làm việc, ca sáng/chiều, trạng thái đi muộn/về sớm.
- **Trang Thống Kê Thu Nhập (Real-time Commission)**:
  - Chỉ số tổng hợp (Widgets) nổi bật: Doanh thu thực hiện hôm nay, Hoa hồng tạm tính, Vị trí xoay tua hiện tại trong ngày (ví dụ: *Bạn đang ở lượt số 2 - Sắp tới lượt nhận khách*).
  - Danh sách chi tiết các hóa đơn dịch vụ đã hoàn thành trong ngày để nhân viên tự đối soát.

---

## ⚙️ V. CÁC QUY TẮC PHẢN HỒI VÀ KHẢ NĂNG TIẾP CẬN (UX & INTERACTION RULES)

1. **Chuyển đổi Layout (Responsive Breakpoints)**:
   - Khi chiều rộng màn hình lớn hơn `768px`, nếu tài khoản đăng nhập là Admin/Manager/Cashier, hệ thống sẽ sử dụng giao diện Desktop.
   - Khi chiều rộng màn hình nhỏ hơn hoặc bằng `768px`, hệ thống sẽ tự động tối ưu hóa hiển thị và ẩn bớt các menu phức tạp. Riêng Employee luôn được định tuyến trực tiếp vào giao diện Mobile-first bất kể kích thước màn hình nào.
2. **Quy tắc hiển thị lỗi và thông báo (Alerts & Modals)**:
   - Khi thực hiện các tác vụ quan trọng như hủy lịch hẹn, xóa thẻ dịch vụ của khách, thanh toán hóa đơn giá trị lớn: Bắt buộc mở Modal xác nhận từ tâm màn hình với hai lựa chọn rõ ràng.
   - Nút xác nhận hành động nguy hiểm luôn có màu nền đỏ (`var(--color-danger)`) hoặc cam đậm.
3. **Empty States**:
   - Khi lưới lịch hẹn trống hoặc danh sách khách hàng tìm kiếm không thấy kết quả: Hiển thị hình ảnh minh họa mờ (SVG/Icon) cùng gợi ý hành động cụ thể (ví dụ: *"Chưa có lịch hẹn nào được đặt trong ngày hôm nay. Bấm nút bên dưới để tạo mới"*).