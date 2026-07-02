import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./useWebSocket";
import { queryKeys } from "../utils/queryKeys";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "../components/desktop/ToastProvider";

/**
 * Custom React hook to subscribe to tenant-specific WebSocket events
 * and automatically keep the TanStack Query cache in sync.
 */
export const useWebSocketSync = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const currentTenantId = useAuthStore((state) => state.currentTenantId);
  const currentBranchId = useAuthStore((state) => state.currentBranchId);
  const toast = useToast();

  useWebSocket((event, data) => {
    if (!currentTenantId) return;

    console.log(`WebSocket event received: ${event}`, data);

    const isOtherUser = data?.senderId && data.senderId !== currentUser?.id;

    switch (event) {
      case "staff.updated":
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId) });
        queryClient.invalidateQueries({ queryKey: ["shifts", currentTenantId] });
        if (isOtherUser) {
          toast.info("Danh sách nhân sự vừa được cập nhật bởi một người dùng khác.");
        }
        break;

      case "roles.updated":
        queryClient.invalidateQueries({ queryKey: queryKeys.roles.all(currentTenantId) });
        if (isOtherUser) {
          toast.info("Cơ cấu chức vụ hoặc quyền hạn vừa được cập nhật bởi một người dùng khác.");
        }
        break;

      case "dailyTurns.updated":
        const turnBranchId = data?.branchId || currentBranchId;
        if (turnBranchId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.dailyTurns.all(currentTenantId, turnBranchId) });
          if (isOtherUser && turnBranchId === currentBranchId) {
            toast.info("Hàng đợi xoay tua thợ vừa được cập nhật bởi một người dùng khác.");
          }
        }
        break;

      case "shifts.updated":
        const shiftBranchId = data?.branchId || currentBranchId;
        if (shiftBranchId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all(currentTenantId, shiftBranchId) });
          if (isOtherUser && shiftBranchId === currentBranchId) {
            toast.info("Lịch trực ca làm việc vừa được cập nhật bởi một người dùng khác.");
          }
        }
        break;

      case "appointments.updated":
        const apptBranchId = data?.branchId || currentBranchId;
        if (apptBranchId) {
          const isOther = data?.senderId && data.senderId !== currentUser?.id;
          // Invalidate queries only if the update is from another user.
          // For the current user, it is already handled locally on API success.
          if (!data?.senderId || isOther) {
            queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId) });
            if (isOther && apptBranchId === currentBranchId) {
              toast.info("Lịch hẹn khách hàng vừa được cập nhật bởi một người dùng khác.");
            }
          }
        }
        break;

      case "invoices.updated":
        const invBranchId = data?.branchId || currentBranchId;
        if (invBranchId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(currentTenantId, invBranchId) });
          if (isOtherUser && invBranchId === currentBranchId) {
            toast.success("Một hóa đơn POS vừa được thanh toán thành công bởi người dùng khác.");
          }
        }
        break;

      case "inventories.updated":
        queryClient.invalidateQueries({ queryKey: queryKeys.inventories.all(currentTenantId) });
        if (isOtherUser) {
          toast.info("Kho hàng vừa được cập nhật số lượng hoặc sản phẩm mới bởi người dùng khác.");
        }
        break;

      case "services.updated":
        queryClient.invalidateQueries({ queryKey: queryKeys.services.all(currentTenantId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.serviceCategories.all(currentTenantId) });
        if (isOtherUser) {
          toast.info("Danh mục dịch vụ vừa được thay đổi bởi một người dùng khác.");
        }
        break;

      case "customers.updated":
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(currentTenantId) });
        if (isOtherUser) {
          toast.info("Thông tin khách hàng vừa được cập nhật bởi một người dùng khác.");
        }
        break;
    }
  });
};
