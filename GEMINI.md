# AI AGENT WORKSPACE GUIDELINES — SAAS SALON MONOREPO (`salon_v4`)

Tài liệu này là quy chuẩn và chỉ dẫn cấp cao nhất cho AI Agent (Antigravity) khi làm việc trong toàn bộ workspace `salon_v4`. Mọi hành động lập trình, tìm hiểu mã nguồn và tái cấu trúc đều phải tuân thủ nghiêm ngặt các nguyên tắc dưới đây.

---

## 1. 🔍 Nguyên Tắc Khảo Sát Mã Nguồn (Code Exploration)

Dự án đã được đánh chỉ mục bởi **CodeGraph** (tại thư mục [`.codegraph/`](file:///c:/Workspace/salon_v4/.codegraph)).

> [!IMPORTANT]
> **LUÔN ƯU TIÊN SỬ DỤNG CODEGRAPH TRƯỚC TIÊN**:
> Khi cần tìm hiểu code, giải thích kiến trúc, tìm flow dữ liệu, quan hệ giữa các hàm/class, hoặc phân tích ảnh hưởng trước khi sửa code:
> - **Gọi công cụ MCP**: `codegraph_explore` (thuộc MCP server `codegraph`) trước khi dùng `grep_search`, `find` hoặc đọc tuần tự nhiều file thủ công.
> - Cung cấp tên symbol, file hoặc câu hỏi nghiệp vụ cần khảo sát kèm theo `projectPath: "c:\\Workspace\\salon_v4"`.
> - Chỉ dùng các công cụ tìm kiếm văn bản thông thường khi cần kiểm tra chuỗi tĩnh không thuộc symbol code hoặc sau khi CodeGraph đã định vị vùng quan tâm.

---

## 2. 🗺️ Bản Đồ Kiến Trúc Dự Án (Monorepo Map)

Dự án được quản lý dưới dạng Monorepo với `pnpm` workspace và `turbo`:

- **Tài liệu ngữ cảnh đầy đủ**: Luôn tham khảo [`.agents/AI_CONTEXT.md`](file:///c:/Workspace/salon_v4/.agents/AI_CONTEXT.md) để nắm rõ luồng nghiệp vụ cốt lõi (Daily Turns, Dynamic Permissions, WebSocket Real-time Sync).
- **Phân chia trách nhiệm các ứng dụng (`apps/`)**:
  - [`apps/backend-api`](file:///c:/Workspace/salon_v4/apps/backend-api): REST API Gateway + WebSockets (NestJS + Prisma). Tuân thủ kiến trúc 4 lớp (`Controller -> Service -> Repository -> Prisma`).
  - [`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal): Cổng quản lý dành cho Salon Owner/Manager/Staff (React + Vite + Zustand + Tailwind/CSS Modules).
  - [`apps/customer-booking`](file:///c:/Workspace/salon_v4/apps/customer-booking): Ứng dụng đặt lịch trực tuyến cho khách hàng (Next.js App Router tối ưu SEO).
  - [`apps/internal-admin`](file:///c:/Workspace/salon_v4/apps/internal-admin): Cổng quản trị dành cho Super Admin (Vite + React SPA).
- **Phân chia gói dùng chung (`packages/`)**:
  - [`packages/database`](file:///c:/Workspace/salon_v4/packages/database): Định nghĩa Prisma schema và quản lý kết nối cơ sở dữ liệu (`@salon/database`). Không khởi tạo Prisma Client riêng lẻ trong các module.
  - [`packages/shared-types`](file:///c:/Workspace/salon_v4/packages/shared-types): Chứa Type/Interface dùng chung giữa Backend và Frontend (`@salon/shared-types`).
  - [`packages/shared-utils`](file:///c:/Workspace/salon_v4/packages/shared-utils): Chứa helper, formatters, validation schemas dùng chung (`@salon/shared-utils`).

---

## 3. 📋 Bộ Quy Tắc Chuyên Sâu Cần Tuân Thủ

Trước khi can thiệp vào từng tầng cụ thể, hãy đọc và áp dụng tài liệu quy tắc tương ứng:

1. **Backend Rules**: [`.agents/rules/backend_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/backend_rule.md)
   - Không viết business logic trong Controller.
   - Luôn validate input qua DTO bằng `class-validator`.
   - Bắt buộc xử lý lỗi qua `HttpException`, không để catch rỗng, không log lộ thông tin nhạy cảm.
   - Dùng NestJS `Logger`, không để `console.log`.

2. **Frontend Rules**: [`.agents/rules/frontend_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/frontend_rule.md)
   - Component đơn nhiệm (< 200 dòng).
   - Tách tầng: `Page -> Custom Hook -> Service -> TanStack Query v5`.
   - Bắt buộc xử lý đầy đủ 3 trạng thái: **Loading**, **Empty**, **Error**.
   - Chuẩn Responsive: font size ô nhập trên mobile tối thiểu 16px, trạng thái `:hover` bọc trong `@media (hover: hover)`.

3. **Database Standards**: [`.agents/rules/database_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/database_rule.md)
   - Tuân thủ chuẩn 3NF, đặt tên `snake_case`.
   - Khóa chính UUID/CUID, khóa ngoại quan hệ rõ ràng, index hợp lý cho các trường tìm kiếm/lọc.
   - Mọi thay đổi cấu trúc bảng phải thực hiện qua Prisma Migration.

4. **Monorepo Boundaries**: [`.agents/rules/monorepo_rule.md`](file:///c:/Workspace/salon_v4/.agents/rules/monorepo_rule.md)
   - Tuyệt đối KHÔNG import chéo trực tiếp giữa các thư mục trong `apps/`. Mọi chia sẻ dữ liệu/logic phải đặt tại `packages/`.
   - Cài đặt dependency đúng phạm vi bằng lệnh `pnpm --filter <workspace-name> add <package>`.

---

## 4. ⚡ Các Kỹ Năng Tự Động Hóa (Skills) Sẵn Sàng

Khi nhận nhiệm vụ phức tạp, AI hãy kích hoạt các skill tương ứng:
- **`salon-feature-builder`**: Quy trình chuẩn từ CSDL -> Backend API -> WebSocket -> UI khi tạo tính năng mới.
- **`salon-db-migration`**: Quy trình thao tác schema, chạy migration an toàn và sinh Prisma Client.
- **`salon-ui-atomic`**: Hướng dẫn xây dựng các thành phần Atomic UI chuẩn Responsive và Design Tokens.
- **`salon-realtime-sync`**: Quy trình đồng bộ dữ liệu thời gian thực qua NestJS WebSocket Gateway và React hook `useWebSocketSync`.

---

## 5. ✅ Checklist Bắt Buộc Trước Khi Hoàn Thành Nhiệm Vụ

- [ ] Không còn `any` không cần thiết, TypeScript `strict: true`.
- [ ] Không còn lệnh `console.log` thừa trong code.
- [ ] Đã xử lý đầy đủ các trường hợp biên (Loading, Empty, Error handling).
- [ ] Đã kiểm tra tính toàn vẹn của Monorepo (`turbo run lint` hoặc `pnpm build`).
- [ ] Cập nhật sơ đồ thư mục [`.agents/project_structure.txt`](file:///c:/Workspace/salon_v4/.agents/project_structure.txt) nếu có thêm/xóa file.
