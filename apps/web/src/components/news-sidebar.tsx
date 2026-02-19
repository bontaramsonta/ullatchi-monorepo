import { MapPin } from "lucide-react";

export function NewsSidebar() {
  return (
    <aside className="space-y-6">
      {/* News by Region */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold text-lg mb-4">News by Region</h3>
        <div className="bg-muted/40 rounded-lg aspect-4/3 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Interactive map showing news distribution across regions
            </p>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold text-lg mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {[
            "Budget 2026",
            "Infrastructure",
            "Public Health",
            "Education Reform",
          ].map((topic) => (
            <button
              key={topic}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Editor's Picks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold text-lg mb-4">Editor's Picks</h3>
        <div className="space-y-4">
          {[
            "Investigation: Missing Funds in Parks Department",
            "How to Navigate City Hall: A Citizen's Guide",
            "The Fight for Affordable Housing Continues",
          ].map((pick, index) => (
            <a
              key={index}
              href="#"
              className="block text-sm hover:text-primary transition-colors"
            >
              {pick}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
