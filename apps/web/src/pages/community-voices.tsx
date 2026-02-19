import { Link } from "react-router";
import { User, ChevronRight, PenSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCommunityPage } from "@/lib/hooks/use-articles";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function CommunityVoicesPage() {
  const { data: communityPage, isLoading, error } = useCommunityPage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">
          Failed to load content. Please try again later.
        </p>
      </div>
    );
  }

  const featuredArticle = communityPage?.featuredArticle;
  const articles = communityPage?.articles ?? [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {communityPage?.heroTitle || "Community Voices"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {communityPage?.heroDescription ||
                  "Analysis, opinion, and citizen perspectives on local issues"}
              </p>
            </div>
            <Link
              to="#" // TODO: Add write for ullatchi page after user authentication is implemented
              // to="/write-for-ullatchi"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "gap-2 md:shrink-0",
              })}
            >
              <PenSquare className="w-4 h-4" />
              {communityPage?.heroCtaText || "Write for Ullatchi"}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border rounded-xl overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative aspect-4/3 lg:aspect-auto">
              <img
                src={
                  featuredArticle.heroImageUrl ||
                  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000"
                }
                alt={featuredArticle.heroImageAlt || featuredArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex gap-2 mb-4">
                {featuredArticle.categories?.[0] && (
                  <Badge variant="destructive">
                    {featuredArticle.categories[0].name}
                  </Badge>
                )}
                {featuredArticle.categories?.[1] && (
                  <Badge variant="outline">
                    {featuredArticle.categories[1].name}
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {featuredArticle.title}
              </h2>

              <p className="text-muted-foreground mb-6">
                {featuredArticle.cardDescription || featuredArticle.description}
              </p>

              {/* Author Info */}
              {featuredArticle.authors?.[0] && (
                <div className="flex items-center gap-3 mb-6">
                  {featuredArticle.authors[0].profileImageUrl ? (
                    <img
                      src={featuredArticle.authors[0].profileImageUrl}
                      alt={featuredArticle.authors[0].displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      {featuredArticle.authors[0].displayName}
                    </p>
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>{formatDate(featuredArticle.datePublished)}</span>
              </div>

              <Link
                to={`/article/${featuredArticle.slug}`}
                className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Read Article
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Article Grid */}
      {articles.length > 0 && (
        <section className="container mx-auto px-4 pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card
                key={article._id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <img
                  src={
                    article.heroImageUrl ||
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000"
                  }
                  alt={article.heroImageAlt || article.title}
                  className="w-full aspect-4/3 object-cover"
                />

                <CardHeader>
                  <div className="mb-2">
                    {article.categories?.[0] && (
                      <Badge variant="default">
                        {article.categories[0].name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mb-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {article.cardDescription || article.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Author Info */}
                  {article.authors?.[0] && (
                    <div className="flex items-center gap-3">
                      {article.authors[0].profileImageUrl ? (
                        <img
                          src={article.authors[0].profileImageUrl}
                          alt={article.authors[0].displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">
                          {article.authors[0].displayName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meta and Link */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(article.datePublished)}</span>
                    </div>
                    <Link
                      to={`/article/${article.slug}`}
                      className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Share Your Voice CTA */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <PenSquare className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {communityPage?.ctaTitle || "Share Your Voice"}
            </h2>

            <p className="text-muted-foreground text-lg mb-8">
              {communityPage?.ctaDescription ||
                "Have a perspective on local issues? We welcome submissions from community members who want to contribute to the conversation about local governance and civic life."}
            </p>

            <Link
              to="/write-for-ullatchi"
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              {communityPage?.ctaButtonText || "Submit Your Article"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
