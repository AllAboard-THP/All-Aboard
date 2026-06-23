import { LandingForgotPasswordPage } from "@/components/features/landing-forgot-password-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ForgotPasswordPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LandingForgotPasswordPage />;
}
