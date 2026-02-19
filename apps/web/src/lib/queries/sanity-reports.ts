import { sanityClient } from "../sanity";
import type { LocationWithName } from "../sanity.types";

export type ReportStatus = "reported" | "under-review" | "resolved";

export interface ReportWithCategory {
  _id: string;
  slug: string;
  title: string;
  description: string | null;
  location: LocationWithName | null;
  dateReported: string | null;
  status: ReportStatus;
  imageUrl: string | null;
  imageAlt: string | null;
  category: {
    _id: string;
    slug: string;
    name: string;
  } | null;
}

export interface ReportStats {
  total: number;
  resolved: number;
  resolutionRate: number;
}

export interface ReportCategoryItem {
  _id: string;
  slug: string;
  name: string;
}

// Pagination constants
export const REPORTS_PAGE_SIZE = 10;

export interface PaginatedReportsResponse {
  reports: ReportWithCategory[];
  total: number;
  hasNextPage: boolean;
  nextCursor: number | null;
}

// GROQ Queries
const REPORTS_LIST_QUERY = /* groq */ `*[_type == "report" && status in ["reported", "resolved"]] | order(dateReported desc) {
  _id,
  "slug": slug.current,
  title,
  description,
  location,
  dateReported,
  status,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  "category": category->{ _id, "slug": slug.current, name }
}`;

const REPORTS_PAGINATED_QUERY = /* groq */ `{
  "reports": *[_type == "report" && status in ["reported", "resolved"]] | order(dateReported desc) [$start...$end] {
    _id,
    "slug": slug.current,
    title,
    description,
    location,
    dateReported,
    status,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    "category": category->{ _id, "slug": slug.current, name }
  },
  "total": count(*[_type == "report" && status in ["reported", "resolved"]])
}`;

const REPORT_STATS_QUERY = /* groq */ `{
  "total": count(*[_type == "report"]),
  "resolved": count(*[_type == "report" && status == "resolved"])
}`;

const REPORT_CATEGORIES_QUERY = /* groq */ `*[_type == "reportCategory"] | order(name asc) {
  _id,
  "slug": slug.current,
  name
}`;

const REPORTS_NEWER_THAN_QUERY = /* groq */ `*[_type == "report" && status in ["reported", "resolved"] && dateReported > $since] | order(dateReported desc) {
  _id,
  "slug": slug.current,
  title,
  description,
  location,
  dateReported,
  status,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  "category": category->{ _id, "slug": slug.current, name }
}`;

/**
 * Fetch all reports with their categories
 * Ordered by date reported descending
 */
export async function getReports(): Promise<ReportWithCategory[]> {
  return sanityClient.fetch<ReportWithCategory[]>(REPORTS_LIST_QUERY);
}

/**
 * Fetch reports strictly newer than a given ISO datetime
 * Used for polling to detect new reports since the user last viewed the feed
 */
export async function getReportsNewerThan(
  since: string,
): Promise<ReportWithCategory[]> {
  return sanityClient.fetch<ReportWithCategory[]>(REPORTS_NEWER_THAN_QUERY, {
    since,
  });
}

/**
 * Fetch paginated reports with cursor-based pagination
 * @param cursor - The starting index (0-based offset)
 * @returns Paginated response with reports, total count, and pagination info
 */
export async function getReportsPaginated(
  cursor: number = 0,
): Promise<PaginatedReportsResponse> {
  const start = cursor;
  const end = cursor + REPORTS_PAGE_SIZE;

  const result = await sanityClient.fetch<{
    reports: ReportWithCategory[];
    total: number;
  }>(REPORTS_PAGINATED_QUERY, { start, end });

  const hasNextPage = end < result.total;

  return {
    reports: result.reports,
    total: result.total,
    hasNextPage,
    nextCursor: hasNextPage ? end : null,
  };
}

/**
 * Fetch report statistics (total, resolved, resolution rate)
 */
export async function getReportStats(): Promise<ReportStats> {
  const stats = await sanityClient.fetch<{ total: number; resolved: number }>(
    REPORT_STATS_QUERY,
  );
  return {
    total: stats.total,
    resolved: stats.resolved,
    resolutionRate:
      stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
  };
}

/**
 * Fetch all report categories
 */
export async function getReportCategories(): Promise<ReportCategoryItem[]> {
  return sanityClient.fetch<ReportCategoryItem[]>(REPORT_CATEGORIES_QUERY);
}
