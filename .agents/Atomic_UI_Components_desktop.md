# Cấu Trúc Thành Phần Nguyên Tử (Atomic UI Components Desktop) - Dự Án Salon App

Tài liệu này định nghĩa tất cả các thành phần UI nhỏ nhất (Atoms) không thể chia nhỏ hơn, phục vụ cho ứng dụng Salon. Tất cả các thành phần phải tuân thủ thiết kế Responsive.

---

## 1. NHÓM ĐIỀU HƯỚNG & THAO TÁC (ACTION & NAVIGATION)
* **Button**: Nút thao tác chính (Đặt lịch, Hủy, Thanh toán). 
    * *Biến thể (Variants)*: Primary, Secondary, Danger, Ghost.
* **IconButton**: Nút chỉ chứa icon (Quay lại `<-`, Đóng `X`, Menu `...`). Vùng chạm trên mobile phải đảm bảo tối thiểu 44x44px.
* **Link**: Đường dẫn văn bản để chuyển hướng nhanh (Ví dụ: "Xem tất cả dịch vụ", "Chính sách bảo mật").
* **TabItem**: Một mục duy nhất trong thanh chuyển đổi tab (Ví dụ: Tab "Sắp tới", "Đã hủy" trong danh sách lịch hẹn).

## 2. NHÓM NHẬP DỮ LIỆU (DATA INPUT)
* **InputText**: Ô nhập chuỗi ngắn (Tên khách hàng, Số điện thoại, Mã giảm giá).
* **TextArea**: Ô nhập văn bản dài (Ghi chú kiểu tóc cho thợ, mô tả tình trạng tóc).
* **Checkbox**: Hộp kiểm chọn nhiều (Chọn nhiều dịch vụ đi kèm: Cắt tóc, Gội đầu, Nhuộm).
* **RadioButton**: Nút chọn một trong nhiều (Chọn hình thức thanh toán: Tiền mặt, Chuyển khoản, Thẻ).
* **Switch / Toggle**: Công tắc Bật/Tắt trạng thái (Bật/Tắt nhận thông báo, Bật/Tắt trạng thái hoạt động của thợ).
* **Select / Dropdown**: Bộ chọn danh sách sổ xuống (Chọn chi nhánh, chọn thành phố).

## 3. NHÓM HIỂN THỊ THÔNG TIN & TRẠNG THÁI (DATA DISPLAY & STATUS)
* **Avatar**: Hình ảnh đại diện hình tròn (Ảnh của Stylist/Thợ, Ảnh hồ sơ khách hàng).
* **Badge / Tag**: Nhãn trạng thái nhỏ (Ví dụ: `Chờ duyệt`, `Đã xác nhận`, `Đang làm`, `Đã thanh toán`).
* **RatingStars**: Hiển thị số sao đánh giá của thợ (Ví dụ: hiển thị icon ngôi sao kèm text `4.8`).
* **PriceTag**: Định dạng hiển thị giá tiền của dịch vụ hoặc hóa đơn (Ví dụ: `250.000đ`).
* **Typography**: Các định dạng chữ chuẩn hóa hệ thống:
    * `Heading`: Tiêu đề lớn (Tên Salon, Tổng tiền).
    * `Subheading`: Tiêu đề phụ (Tên dịch vụ, Tên thợ).
    * `Body`: Văn bản nội dung (Mô tả chi tiết dịch vụ).
    * `Caption`: Chữ phụ nhỏ (Thời gian tạo hóa đơn, ngày hẹn).

## 4. NHÓM PHẢN HỒI & TRỰC QUAN (FEEDBACK & INDICATORS)
* **Spinner / Loader**: Vòng xoay báo hiệu đang tải dữ liệu (Khi đợi check lịch trống hoặc gọi API).
* **Skeleton**: Khung xương xám giả lập UI (Hiển thị trong lúc chờ tải danh sách dịch vụ hoặc bảng giá).
* **Tooltip**: Ô gợi ý nhỏ xuất hiện khi hover/click vào icon trợ giúp (Ví dụ: Giải thích "Phí dịch vụ" là gì).
* **DotIndicator**: Chấm đỏ nhỏ báo hiệu (Nằm trên icon Chuông để báo có thông báo mới hoặc lịch đặt mới).

## 5. NHÓM CHỌN THỜI GIAN & ĐẶC THÙ SALON (SALON SPECIFICS)
* **DateSlot**: Ô vuông hiển thị một ngày cụ thể (Ví dụ: `T2 - 15`), dùng trong luồng chọn ngày đặt lịch.
* **TimeSlot**: Ô hiển thị một khung giờ cụ thể (Ví dụ: `09:30`), tự động chuyển trạng thái `Disabled` (Màu xám, không cho bấm) nếu thợ đã kín lịch vào giờ đó.
* **ColorDot**: Chấm màu tròn hiển thị màu sắc thực tế (Dùng cho khách chọn màu sơn móng - Nails hoặc màu nhuộm tóc).

---

## YÊU CẦU CHO AI KHI XÂY DỰNG CODE (SYSTEM PROMPT):
1. Hãy viết các component này độc lập trong thư mục `src/components/ui/`.
2. Sử dụng giải pháp **CSS Modules** (`*.module.css`) kết hợp với hệ thống **CSS Variables** hiện có của dự án.
3. Không sử dụng Inline Styles trực tiếp trong JSX trừ khi là dynamic style.
4. Đảm bảo trạng thái `:hover` được bọc trong `@media (hover: hover)` để tránh lỗi dính hover trên thiết bị cảm ứng (Mobile).
5. Kích thước text trên input mobile tối thiểu phải là `16px` để tránh iOS tự động zoom màn hình.