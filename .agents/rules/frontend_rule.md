# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE FRONTEND (React + TypeScript + UI)

Tài liệu này quy định các tiêu chuẩn bắt buộc khi phát triển, mở rộng hoặc sửa lỗi tầng Frontend (đặc biệt là [`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal) và [`apps/customer-booking`](file:///c:/Workspace/salon_v4/apps/customer-booking)) trong hệ thống SaaS Salon App (`salon_v4`).

---

### 1. Quy Chuẩn Lập Trình & Đặt Tên (Coding Style & Naming)

- **Quy ước đặt tên**:
  - Component, Interface, Type, Enum: `PascalCase` (ví dụ: `DailyTurnsTable`, `StaffMember`)
  - Custom Hook: `useXxx` (ví dụ: `useStaffTurns`, `useWebSocketSync`)
  - Hàm, biến: `camelCase` (ví dụ: `calculateTurnScore`, `handleCheckout`)
  - Hằng số cố định: `UPPER_SNAKE_CASE` (ví dụ: `MAX_SERVICES_PER_BOOKING`)
- **TypeScript**:
  - Bật chế độ `strict: true`.
  - Nghiêm cấm dùng `any` hoặc ép kiểu vô tội vạ (`as any`).
  - Dùng `interface` cho cấu trúc dữ liệu Object, dùng `type` cho Union/Intersection.

---

### 2. Thiết Kế Component & Trách Nhiệm Đơn Nhất (Single Responsibility)

- Mỗi component chỉ nên đảm nhiệm **một trách nhiệm duy nhất**.
- Độ dài khuyến nghị: 100 - 200 dòng. Nếu component vượt quá 300 dòng, **bắt buộc** tách thành các sub-components hoặc custom hooks.
- Không truyền props sâu (prop drilling > 3 tầng): Sử dụng Context API hoặc Zustand store.
- **Tách tầng xử lý dữ liệu**:
  ```text
  Page Component (Trang tổng thể, điều phối layout)
       ↓
  Custom Hook    (Quản lý logic, trạng thái local & server state qua TanStack Query)
       ↓
  Service / API  (Thực hiện gọi HTTP endpoint qua Axios/Fetch Client)
  ```

---

### 3. Quản Lý Trạng Thái (State Management)

- **Server State (Dữ liệu từ API)**: Sử dụng **TanStack Query v5** (`useQuery`, `useMutation`).
  - Luôn định nghĩa query keys có cấu trúc rõ ràng (ví dụ: `['staff', tenantId, branchId]`).
  - Sử dụng `queryClient.invalidateQueries` khi có WebSocket event hoặc sau khi mutate dữ liệu thành công.
- **Client State (Trạng thái giao diện, giỏ hàng, modal)**: Sử dụng **Zustand**.
- **Local State**: `useState` hoặc `useReducer` cho các tương tác nội bộ component (accordion, dropdown open/close).
- **Nguyên tắc**: Không lưu vào state những dữ liệu có thể tính toán được (derived state).

---

### 4. Bắt Buộc Xử Lý Đầy Đủ 3 Trạng Thái UI (Loading - Empty - Error)

Mỗi màn hình danh sách, bảng dữ liệu hoặc form lấy dữ liệu từ API phải xử lý tường minh 3 trường hợp:
1. **Loading State**: Sử dụng Skeleton hoặc Spinner mượt mà, tránh tình trạng màn hình giật/trắng xóa.
2. **Empty State**: Hiển thị hình ảnh hoặc icon kèm thông điệp rõ ràng và nút hành động (ví dụ: "Chưa có nhân viên nào trong ca trực này. [Thêm nhân viên]").
3. **Error State**: Bắt lỗi từ TanStack Query, hiển thị thông báo thân thiện và có nút "Thử lại" (Retry).

---

### 5. Giao Diện & Thẩm Mỹ (Styling, Responsive & Mobile-First)

- **Quy chuẩn Styling theo nền tảng**:
  - **Giao diện Mobile (`src/pages/mobile/*`, Mobile Components)**: **Bắt buộc sử dụng TailwindCSS** (utility-first classes) thay vì CSS thuần hay CSS Modules để tăng tốc độ phát triển, tối ưu responsive và đồng bộ palette màu từ cấu hình Tailwind (`tailwind.config.cjs`).
  - **Giao diện Desktop**: Hiện tại duy trì song song các component dùng CSS Modules (`*.module.css`), nhưng **định hướng tương lai sẽ refactor toàn bộ Desktop về TailwindCSS** nhằm thống nhất 1 hệ thống styling. Khi viết mới component hoặc tái cấu trúc giao diện Desktop, **ưu tiên sử dụng TailwindCSS**.
- **Tương thích thiết bị cảm ứng (Mobile/Tablet)**:
  - Tất cả pseudo-class `:hover` nếu dùng trong CSS thuần/Modules phải được bọc trong `@media (hover: hover)`. Khi dùng Tailwind trên mobile, ưu tiên trạng thái chạm `active:` thay vì lạm dụng `hover:` để tránh lỗi dính trạng thái hover trên màn hình cảm ứng.
  - Cỡ chữ của thẻ `input` trên mobile tối thiểu phải đạt `16px` (`text-base`) để ngăn trình duyệt iOS tự động phóng to (zoom in) màn hình khi focus vào ô nhập.
  - Vùng chạm (Touch Target) cho các nút bấm, icon thao tác trên mobile tối thiểu đạt 44x44px (`min-h-[44px] min-w-[44px]` hoặc padding tương đương).
- **Không dùng Inline Styles**: Tuyệt đối không hard-code style trực tiếp trong JSX trừ trường hợp giá trị động (dynamic coordinates, dynamic width%).

---

### 6. Đồng Bộ Thời Gian Thực (WebSocket Real-Time Sync)

- Đối với các trang vận hành salon (`tenant-portal`): Luôn đảm bảo component được kết nối và lắng nghe sự kiện từ hook `useWebSocketSync`.
- Khi nhận sự kiện liên quan (ví dụ `"turns.updated"`, `"appointments.updated"`):
  1. Invalidate đúng cache key tương ứng của TanStack Query.
  2. Hiển thị thông báo nhẹ nhàng (Toast notification) nếu sự kiện được kích hoạt bởi người dùng khác cùng chi nhánh.

---

### 7. Checklist Kiểm Tra Code Frontend Trước Khi Hoàn Tất
- [ ] Không có lỗi lint hoặc TypeScript error (`turbo run lint`).
- [ ] Không có `any` và không còn `console.log`.
- [ ] Đã kiểm tra giao diện trên cả màn hình Desktop và Mobile (Responsive).
- [ ] Đã xử lý đủ 3 trạng thái: Đang tải (Loading), Trống (Empty), Lỗi (Error).
- [ ] Các component dài > 250 dòng đã được phân rã hợp lý.
