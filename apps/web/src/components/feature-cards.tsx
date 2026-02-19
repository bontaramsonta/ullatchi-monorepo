import { Link } from "react-router";
import { AlertCircle, FileText, Users, ChevronRight } from "lucide-react";

const features = [
  {
    icon: AlertCircle,
    title: "Local Issues",
    href: "/report-issue",
  },
  {
    icon: FileText,
    title: "Government Watch",
    href: "/government-watch",
  },
  {
    icon: Users,
    title: "Community Voices",
    href: "/community-voices",
  },
];

export function FeatureCards() {
  return (
    <section className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.href}
                className="bg-card hover:bg-accent transition-colors rounded-lg p-6 flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="text-primary">
                    <Icon className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
