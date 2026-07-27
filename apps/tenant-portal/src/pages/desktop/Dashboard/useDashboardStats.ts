import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import { DashboardStatsResponse } from "./types";

export function useDashboardStats(
  selectedMonth?: string,
  selectedDays?: string,
  selectedStaff?: string,
  selectedServices?: string,
) {
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
      selectedDays || "",
      selectedStaff || "",
      selectedServices || "",
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedDays) params.append("days", selectedDays);
      if (selectedStaff) params.append("staff", selectedStaff);
      if (selectedServices) params.append("services", selectedServices);
      const queryStr = params.toString();
      const url = `/tenants/${currentTenantId}/branches/${currentBranchId}/dashboard-stats${
        queryStr ? `?${queryStr}` : ""
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
