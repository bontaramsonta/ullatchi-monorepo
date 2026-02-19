import { useParams, Link } from "react-router";
import { ArrowLeft, Calendar, User, Loader2, MapPin } from "lucide-react";
import { PortableText } from "@portabletext/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsSidebar } from "@/components/news-sidebar";
import { useArticle } from "@/lib/hooks/use-articles";

const getCategoryVariant = (category: string) => {
  const variantMap: Record<
    string,
    "default" | "destructive" | "secondary" | "outline"
  > = {
    "Municipal News": "default",
    Education: "destructive",
    "Public Services": "default",
    Environment: "secondary",
    Infrastructure: "outline",
    Health: "secondary",
  };
  return variantMap[category] || "default";
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticle(slug || "");

  if (isLoading) {
    return (
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-2">Article not found</p>
              <p className="text-sm text-muted-foreground mb-6">
                {error?.message ||
                  "The article you're looking for doesn't exist or has been removed."}
              </p>
              <Button>
                <Link to="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to News
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Link */}
        <Link
          to="/news"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Link>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
          {/* Article Content */}
          <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-border">
            {/* Hero Image */}
            {article.heroImageUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.heroImageUrl}
                  alt={article.heroImageAlt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="p-6 md:p-8 lg:p-10">
              {/* Categories */}
              {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories
                    .filter((cat: { name: string }) => cat.name !== "Featured")
                    .map((category: { slug: string; name: string }) => (
                      <Badge
                        key={category.slug}
                        variant={getCategoryVariant(category.name)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  {article.categories.some(
                    (cat: { slug: string }) => cat.slug === "featured",
                  ) && <Badge variant="outline">Featured</Badge>}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Location */}
              {article.location?.name && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{article.location.name}</span>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.datePublished)}</span>
                </div>

                {/* Authors */}
                {article.authors && article.authors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {article.authors
                        .map(
                          (author: { displayName: string }) =>
                            author.displayName,
                        )
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {article.description && (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {article.description}
                </p>
              )}

              {/* Content */}
              {article.content && (
                <div
                  className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
                  prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-img:rounded-lg prose-img:shadow-md"
                >
                  <PortableText value={article.content} />
                </div>
              )}

              {/* Author Bio Section */}
              {article.authors && article.authors.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="font-semibold text-lg mb-4">
                    {article.authors.length === 1
                      ? "About the Author"
                      : "About the Authors"}
                  </h3>
                  <div className="space-y-6">
                    {article.authors.map(
                      (author: {
                        _id: string;
                        displayName: string;
                        bio?: string | null;
                        profileImageUrl?: string | null;
                      }) => (
                        <div key={author._id} className="flex gap-4">
                          {author.profileImageUrl ? (
                            <img
                              src={author.profileImageUrl}
                              alt={author.displayName}
                              className="w-16 h-16 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">
                              {author.displayName}
                            </h4>
                            {author.bio && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {author.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <NewsSidebar />
        </div>
      </div>
    </div>
  );
}
