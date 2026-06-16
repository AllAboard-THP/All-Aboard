import { PublicProfilePage } from "@/components/features/public-profile-page";
import { initPageLocale } from "@/lib/init-page-locale";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function UserPublicProfilePage({ params }: PageProps) {
  const { locale, id } = await params;
  initPageLocale(locale);
  return <PublicProfilePage userId={id} />;
}
