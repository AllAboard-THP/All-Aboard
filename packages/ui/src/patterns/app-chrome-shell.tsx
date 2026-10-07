"use client";

import type { ReactNode } from "react";

import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import { cn } from "../lib/utils";
import {
  APP_CHROME_BRAND_MARK_CLASS,
  APP_CHROME_BRAND_WORDMARK_CLASS,
  APP_CHROME_FOOTER_CLASS,
  APP_CHROME_FOOTER_ROW_CLASS,
  APP_CHROME_FOOTER_SHELL_CLASS,
  APP_CHROME_HEADER_CLASS,
  APP_CHROME_HEADER_ROW_CLASS,
  APP_SHELL_FOOTER_CHROME_CLASS,
  APP_SHELL_HEADER_CHROME_CLASS,
} from "./landing-layout";

export type AppChromeHeaderLayout = "bar" | "surface";

/**
 * Canonical header shell — glass chrome from `landing-layout.ts`.
 * Use on every in-app / landing page header (never ad-hoc `landing-chrome`).
 */
export function AppChromeHeader({
  children,
  className,
  layout = "bar",
}: {
  children: ReactNode;
  className?: string;
  /** `bar` = full-width fixed bar; `surface` = glass only (dashboard grid header). */
  layout?: AppChromeHeaderLayout;
}) {
  const baseClass =
    layout === "bar" ? APP_CHROME_HEADER_CLASS : APP_SHELL_HEADER_CHROME_CLASS;

  return <header className={cn(baseClass, className)}>{children}</header>;
}

/** Inner row — logo left, actions right (shared padding + min height). */
export function AppChromeHeaderRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(APP_CHROME_HEADER_ROW_CLASS, className)}>{children}</div>
  );
}

/** Logo mark + gradient wordmark — single source for header brand sizing. */
export function AppChromeBrand({
  brandName,
  className,
  markClassName,
  wordmarkClassName,
}: {
  brandName: string;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      <AllAboardLogoMark
        className={cn(APP_CHROME_BRAND_MARK_CLASS, markClassName)}
        title={brandName}
      />
      <span
        className={cn(
          APP_CHROME_BRAND_WORDMARK_CLASS,
          "whitespace-nowrap",
          wordmarkClassName,
        )}
      >
        {brandName}
      </span>
    </div>
  );
}

/**
 * Canonical footer shell — glass chrome + landing spacing.
 * Pass `AppChromeFooterRow` or `AppFooter` content inside.
 */
export function AppChromeFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        APP_CHROME_FOOTER_SHELL_CLASS,
        APP_CHROME_FOOTER_CLASS,
        className,
      )}
    >
      {children}
    </footer>
  );
}

/** Footer inner row — edge padding aligned with header. */
export function AppChromeFooterRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(APP_CHROME_FOOTER_ROW_CLASS, className)}>{children}</div>
  );
}

/** @internal Re-export for layouts that need surface-only footer (sidebar shells). */
export const APP_SHELL_HEADER_CHROME = APP_SHELL_HEADER_CHROME_CLASS;
export const APP_SHELL_FOOTER_CHROME = APP_SHELL_FOOTER_CHROME_CLASS;
