---
name: salon-realtime-sync
description: >-
  Use this skill when implementing, fixing, or extending real-time WebSocket synchronization between NestJS API Gateway and React Frontend applications.
---

# Quy Trình Tích Hợp Đồng Bộ Thời Gian Thực (`salon-realtime-sync`)

Hướng dẫn chuẩn cho AI Agent khi thiết lập hoặc bổ sung sự kiện truyền tin thời gian thực qua WebSockets giữa [`apps/backend-api`](file:///c:/Workspace/salon_v4/apps/backend-api) và [`apps/tenant-portal`](file:///c:/Workspace/salon_v4/apps/tenant-portal).

---

## 1. Kiến Trúc Đồng Bộ Thời Gian Thực Đa Tenant

Hệ thống sử dụng cơ chế WebSocket phòng chia theo Tenant (Room-based isolation):
- Khi client kết nối, gửi token xác thực JWT có chứa `tenantId` và `branchId`.
- Gateway đưa client vào room: `tenant:<tenantId>`.
- Khi có thay đổi dữ liệu tại Backend, Gateway chỉ broadcast sự kiện tới room của Tenant đó, bảo đảm dữ liệu của các Salon không bị lộ chéo nhau.

---

## 2. Bảng Danh Mục Sự Kiện Chuẩn (Event Matrix)

| Tên Sự Kiện | Nguồn Phát (Backend) | Ứng Dụng Lắng Nghe | Hành Vi Cần Thực Hiện Ở Frontend |
| :--- | :--- | :--- | :--- |
| `turns.updated` | `turns.controller.ts` | `DailyTurnsTable.tsx` | Invalidate query `['turns']`, cập nhật danh sách thứ tự thợ |
| `appointments.updated` | `customer-portal.controller.ts` / Booking | Lịch hẹn & Dashboard | Invalidate query `['appointments']`, vẽ lại ô lịch mới |
| `invoices.updated` | POS Checkout | Thu ngân & Dashboard | Invalidate `['invoices']`, cập nhật doanh thu ngày |
| `branches.updated` | `branch.controller.ts` | Cấu hình chi nhánh | Tải lại danh sách chi nhánh trong switcher |
| `payrolls.updated` | `payroll.controller.ts` | Bảng lương & Thợ | Tải lại phiếu lương, hiển thị toast thông báo |
| `advances.updated` | `payroll.controller.ts` | Quản lý tạm ứng | Cập nhật danh sách đơn xin ứng lương |

---

## 3. Quy Trình Phát Sự Kiện Tại Backend (NestJS)

1. Mở Controller hoặc Service thực hiện thao tác cập nhật dữ liệu (ví dụ: `apps/backend-api/src/turns.controller.ts`).
2. Inject `NotificationGateway`:
   ```typescript
   constructor(
     private readonly notificationGateway: NotificationGateway,
     private readonly turnsService: TurnsService,
   ) {}
   ```
3. Sau khi ghi thành công vào Database, gọi hàm phát sự kiện tới phòng của Tenant:
   ```typescript
   this.notificationGateway.emitToTenant(tenantId, 'turns.updated', {
     branchId,
     actorId: currentUser.id,
     timestamp: new Date().toISOString(),
   });
   ```

---

## 4. Quy Trình Xử Lý Sự Kiện Tại Frontend (React)

1. Mở hook quản lý đồng bộ [`apps/tenant-portal/src/hooks/useWebSocketSync.ts`](file:///c:/Workspace/salon_v4/apps/tenant-portal/src/hooks/useWebSocketSync.ts).
2. Đăng ký listener cho sự kiện mới:
   ```typescript
   socket.on('turns.updated', (data) => {
     // 1. Invalidate cache để TanStack Query tự động tải lại dữ liệu ngầm
     queryClient.invalidateQueries({ queryKey: ['turns', data.branchId] });

     // 2. Hiển thị thông báo Toast nếu người cập nhật là người khác
     if (data.actorId !== currentUserId) {
       showToast({
         type: 'info',
         message: 'Thứ tự xoay tua thợ vừa được đồng nghiệp cập nhật.',
       });
     }
   });
   ```

---

## 5. Danh Sách Kiểm Tra & Khắc Phục Lỗi Thường Gặp

- **Không nhận được sự kiện**:
  - Kiểm tra xem client đã join đúng room `tenant:<tenantId>` chưa.
  - Kiểm tra xem token JWT gửi lên khi bắt tay WebSocket có hết hạn không.
- **Rò rỉ bộ nhớ (Memory Leak)**:
  - Đảm bảo luôn dọn dẹp listener trong hàm cleanup của `useEffect` (`socket.off(eventName)`).
- **Vòng lặp re-fetch vô tận**:
  - Không gọi mutation kích hoạt lại chính sự kiện vừa nhận được.
