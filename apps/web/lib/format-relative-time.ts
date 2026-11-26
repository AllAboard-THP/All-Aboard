import type { AppLocale } from "@/i18n/routing";

const localeToBcp47: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

export function formatRelativeTime(iso: string, locale: AppLocale): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) {
    return "";
  }

  const diffMs = target - Date.now();
  const rtf = new Intl.RelativeTimeFormat(localeToBcp47[locale], { numeric: "auto" });

  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }

  return new Date(iso).toLocaleDateString(localeToBcp47[locale], {
    day: "numeric",
    month: "short",
  });
}
