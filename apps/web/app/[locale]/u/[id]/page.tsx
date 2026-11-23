import { notFound, permanentRedirect } from "next/navigation";

import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { isProfileUuid } from "@/lib/profile-atom-url";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Stable profile URL `/u/<user uuid>`, used as the person atom on Intuition
 * (ADR 0009 §2). It must keep working even if the profile route moves, so it
 * only redirects (308) to the current public profile.
 */
export default async function ProfileAtomAliasPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isProfileUuid(id)) {
    notFound();
  }
  const appLocale = (routing.locales as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
  permanentRedirect(
    getPathname({ href: `/users/${id.toLowerCase()}`, locale: appLocale }),
  );
}
