# HƯỚNG DẪN TƯƠNG TÁC VỚI AI AGENT (.agents/README.md)

Thư mục `.agents/` này chứa các file cấu hình và tài liệu hướng dẫn dành riêng cho AI Agent (như Antigravity, Cursor, Copilot, v.v.) khi làm việc trong dự án SaaS Salon App.

---

## 1. Các File Trong Thư Mục
 
*   **`AGENTS.md`**: Chứa các quy tắc code (Coding Standards) và nguyên tắc hoạt động (như tối ưu hóa database, cấu trúc component) mà AI Agent bắt buộc phải tuân theo khi tạo hoặc chỉnh sửa code.
*   **`AI_CONTEXT.md`**: "Bản đồ dự án" giúp AI Agent nhanh chóng nắm bắt cấu trúc Monorepo, vai trò của từng thư mục con (`apps/`, `packages/`) và các luồng nghiệp vụ quan trọng.
*   **`Atomic_UI_Components_desktop.md`**: Tài liệu định nghĩa cấu trúc và danh sách toàn bộ các thành phần UI nguyên tử (Atoms) chuẩn Responsive dành cho giao diện Desktop.
*   **`DIRECTORY_DESCRIPTIONS.md`**: Chứa mô tả chi tiết về chức năng và nhiệm vụ của từng thư mục trong dự án, giúp AI định hướng chính xác nơi cần thực hiện thay đổi.
*   **`generate_tree.js`**: Script Node.js tự động quét dự án để cập nhật sơ đồ cấu trúc cây thư mục.
*   **`project_structure.txt`**: Chứa sơ đồ cấu trúc thư mục toàn dự án dưới dạng cây phân cấp được tạo ra từ script `generate_tree.js` (đã lọc bỏ `node_modules` và file build rác).
*   **`websocket_gaps.md`**: Chứa danh sách các vị trí và API endpoints chưa đồng bộ WebSocket để tham khảo cho việc mở rộng tính năng trong tương lai.

---

## 2. Hướng Dẫn Dành Cho Nhà Phát Triển (Human Developer)

Để AI hỗ trợ bạn hiệu quả nhất, hãy áp dụng các mẹo tương tác dưới đây:

### A. Cung cấp ngữ cảnh rõ ràng bằng thẻ tag `@`
*   Khi yêu cầu AI chỉnh sửa hoặc refactor một component/controller, hãy đề cập trực tiếp đến file hoặc thư mục đó bằng cú pháp `@` (ví dụ: `@[apps/tenant-portal/src/pages/desktop/StaffManagement]` hoặc `@[apps/backend-api/src/staff.controller.ts]`).
*   Điều này giúp AI mở đúng file cần làm việc ngay lập tức, tiết kiệm thời gian tìm kiếm.

### B. Yêu cầu AI cập nhật cấu trúc dự án khi thêm/xóa file
*   Nếu bạn hoặc AI tạo thêm các file mới hoặc tái cấu trúc các thư mục chính, hãy yêu cầu AI chạy lại script tạo cấu trúc cây thư mục:
    ```bash
    node .agents/generate_tree.js
    ```
    Việc này giúp cập nhật file `project_structure.txt` để các phiên làm việc tiếp theo của AI luôn có sơ đồ thư mục chính xác nhất.

### C. Nhắc nhở AI tuân thủ nguyên tắc tối ưu hóa database
*   Nếu nhận thấy API chạy chậm, bạn có thể nhắc AI kiểm tra xem có câu lệnh truy vấn database nào nằm trong vòng lặp hay không, hoặc yêu cầu AI áp dụng cơ chế **In-memory Caching** tại NestJS Controller như đã triển khai thành công tại `staff.controller.ts`.
