import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { NewsSidebar } from "@/components/news-sidebar";
import { useArticles, useCategories } from "@/lib/hooks/use-articles";
import { cn } from "@/lib/utils";

interface NewsStory {
  id: string;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  date: string;
  image: string;
  imageAlt: string;
  featured: boolean;
}

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const {
    data: articles,
    isLoading: articlesLoading,
    error: articlesError,
  } = useArticles();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  // Transform articles to NewsStory format
  const newsStories: NewsStory[] = useMemo(() => {
    if (!articles) return [];

    return articles.map((article) => ({
      id: article._id,
      slug: article.slug,
      title: article.title,
      description: article.cardDescription || article.description || "",
      categories: article.categories?.map((c) => c.name) || [],
      date: formatDate(article.datePublished),
      image:
        article.heroImageUrl ||
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      imageAlt: article.heroImageAlt || article.title,
      featured: article.categories?.some((c) => c.slug === "featured") || false,
    }));
  }, [articles]);

  // Build category list
  const categories = useMemo(() => {
    if (!categoriesData) return ["All"];

    // Exclude "Featured" from filter list and add "All" at the beginning
    return [
      "All",
      ...categoriesData
        .filter((cat) => cat.slug !== "featured")
        .map((cat) => cat.name),
    ];
  }, [categoriesData]);

  // Filter stories by selected category
  const filteredStories = useMemo(() => {
    if (selectedCategory === "All") return newsStories;
    return newsStories.filter((story) =>
      story.categories.includes(selectedCategory),
    );
  }, [newsStories, selectedCategory]);

  if (articlesLoading || categoriesLoading) {
    return (
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (articlesError) {
    return (
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading articles</p>
              <p className="text-sm text-muted-foreground">
                {articlesError.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
          Daily Local Updates
        </h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category ? "" : "bg-white hover:bg-muted"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
          {/* News Stories */}
          <div className="space-y-6">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-72 md:shrink-0">
                    <img
                      src={story.image}
                      alt={story.imageAlt}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col p-6 flex-1">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {story.categories
                        .filter((cat) => cat !== "Featured")
                        .map((category) => (
                          <Badge
                            key={category}
                            variant={getCategoryVariant(category)}
                          >
                            {category}
                          </Badge>
                        ))}
                      {story.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-semibold mb-3 leading-tight">
                      {story.title}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 flex-1">
                      {story.description}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{story.date}</span>
                      </div>
                      <Link
                        to={`/article/${story.slug}`}
                        className={cn(
                          buttonVariants({ variant: "link" }),
                          "text-primary p-0 h-auto self-start sm:self-auto whitespace-nowrap inline-flex items-center",
                        )}
                      >
                        Read Full Story
                        <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <NewsSidebar />
        </div>
      </div>
    </div>
  );
}
