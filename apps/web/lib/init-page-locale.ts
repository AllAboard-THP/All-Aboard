import { setRequestLocale } from "next-intl/server";

import type { AppLocale } from "@/i18n/routing";

/** Call at the top of every localized page for correct static locale rendering. */
export function initPageLocale(locale: string) {
  setRequestLocale(locale as AppLocale);
}
