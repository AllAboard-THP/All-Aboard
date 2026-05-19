import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const Breadcrumb = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    aria-label="Fil d'Ariane"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

const BreadcrumbList = ({
  className,
  ...props
}: React.ComponentProps<"ol">) => (
  <ol
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words",
      className,
    )}
    {...props}
  />
);

const BreadcrumbItem = ({
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
);

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);

const BreadcrumbLink = ({
  className,
  href,
  ...props
}: React.ComponentProps<typeof Link>) => (
  <Link
    href={href ?? "#"}
    className={cn("transition-colors hover:text-foreground focus-ring rounded-sm", className)}
    {...props}
  />
);

const BreadcrumbPage = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
