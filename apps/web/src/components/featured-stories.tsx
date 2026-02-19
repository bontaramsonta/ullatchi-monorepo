import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Loader2 } from "lucide-react";
import { useHomepage } from "@/lib/hooks/use-articles";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function FeaturedStories() {
  const { data: homepage, isLoading, error } = useHomepage();

  // Get featured articles from homepage configuration (editor-curated order)
  const featuredArticles = homepage?.featuredStories?.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredArticles?.length) {
    return null;
  }

  const firstStory = featuredArticles[0];
  const remainingStories = featuredArticles.slice(1);

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Featured Stories
          </h2>
          <Link
            to="/news"
            className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
          {/* First large featured story */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1 flex flex-col h-full pt-0">
            <Link
              to={`/article/${firstStory.slug}`}
              className="flex flex-col h-full"
            >
              <div className="relative h-64 md:h-80 lg:h-72 overflow-hidden">
                <img
                  src={
                    firstStory.heroImageUrl ||
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
                  }
                  alt={firstStory.heroImageAlt || firstStory.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pt-6">
                {firstStory.categories?.[0] && (
                  <Badge variant="default" className="w-fit mb-2">
                    {firstStory.categories.filter(
                      (c) => c.slug !== "featured",
                    )[0]?.name || firstStory.categories[0].name}
                  </Badge>
                )}
                <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {firstStory.title}
                </h3>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground mb-4">
                  {firstStory.cardDescription || firstStory.description}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDate(firstStory.datePublished)}
                </span>
                <span className="text-primary font-semibold flex items-center gap-1">
                  Read More
                  <ChevronRight className="w-4 h-4" />
                </span>
              </CardFooter>
            </Link>
          </Card>

          {/* Smaller featured stories */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1 flex flex-col">
            {remainingStories.map((story) => (
              <Card
                key={story._id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex-1 py-0"
              >
                <Link to={`/article/${story.slug}`} className="h-full">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="relative h-48 sm:h-auto sm:w-48 lg:w-56 overflow-hidden shrink-0">
                      <img
                        src={
                          story.heroImageUrl ||
                          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
                        }
                        alt={story.heroImageAlt || story.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col flex-1 py-6">
                      <CardHeader className="pb-2">
                        {story.categories?.[0] && (
                          <Badge variant="default" className="w-fit mb-2">
                            {story.categories.filter(
                              (c) => c.slug !== "featured",
                            )[0]?.name || story.categories[0].name}
                          </Badge>
                        )}
                        <h3 className="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors">
                          {story.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="pb-2 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {story.cardDescription || story.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(story.datePublished)}
                        </span>
                        <span className="text-primary font-semibold flex items-center gap-1 text-sm">
                          Read More
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </CardFooter>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
