"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";

import {
  StorybookLocaleProvider,
  type StorybookLocale,
} from "@allaboard/ui/i18n/storybook-locale";

/** Syncs legacy UI labels (`useLegacyLabels`) with the active next-intl route locale. */
export function LocaleBridge({ children }: { children: ReactNode }) {
  const locale = useLocale() as StorybookLocale;

  return (
    <StorybookLocaleProvider locale={locale}>{children}</StorybookLocaleProvider>
  );
}
