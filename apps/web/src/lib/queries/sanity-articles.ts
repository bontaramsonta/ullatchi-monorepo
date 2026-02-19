import { sanityClient } from "../sanity";
import type { Article } from "../sanity.types";

// Extended types with expanded references
export interface ArticleWithRelations {
  _id: string;
  slug: string;
  title: string;
  cardDescription: string | null;
  description: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  datePublished: string | null;
  categories: Array<{
    _id: string;
    slug: string;
    name: string;
  }>;
  authors: Array<{
    _id: string;
    displayName: string;
    profileImageUrl: string | null;
  }>;
}

export interface ArticleDetail extends ArticleWithRelations {
  content: Article["content"];
  location: {
    name: string | null;
    geopoint: {
      lat: number;
      lng: number;
    } | null;
  } | null;
  authors: Array<{
    _id: string;
    displayName: string;
    bio: string | null;
    profileImageUrl: string | null;
  }>;
}

export interface CategoryItem {
  _id: string;
  slug: string;
  name: string;
}

export interface AuthorItem {
  _id: string;
  displayName: string;
  profileImageUrl: string | null;
}

export interface HomepageData {
  featuredStories: ArticleWithRelations[] | null;
}

export interface CommunityPageData {
  heroTitle: string | null;
  heroDescription: string | null;
  heroCtaText: string | null;
  featuredArticle: ArticleWithRelations | null;
  articles: ArticleWithRelations[] | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  ctaButtonText: string | null;
}

// GROQ Queries
const ARTICLES_LIST_QUERY = /* groq */ `*[_type == "article" && isPublished == true] | order(datePublished desc) {
  _id,
  "slug": slug.current,
  title,
  cardDescription,
  description,
  "heroImageUrl": heroImage.asset->url,
  "heroImageAlt": heroImage.alt,
  datePublished,
  "categories": categories[]->{ _id, "slug": slug.current, name },
  "authors": authors[]->{ _id, displayName, "profileImageUrl": profileImage.asset->url }
}`;

const ARTICLE_BY_SLUG_QUERY = /* groq */ `*[_type == "article" && slug.current == $slug && isPublished == true][0] {
  _id,
  "slug": slug.current,
  title,
  cardDescription,
  description,
  "heroImageUrl": heroImage.asset->url,
  "heroImageAlt": heroImage.alt,
  datePublished,
  content,
  location,
  "categories": categories[]->{ _id, "slug": slug.current, name },
  "authors": authors[]->{ _id, displayName, bio, "profileImageUrl": profileImage.asset->url }
}`;

const ARTICLES_BY_CATEGORY_QUERY = /* groq */ `*[_type == "article" && isPublished == true && $categorySlug in categories[]->slug.current] | order(datePublished desc) {
  _id,
  "slug": slug.current,
  title,
  cardDescription,
  description,
  "heroImageUrl": heroImage.asset->url,
  "heroImageAlt": heroImage.alt,
  datePublished,
  "categories": categories[]->{ _id, "slug": slug.current, name },
  "authors": authors[]->{ _id, displayName, "profileImageUrl": profileImage.asset->url }
}`;

const CATEGORIES_QUERY = /* groq */ `*[_type == "articleCategory"] | order(name asc) {
  _id,
  "slug": slug.current,
  name
}`;

const AUTHORS_QUERY = /* groq */ `*[_type == "author"] | order(displayName asc) {
  _id,
  displayName,
  "profileImageUrl": profileImage.asset->url
}`;

const HOMEPAGE_QUERY = /* groq */ `*[_type == "homepage" && _id == "homepage"][0] {
  "featuredStories": featuredStories[]->{
    _id,
    "slug": slug.current,
    title,
    cardDescription,
    description,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    datePublished,
    "categories": categories[]->{ _id, "slug": slug.current, name },
    "authors": authors[]->{ _id, displayName, "profileImageUrl": profileImage.asset->url }
  }
}`;

const COMMUNITY_PAGE_QUERY = /* groq */ `*[_type == "communityPage" && _id == "communityPage"][0] {
  heroTitle,
  heroDescription,
  heroCtaText,
  "featuredArticle": featuredArticle->{
    _id,
    "slug": slug.current,
    title,
    cardDescription,
    description,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    datePublished,
    "categories": categories[]->{ _id, "slug": slug.current, name },
    "authors": authors[]->{ _id, displayName, "profileImageUrl": profileImage.asset->url }
  },
  "articles": articles[]->{
    _id,
    "slug": slug.current,
    title,
    cardDescription,
    description,
    "heroImageUrl": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    datePublished,
    "categories": categories[]->{ _id, "slug": slug.current, name },
    "authors": authors[]->{ _id, displayName, "profileImageUrl": profileImage.asset->url }
  },
  ctaTitle,
  ctaDescription,
  ctaButtonText
}`;

/**
 * Fetch all published articles with their categories and authors
 * Optimized for list views - excludes large fields like content
 */
export async function getPublishedArticles(): Promise<ArticleWithRelations[]> {
  return sanityClient.fetch<ArticleWithRelations[]>(ARTICLES_LIST_QUERY);
}

/**
 * Fetch a single article by slug with full content
 * This fetches all fields including content for the detail view
 */
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  return sanityClient.fetch<ArticleDetail | null>(ARTICLE_BY_SLUG_QUERY, {
    slug,
  });
}

/**
 * Fetch articles by category slug
 * Optimized for list views - excludes large fields like content
 */
export async function getArticlesByCategory(
  categorySlug: string,
): Promise<ArticleWithRelations[]> {
  return sanityClient.fetch<ArticleWithRelations[]>(
    ARTICLES_BY_CATEGORY_QUERY,
    { categorySlug },
  );
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<CategoryItem[]> {
  return sanityClient.fetch<CategoryItem[]>(CATEGORIES_QUERY);
}

/**
 * Fetch all authors
 * Excludes bio field for list views
 */
export async function getAuthors(): Promise<AuthorItem[]> {
  return sanityClient.fetch<AuthorItem[]>(AUTHORS_QUERY);
}

/**
 * Fetch homepage data including featured stories
 * Returns the singleton homepage document with expanded article references
 */
export async function getHomepage(): Promise<HomepageData | null> {
  return sanityClient.fetch<HomepageData | null>(HOMEPAGE_QUERY);
}

/**
 * Fetch community page data including featured article and articles grid
 * Returns the singleton community page document with expanded article references
 */
export async function getCommunityPage(): Promise<CommunityPageData | null> {
  return sanityClient.fetch<CommunityPageData | null>(COMMUNITY_PAGE_QUERY);
}
