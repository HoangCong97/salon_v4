import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import { DashboardStatsResponse } from "./types";

// Helper to read cached dashboard stats from localStorage (matching useInvoices pattern)
const getCachedStats = (key: string): DashboardStatsResponse | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as DashboardStatsResponse) : null;
  } catch {
    return null;
  }
};

export function useDashboardStats(
  selectedMonth?: string,
  selectedDays?: string,
  selectedStaff?: string,
  selectedServices?: string,
) {
  const { currentTenantId, currentBranchId } = useAuthStore();

  const cacheKey = useMemo(() => {
    if (!currentTenantId || !currentBranchId) return null;
    return `cached_dashboard_stats_${currentTenantId}_${currentBranchId}_${selectedMonth || "current"}`;
  }, [currentTenantId, currentBranchId, selectedMonth]);

  const {
    data: queryData,
    isLoading: queryLoading,
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
    // Keep data fresh in memory for 5 minutes (matching main.tsx & useInvoices)
    staleTime: 5 * 60_000,
    gcTime: 24 * 60 * 60_000,
    // Keep previous data when fetching for a new month to avoid layout flashing
    placeholderData: (previousData) => previousData,
    // Instant initial data from persistent localStorage cache
    initialData: () => {
      if (cacheKey) {
        const cached = getCachedStats(cacheKey);
        if (cached) return cached;
      }
      return undefined;
    },
  });

  // Persist fetched data to localStorage for instant recovery when app resumes / multitasking
  useEffect(() => {
    if (cacheKey && queryData) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(queryData));
      } catch {}
    }
  }, [cacheKey, queryData]);

  // If memory was cleared during multitasking, fall back to persistent localStorage
  const resolvedStats = useMemo(() => {
    if (queryData) return queryData;
    if (cacheKey) {
      const cached = getCachedStats(cacheKey);
      if (cached) return cached;
    }
    return null;
  }, [queryData, cacheKey]);

  const loading = queryLoading && !resolvedStats;
  const error = queryError ? (queryError as Error).message : null;

  return {
    loading,
    error,
    stats: resolvedStats,
    refetch,
  };
}
