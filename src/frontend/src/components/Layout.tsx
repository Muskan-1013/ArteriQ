import { Moon, Sun, UserRound } from "lucide-react";
import { motion } from "motion/react";

import { ArteriQLogo } from "@/components/ArteriQLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact Us" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

interface LayoutProps {
  children: React.ReactNode;
  onProfileClick?: () => void;
}

export function Layout({ children, onProfileClick }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav
          data-ocid="header_nav"
          className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-3 pr-2"
          aria-label="Primary"
        >
          <button
            type="button"
            data-ocid="header_logo"
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2 rounded-full px-2 py-1 transition-transform hover:scale-[1.03]"
            aria-label="ArteriQ home"
          >
            <motion.div
              layoutId="arteriq-logo"
              className="flex items-center gap-2"
            >
              <ArteriQLogo size={40} />
              <span className="hidden font-display text-xl tracking-wide text-foreground sm:inline">
                ArteriQ
              </span>
            </motion.div>
          </button>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-ocid={`nav_${item.id}`}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="ml-1 flex items-center gap-1 border-l border-border pl-2">
              <Button
                data-ocid="theme_toggle"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )}
              </Button>
            </div>

            <div className="ml-1 flex items-center gap-1 border-l border-border pl-2">
              <Button
                data-ocid="profile_button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Profile"
                onClick={onProfileClick}
              >
                <UserRound className="size-5" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer
        data-ocid="footer"
        className="relative z-10 mt-16 border-t border-border bg-card"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <ArteriQLogo size={32} />
            <div>
              <p className="font-display text-lg tracking-wide text-foreground">
                ArteriQ
              </p>
              <p className="text-xs text-muted-foreground">
                Non-invasive cardiovascular risk screening
              </p>
            </div>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            aria-label="Footer"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                data-ocid={`footer_link_${item.id}`}
                onClick={() => scrollToSection(item.id)}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ArteriQ. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
