import { Link } from "react-router";

export function CTASection() {
  return (
    <section className="bg-primary text-primary-foreground py-16 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Have a Local Issue to Report?
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Help us keep your community accountable. Share your problems and track
          their resolution.
        </p>
        <Link
          to="/report-issue"
          className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          Submit Your Issue
        </Link>
      </div>
    </section>
  );
}
