import { useState } from "react";
import { Link } from "react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const links = [
  { id: "home", label: "Home", to: "/" },
  { id: "news", label: "News", to: "/news" },
  {
    id: "community-voices",
    label: "Community Voices",
    to: "/community-voices",
  },
  { id: "report-issue", label: "Report Issue", to: "/report-issue" },
  {
    id: "government-watch",
    label: "Government Watch",
    to: "/government-watch",
  },
  { id: "about", label: "About", to: "/about" },
  { id: "contact", label: "Contact", to: "/contact" },
];

const mdLinks = ["news", "report-issue"];

export function Header() {
  const [open, setOpen] = useState(false);

  const mdVisibleLinks = links.filter((link) => mdLinks.includes(link.id));

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Ullatchi Logo"
            className="h-14 w-14 object-contain"
          />
        </Link>

        {/* Desktop navigation - all links */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className="hover:opacity-80 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Tablet/Mobile navigation - links + hamburger */}
        <div className="flex lg:hidden items-center gap-6">
          {/* Tablet navigation - only mdLinks visible */}
          <nav className="hidden md:flex items-center gap-6">
            {mdVisibleLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className="hover:opacity-80 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger menu for mobile (all links) and tablet (hamburgerLinks) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-primary-foreground"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-full bg-primary text-primary-foreground border-primary animate-in fade-in slide-in-from-right duration-300"
            >
              <nav className="flex flex-col gap-4 mt-16 px-4">
                {/* On mobile, show all links. On tablet, show only hamburgerLinks */}
                {links.map((link) => {
                  const showOnMd = mdLinks.includes(link.id);
                  return (
                    <Button
                      key={link.id}
                      variant="ghost"
                      className={`w-full justify-start text-lg h-12 text-primary-foreground hover:bg-primary-foreground/10 ${
                        showOnMd ? "md:hidden lg:hidden" : ""
                      }`}
                      render={
                        <Link to={link.to} onClick={() => setOpen(false)} />
                      }
                    >
                      {link.label}
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
