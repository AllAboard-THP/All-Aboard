import type { AppLocale } from "@/i18n/routing";

const units: Array<{
  limit: number;
  divisor: number;
  unit: Intl.RelativeTimeFormatUnit;
}> = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 604800, divisor: 86400, unit: "day" },
  { limit: 2629800, divisor: 604800, unit: "week" },
  { limit: 31557600, divisor: 2629800, unit: "month" },
  { limit: Number.POSITIVE_INFINITY, divisor: 31557600, unit: "year" },
];

export function formatRelativeTime(iso: string, locale: AppLocale): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const deltaSeconds = Math.round((then - now) / 1000);
  const absSeconds = Math.abs(deltaSeconds);

  const rtf = new Intl.RelativeTimeFormat(
    locale === "fr" ? "fr-FR" : "en-US",
    { numeric: "auto" },
  );

  for (const { limit, divisor, unit } of units) {
    if (absSeconds < limit) {
      const value = Math.round(deltaSeconds / divisor);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, "second");
}
