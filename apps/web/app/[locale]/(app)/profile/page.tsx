import { ProfilePage } from "@/components/features/profile-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function ProfileRoutePage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <ProfilePage />;
}
