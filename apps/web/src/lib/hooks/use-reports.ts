import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getReports,
  getReportStats,
  getReportCategories,
  getReportsPaginated,
  getReportsNewerThan,
} from "../queries/sanity-reports";

/**
 * Hook to fetch all reports with their categories
 */
export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });
}

/**
 * Hook to fetch reports with infinite scroll pagination
 * Uses cursor-based pagination with Sanity's slice syntax
 */
export function useInfiniteReports() {
  return useInfiniteQuery({
    queryKey: ["reports", "infinite"],
    queryFn: ({ pageParam }) => getReportsPaginated(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      reports: data.pages.flatMap((page) => page.reports),
      total: data.pages[0]?.total ?? 0,
    }),
  });
}

/**
 * Poll for reports newer than a given ISO datetime
 * Runs every 30 seconds when tab is focused (refetchIntervalInBackground: false)
 */
export function useNewReportsCheck(since: string | null) {
  return useQuery({
    queryKey: ["reports", "newerThan", since],
    queryFn: () => getReportsNewerThan(since!),
    enabled: !!since,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to fetch report statistics
 */
export function useReportStats() {
  return useQuery({
    queryKey: ["reports", "stats"],
    queryFn: getReportStats,
  });
}

/**
 * Hook to fetch all report categories
 */
export function useReportCategories(open: boolean) {
  return useQuery({
    queryKey: ["reportCategories"],
    queryFn: getReportCategories,
    enabled: open,
  });
}
