import { useQuery } from "@tanstack/react-query";
import {
  getPublishedArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategories,
  getAuthors,
  getHomepage,
  getCommunityPage,
} from "../queries/sanity-articles";

/**
 * Hook to fetch all published articles
 */
export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: getPublishedArticles,
  });
}

/**
 * Hook to fetch a single article by slug
 */
export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch articles by category
 */
export function useArticlesByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ["articles", "category", categorySlug],
    queryFn: () => getArticlesByCategory(categorySlug),
    enabled: !!categorySlug,
  });
}

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

/**
 * Hook to fetch all authors
 */
export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: getAuthors,
  });
}

/**
 * Hook to fetch homepage data with featured stories
 */
export function useHomepage() {
  return useQuery({
    queryKey: ["homepage"],
    queryFn: getHomepage,
  });
}

/**
 * Hook to fetch community page data with featured article and articles grid
 */
export function useCommunityPage() {
  return useQuery({
    queryKey: ["communityPage"],
    queryFn: getCommunityPage,
  });
}
