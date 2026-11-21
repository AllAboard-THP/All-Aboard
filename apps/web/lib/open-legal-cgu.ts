import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** Opens CGU in a new tab with locale-aware routing. */
export function openLegalCgu(locale: AppLocale) {
  const href = getPathname({ locale, href: "/legal/cgu" });
  window.open(href, "_blank", "noopener,noreferrer");
}
