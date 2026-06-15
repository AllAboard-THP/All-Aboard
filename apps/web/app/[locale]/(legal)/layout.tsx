import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LegalLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
