import { Link } from "react-router";

export function Hero() {
  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000')",
        }}
      />

      {/* Red overlay */}
      <div className="absolute inset-0 bg-primary/80" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
            Empowering Communities Through Local News
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
            Your trusted source for transparent reporting on local governance
            and civic issues
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/report-issue"
              className="bg-white text-primary px-6 py-3 rounded font-semibold hover:bg-white/90 transition-colors"
            >
              Submit a Local Issue
            </Link>
            <Link
              to="/news"
              className="border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white/10 transition-colors"
            >
              Read Latest News
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
