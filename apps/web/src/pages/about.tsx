import { useEffect, useRef, useState } from "react";
import { Target, Users, Heart, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

const values = [
  {
    icon: Target,
    title: "Transparency",
    description:
      "We believe in accurate reporting that holds governments accountable to the people.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Our platform focuses on hyper-local citizen concerns and grassroots movements.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description:
      "Fact-based journalism with rigorous verification and ethical standards.",
  },
  {
    icon: Award,
    title: "Accountability",
    description:
      "Tracking government actions and demanding answers for our community.",
  },
];

const team = [
  {
    name: "Priya Sharma",
    role: "Editor-in-Chief",
    description:
      "Award-winning investigative journalist focused on local governance and civic issues.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    name: "Rajesh Kumar",
    role: "Senior Reporter",
    description:
      "Specializes in municipal politics and infrastructure development reporting.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
  {
    name: "Anjali Menon",
    role: "Community Engagement Manager",
    description:
      "Passionate about citizen-led grassroots stories and local concerns.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
  {
    name: "Vikram Patel",
    role: "Data Journalist",
    description:
      "Analyzes public datasets and government data to uncover accountability stories.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
];

const journey = [
  {
    year: "2020",
    title: "Ullatchi Founded",
    description: "Started as a grassroots blog",
  },
  {
    year: "2021",
    title: "10K Subscribers",
    description: "Reached 10,000 monthly readers",
  },
  {
    year: "2022",
    title: "First Investigation",
    description: "Published major infrastructure exposé",
  },
  {
    year: "2023",
    title: "Community Platform",
    description: "Launched citizen-reporting tools",
  },
  {
    year: "2024",
    title: "Award Recognition",
    description: "Won Regional Journalism Award",
  },
  {
    year: "2025",
    title: "100K+ Readers",
    description: "Serving over 100,000 citizens monthly",
  },
];

function JourneyTimeline() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set(prev).add(index));
            }
          });
        },
        { threshold: 0.2 },
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div className="relative">
      {/* Timeline line - Desktop: center, Mobile: left */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

      <div className="space-y-8 md:space-y-12">
        {journey.map((item, index) => {
          const isVisible = visibleItems.has(index);
          const isLeft = index % 2 === 0;

          return (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="relative"
            >
              {/* Mobile layout: dot on left, card on right */}
              <div className="md:hidden pl-12 relative">
                {/* Mobile dot */}
                <div className="absolute left-4 top-2 -translate-x-1/2">
                  <div
                    className={`w-5 h-5 rounded-full bg-primary transition-transform duration-500 shrink-0 ${
                      isVisible ? "scale-100" : "scale-0"
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Mobile card */}
                <Card
                  className={`bg-card shadow-sm p-6 transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <h3 className="text-3xl font-bold text-primary mb-3">
                    {item.year}
                  </h3>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </Card>
              </div>

              {/* Desktop layout: alternating left/right */}
              <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 items-center">
                {/* Left side */}
                <div className="md:flex md:justify-end">
                  {isLeft && (
                    <Card
                      className={`bg-card shadow-sm p-6 md:p-8 max-w-md transition-all duration-700 ${
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        {item.year}
                      </h3>
                      <h4 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </Card>
                  )}
                </div>

                {/* Center dot */}
                <div className="flex items-center justify-center relative">
                  <div
                    className={`w-6 h-6 rounded-full bg-primary transition-transform duration-500 shrink-0 ${
                      isVisible ? "scale-100" : "scale-0"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Right side */}
                <div className="md:flex md:justify-start">
                  {!isLeft && (
                    <Card
                      className={`bg-card shadow-sm p-6 md:p-8 max-w-md transition-all duration-700 ${
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        {item.year}
                      </h3>
                      <h4 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div>
      {/* Our Mission Section */}
      <section className="bg-accent/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Our Mission
          </h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12 md:mb-16 text-lg">
            Ullatchi exists to empower communities through transparent,
            accountable, and citizen-driven journalism. We shine a light on
            local government actions, give voice to community concerns, and
            create a platform where every citizen can contribute to holding
            power accountable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="p-6 md:p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            Meet Our Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1 text-primary">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="bg-accent/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-20">
            Our Journey
          </h2>

          <div className="max-w-4xl mx-auto">
            <JourneyTimeline />
          </div>
        </div>
      </section>

      {/* Our Editorial Standards Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto bg-accent/50 border-0 shadow-sm p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Our Editorial Standards
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                At Ullatchi, we are committed to the highest standards of
                journalistic integrity. Every story we publish undergoes
                rigorous fact-checking and verification.
              </p>
              <p>
                We maintain editorial independence from political parties,
                corporate interests, and government influence. Our funding comes
                from community support and ethical advertising partnerships that
                never compromise our editorial judgment.
              </p>
              <p>
                We believe in transparency about our methods, sources, and any
                potential conflicts of interest. When we make mistakes, we
                correct them promptly and clearly.
              </p>
              <p className="font-semibold text-foreground">
                Most importantly, we see ourselves as servants of the community.
                Our accountability is to you, the citizens we depend on us for
                accurate, fair, and relevant local news.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
