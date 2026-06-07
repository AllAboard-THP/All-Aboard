"use client";

import type { ComponentType } from "react";
import { useLocale } from "next-intl";

import {
  StorybookLocaleProvider,
  type StorybookLocale,
} from "@allaboard/ui/i18n/storybook-locale";

type LegacyScreenPageProps = {
  screen: ComponentType;
};

/** Legacy Storybook screen — syncs `useLegacyLabels()` with next-intl route locale. */
export function LegacyScreenPage({ screen: Screen }: LegacyScreenPageProps) {
  const locale = useLocale() as StorybookLocale;

  return (
    <StorybookLocaleProvider locale={locale}>
      <Screen />
    </StorybookLocaleProvider>
  );
}
