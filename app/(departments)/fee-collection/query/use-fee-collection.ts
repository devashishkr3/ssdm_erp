import { useQuery } from "@tanstack/react-query";
import { getFilterOptions, getFeeCollectionReport, getGlobalFeeStats } from "../lib/action";

export function useFilterOptions() {
  return useQuery({
    queryKey: ["fee-collection-filter-options"],
    queryFn: async () => {
      const res = await getFilterOptions();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

export function useFeeCollectionReport(batchId: string, semesterCount: number) {
  return useQuery({
    queryKey: ["fee-collection-report", batchId, semesterCount],
    queryFn: async () => {
      if (!batchId || !semesterCount) return null;
      const res = await getFeeCollectionReport(batchId, semesterCount);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: !!batchId && !!semesterCount,
    retry: false,
  });
}

export function useGlobalFeeStats() {
  return useQuery({
    queryKey: ["global-fee-stats"],
    queryFn: async () => {
      const res = await getGlobalFeeStats();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

