import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Newspaper,
  Briefcase,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", newsletterEmail);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-accent/30 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            Connect with Ullatchi
          </h1>
          <p className="text-center text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            We're here to listen. Share your story, ask questions, or get
            involved.
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Contact Form */}
            <Card className="h-fit">
              <CardContent>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-2"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="How can we help?"
                      className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    Get in Touch
                  </h2>
                  <div className="space-y-6">
                    {/* Email */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a
                          href="mailto:contact@ullatchi.com"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          contact@ullatchi.com
                        </a>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          For general inquiries
                        </p>
                      </div>
                    </div>

                    {/* Editorial */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Editorial</h3>
                        <a
                          href="mailto:editorial@ullatchi.com"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          editorial@ullatchi.com
                        </a>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          For story tips and submissions
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a
                          href="tel:+15551234567"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          (555) 123-4567
                        </a>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Mon-Fri, 9AM-5PM
                        </p>
                      </div>
                    </div>

                    {/* Office */}
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Office</h3>
                        <p className="text-sm text-muted-foreground">
                          123 Main Street, Suite 200
                        </p>
                        <p className="text-sm text-muted-foreground">
                          City Center, ST 12345
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardContent>
                  <div className="aspect-4/3 bg-accent/50 flex items-center justify-center relative rounded-lg overflow-hidden">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground px-4">
                        Visit us at our office in the heart of downtown
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Stay Informed
            </h2>
            <p className="text-primary-foreground/90 mb-8 text-sm md:text-base">
              Subscribe to our newsletter for weekly updates on local government
              news and community issues.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                className="px-6 py-3 h-auto whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-primary-foreground/70 text-xs mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Cards */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* For Press */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">For Press</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Media inquiries and press releases
                </p>
                <a
                  href="mailto:press@ullatchi.com"
                  className="text-primary hover:underline font-medium text-sm"
                >
                  press@ullatchi.com
                </a>
              </CardContent>
            </Card>

            {/* Work With Us */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Work With Us</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Career opportunities and internships
                </p>
                <a
                  href="mailto:careers@ullatchi.com"
                  className="text-primary hover:underline font-medium text-sm"
                >
                  careers@ullatchi.com
                </a>
              </CardContent>
            </Card>

            {/* Partner With Us */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Handshake className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Partner With Us</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Advertising and sponsorship opportunities
                </p>
                <a
                  href="mailto:partnerships@ullatchi.com"
                  className="text-primary hover:underline font-medium text-sm"
                >
                  partnerships@ullatchi.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
