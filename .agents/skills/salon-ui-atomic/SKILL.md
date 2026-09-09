---
name: salon-ui-atomic
description: >-
  Use this skill when creating or updating Atomic UI components (atoms/molecules) for the Salon web applications following responsive design, CSS Modules, and token standards.
---

# Quy Chuẩn & Quy Trình Tạo Atomic UI Components (`salon-ui-atomic`)

Hướng dẫn chuẩn cho AI Agent khi thiết kế và sinh mã các thành phần giao diện nguyên tử (Atomic UI Components) trong các ứng dụng Frontend của dự án Salon App (đặc biệt là [`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal)).

---

## 1. Phân Nhóm Các Thành Phần Nguyên Tử (Atoms)

Tất cả các components nguyên tử được đặt độc lập trong thư mục `src/components/ui/`:

### A. Nhóm Điều Hướng & Thao Tác (Action & Navigation)
- **Button**: Nút chính (Đặt lịch, Hủy, Thanh toán POS). Hỗ trợ các variants: `primary`, `secondary`, `danger`, `ghost`, `outline`.
- **IconButton**: Nút icon vuông tròn (Quay lại `<-`, Đóng `X`, Menu `...`).
- **TabItem**: Mục tab chuyển đổi trong thanh tabs (Lịch hẹn "Sắp tới", "Đang phục vụ", "Đã hủy").

### B. Nhóm Nhập Liệu (Data Input)
- **InputText**: Ô nhập văn bản ngắn (Tên khách, SĐT, Mã giảm giá).
- **TextArea**: Ô nhập ghi chú dịch vụ hoặc tình trạng móng/tóc.
- **Checkbox / RadioButton**: Chọn nhiều dịch vụ hoặc chọn 1 hình thức thanh toán.
- **Switch / Toggle**: Bật/tắt ca trực, bật/tắt nhận khách thợ.
- **Select / Dropdown**: Bộ chọn chi nhánh, chọn thợ phục vụ.

### C. Nhóm Hiển Thị Thông Tin & Trạng Thái (Data Display & Status)
- **Avatar**: Ảnh đại diện Stylist/Kỹ thuật viên hoặc Khách hàng.
- **Badge / Tag**: Nhãn trạng thái (`Chờ duyệt`, `Đang làm`, `Đã thanh toán`, `Vắng mặt`).
- **RatingStars**: Hiển thị số sao đánh giá kỹ thuật viên kèm điểm số.
- **PriceTag**: Hiển thị giá tiền định dạng chuẩn (ví dụ: `250.000đ` hoặc `$25.00`).

### D. Nhóm Phản Hồi & Trực Quan (Feedback & Indicators)
- **Spinner / Loader**: Vòng xoay khi đang kiểm tra lịch trống hoặc gọi API.
- **Skeleton**: Khung xương giả lập cấu trúc UI khi dữ liệu đang tải.
- **DotIndicator**: Chấm tròn màu (báo thợ đang bận/rảnh, báo thông báo mới).

### E. Nhóm Đặc Thù Nghiệp Vụ Salon (Salon Specifics)
- **DateSlot**: Ô chọn ngày trong tuần (ví dụ: `T2 - 15`).
- **TimeSlot**: Ô chọn khung giờ đặt lịch (ví dụ: `09:30`), tự động chuyển sang trạng thái `Disabled` khi thợ đã kín lịch.
- **ColorDot**: Chấm màu trực quan cho khách chọn màu sơn móng (Nails) hoặc màu nhuộm tóc.

---

## 2. Tiêu Chuẩn Kỹ Thuật Bắt Buộc Khi Viết Code

Khi sinh mã cho component UI:

1. **Vị trí file**: Đặt tại `src/components/ui/<ComponentName>/` gồm 2 file:
   - `<ComponentName>.tsx`
   - `<ComponentName>.module.css`
2. **Sử dụng CSS Modules & CSS Variables**:
   - Sử dụng các biến màu và kích thước toàn cục (ví dụ: `var(--color-primary)`, `var(--radius-md)`, `var(--font-base)`).
   - Không sử dụng inline style trực tiếp trừ khi là style tính toán động.
3. **Tối ưu hóa thiết bị cảm ứng (Mobile & Tablet)**:
   - Mọi hiệu ứng `:hover` **bắt buộc** phải bọc trong `@media (hover: hover)`:
     ```css
     @media (hover: hover) {
       .button:hover {
         background-color: var(--color-primary-dark);
       }
     }
     ```
   - Cỡ chữ `font-size` của các ô nhập liệu (`input`, `textarea`, `select`) trên màn hình di động **tối thiểu phải là 16px** để ngăn chặn trình duyệt Safari trên iOS tự động zoom màn hình.
4. **Hỗ trợ Accessibility (a11y)**:
   - Các nút bấm icon phải có `aria-label`.
   - Các ô nhập dữ liệu phải liên kết với `label` qua `id` / `htmlFor`.
   - Tương tác bàn phím (`focus-visible` outline rõ ràng).
