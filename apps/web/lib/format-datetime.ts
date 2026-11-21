import type { AppLocale } from "@/i18n/routing";

const localeToBcp47: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

export function formatDateTime(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleString(localeToBcp47[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
