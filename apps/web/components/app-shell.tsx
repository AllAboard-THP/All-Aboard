import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/feed", label: "Feed" },
  { href: "/explore", label: "Explorer" },
  { href: "/messages", label: "Messages" },
] as const;

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-nav border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link
              href="/"
              className="rounded-sm text-sm font-bold uppercase tracking-widest text-indigo-300 focus-ring"
            >
              All-Aboard
            </Link>
          </div>
          <nav
            className="hidden flex-wrap items-center gap-1 md:flex md:gap-2"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="hidden sm:inline-flex">
              MVP
            </Badge>
            <UserMenu />
            <Link
              href="/login"
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary focus-ring sm:inline-flex"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>
      <main className={cn("flex-1", className)}>{children}</main>
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© All-Aboard — kit UX sur apps/web</p>
          <div className="flex gap-4">
            <Link
              href="/health"
              className="rounded-sm hover:text-foreground focus-ring"
            >
              Statut technique
            </Link>
            <Link
              href="/legal"
              className="rounded-sm hover:text-foreground focus-ring"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
