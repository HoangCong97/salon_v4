# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN CODE (CODING STANDARDS)

Khi làm việc trong dự án này, AI Agent phải tuân thủ nghiêm ngặt các quy tắc lập trình dưới đây để đảm bảo chất lượng, tốc độ và tính dễ bảo trì của hệ thống.

---

## 1. Tiêu Chuẩn Frontend (React / TypeScript)

*   **Tách Biệt Logic và Giao Diện (Colocation & Hooks):**
    *   Tránh viết các component có kích thước quá lớn (> 200 dòng logic state hoặc API).
    *   Toàn bộ logic nghiệp vụ, quản lý state và gọi API phải được trích xuất ra các **React Custom Hooks** riêng (ví dụ: `useStaffManagement.ts`, `usePOS.ts`).
    *   Các file component chính (ví dụ: `index.tsx`) chỉ nên chứa phần giao diện JSX và nhận dữ liệu/actions từ Custom Hook để render.
*   **Thẩm Mỹ Thiết Kế (Aesthetics):**
    *   Giao diện phải được thiết kế cao cấp (Premium Aesthetics), sử dụng hệ màu được thiết kế hài hòa (HSL/CSS variables), hạn chế dùng màu thuần cơ bản (red, blue, green).
    *   Sử dụng hiệu ứng hover sinh động và micro-animations tinh tế để nâng cao trải nghiệm người dùng.
*   **Quản Lý State & Hiển Thị:**
    *   Sử dụng `useMemo` và `useCallback` một cách tối ưu để tránh render lại không cần thiết đối với danh sách lớn hoặc các bảng dữ liệu dạng Excel-like.

---

## 2. Tiêu Chuẩn Backend (NestJS / Prisma)

*   **Tối Ưu Hóa Truy Vấn Cơ Sở Dữ Liệu (Database Query Optimization):**
    *   **TUYỆT ĐỐI KHÔNG** viết các truy vấn database (Prisma queries) bên trong vòng lặp (`for`, `forEach`, `map`). 
    *   Thay vào đó, hãy sử dụng truy vấn gộp (Bulk queries như `findMany` với toán tử `{ in: [...] }` hoặc `createMany`) rồi tiến hành so khớp dữ liệu trong bộ nhớ (In-memory matching) sử dụng `Map` hoặc `Set`.
    *   **Sử dụng `Promise.all` song song hóa:** Khi cần thực thi nhiều câu lệnh ghi (create/update/delete) hoặc đọc độc lập, tuyệt đối không dùng `await` tuần tự. Hãy đẩy các Promise vào một mảng và thực thi song song bằng `await Promise.all(...)` để triệt tiêu độ trễ cộng dồn của mạng (Network RTT).
    *   **Tận dụng chèn hàng loạt (`createMany`):** Sử dụng `createMany` để chèn nhiều bản ghi trong một câu lệnh INSERT duy nhất thay vì lặp qua từng bản ghi để `create`.
    *   **Tái sử dụng Connection Pool (Singleton Prisma):** Đảm bảo sử dụng thực thể `prisma` dùng chung được export từ `@salon/database` (`import { prisma } from "@salon/database"`), tránh khởi tạo lại `new PrismaClient()` trong các controller hay service riêng lẻ làm cạn kiệt connection pool của Supabase.
    *   Giảm thiểu tối đa chiều sâu của chuỗi truy vấn tuần tự (`await` lồng nhau) để giảm độ trễ do khoảng cách mạng (network roundtrip latency), đặc biệt khi kết nối với DB từ xa.
*   **Sử Dụng Bộ Nhớ Đệm (Caching Layer):**
    *   Đối với các bảng tĩnh hoặc ít khi thay đổi (như `permissions`, `roles` chuẩn hệ thống, cấu hình tenant), phải áp dụng cơ chế bộ nhớ đệm tại máy chủ (`in-memory caching`) để trả về ngay kết quả, giải phóng kết nối cho cơ sở dữ liệu và tối ưu hóa thời gian phản hồi (mục tiêu phản hồi dưới 200ms).

---

## 3. Quy Tắc Chung & Bảo Trì Code

*   **Bảo Toàn Chú Thích (Comments & Documentation):**
    *   Giữ lại tất cả các chú thích code, JSDoc và code comments hiện tại không liên quan trực tiếp đến phần sửa đổi. Không tự ý xóa code cũ trừ khi được yêu cầu rõ ràng.
*   **Báo Cáo Thay Đổi:**
    *   Sau mỗi lần thay đổi mã nguồn, AI Agent cần tạo hoặc cập nhật file Walkthrough ở thư mục artifacts của phiên làm việc để báo cáo rõ ràng các file đã chỉnh sửa và kết quả build/test.
