"use client";

import type { ComponentType } from "react";

type LegacyScreenPageProps = {
  screen: ComponentType;
};

/** Thin client wrapper for Storybook legacy screens on apps/web routes. */
export function LegacyScreenPage({ screen: Screen }: LegacyScreenPageProps) {
  return <Screen />;
}
