# Quy Tắc Dự Án & Thiết Kế Kiến Trúc (Project Rules & Customizations)

## 1. Kiến Trúc Reusable AI-Assisted Import Engine (DeepSeek)
Tính năng nhập dữ liệu (import) từ file Excel/CSV qua đối chiếu trường bằng AI (DeepSeek) sẽ tuân thủ thiết kế sau:

### Giao Diện (UI/UX)
- Hỗ trợ cả hai cơ chế kích hoạt import:
  1. **Kéo thả file vào màn hình**: Cho phép người dùng kéo thả trực tiếp file (`.xlsx`, `.xls`, `.csv`) vào khu vực quy định (Dropzone) trên màn hình để khởi chạy Wizard Import.
  2. **Nút Import**: Có nút click "Nhập dữ liệu / Import" trực quan để mở giao diện chọn file.
- **Tiến trình các bước của Import Wizard**:
  - Bước 1: Tải file lên (qua Kéo thả hoặc Nút bấm).
  - Bước 2: Hiển thị bảng đối chiếu trường dữ liệu (Column Mapper) - so khớp tự động đề xuất từ AI (DeepSeek), cho phép người dùng thay đổi thủ công, và nhập giá trị mặc định cho các cột thiếu.
  - Bước 3: Xem trước dữ liệu sau khi ánh xạ.
  - Bước 4: Thực thi import và hiển thị tiến trình cùng danh sách lỗi cụ thể theo từng dòng (nếu có).

### Cấu Trúc Thư Mục & Phân Tách Mã Nguồn
- **Backend (`apps/backend-api/src/`)**:
  - `import-engine/`: Chứa mã nguồn cốt lõi (Module, Controller, Service).
  - `import-engine/strategies/`: Định nghĩa các strategy (luật validate, mapping, db insert) riêng cho mỗi thực thể (ví dụ: `ServiceImportStrategy`, `StaffImportStrategy`, `InventoryImportStrategy`) nhằm tối đa hóa tái sử dụng mã nguồn.
- **Frontend (`apps/tenant-portal/src/`)**:
  - `components/desktop/ImportWizard/`: Chứa component UI dùng chung cho toàn bộ wizard.
  - `hooks/useImportWizard.ts`: Hook dùng chung để quản lý state và gọi các API xử lý.

### Quy Trình Gọi AI (DeepSeek API)
- Client đọc file và gửi danh sách tiêu đề cột (Headers) + 3 dòng dữ liệu mẫu (Sample Rows) + Cấu trúc bảng đích (Target Schema) lên backend.
- Backend gửi Prompt tới DeepSeek (sử dụng JSON Mode) để nhận về ánh xạ đề xuất, tiết kiệm token tối đa.
- Cấu hình API Key và Endpoint trong file `.env` của backend.
