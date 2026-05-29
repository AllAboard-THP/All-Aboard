"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import { MentorNavLink } from "@/components/features/mentor-nav-link";

export const APP_SHELL_NAV = [
  { href: "/", label: "Feed" },
  { href: "/help/new", label: "Nouvelle demande" },
] as const;

const MENTOR_HREF = "/mentor";

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
  }
  if (href.startsWith("/requests")) {
    return pathname.startsWith("/requests");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="flex flex-wrap items-center gap-2"
    >
      {APP_SHELL_NAV.map(({ href, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(active && "bg-accent text-accent-foreground")}
          >
            <Link href={href} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
      <MentorNavLink active={isNavActive(pathname, MENTOR_HREF)} />
    </nav>
  );
}
