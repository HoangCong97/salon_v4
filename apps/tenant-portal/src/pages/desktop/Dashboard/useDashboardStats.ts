import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import { DashboardStatsResponse } from "./types";

export function useDashboardStats(selectedMonth?: string) {
  const { currentTenantId, currentBranchId } = useAuthStore();

  const {
    data: stats,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<DashboardStatsResponse>({
    queryKey: [
      ...queryKeys.dashboard.stats(currentTenantId!, currentBranchId!),
      selectedMonth || "current",
    ],
    queryFn: () => {
      const url = `/tenants/${currentTenantId}/branches/${currentBranchId}/dashboard-stats${
        selectedMonth ? `?month=${selectedMonth}` : ""
      }`;
      return api.get(url);
    },
    enabled: !!currentTenantId && !!currentBranchId,
    // Keep previous data when fetching for a new month to avoid layout flashing
    placeholderData: (previousData) => previousData,
  });

  const error = queryError ? (queryError as Error).message : null;

  return {
    loading,
    error,
    stats,
    refetch,
  };
}
