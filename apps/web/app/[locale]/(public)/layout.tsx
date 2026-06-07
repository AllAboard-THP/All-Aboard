import { setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Public marketing / auth — no AppShell. */
export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
