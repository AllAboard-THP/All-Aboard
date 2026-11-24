import { notFound, permanentRedirect } from "next/navigation";

import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { isProfileUuid } from "@/lib/profile-atom-url";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Stable mission URL `/m/<mission uuid>`, the mission atom on Intuition
 * (ADR 0010 §2). It only redirects (308) to the current mission page.
 */
export default async function MissionAtomAliasPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isProfileUuid(id)) {
    notFound();
  }
  const appLocale = (routing.locales as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
  permanentRedirect(
    getPathname({ href: `/missions/${id.toLowerCase()}`, locale: appLocale }),
  );
}
