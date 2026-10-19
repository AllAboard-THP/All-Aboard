import { setRequestLocale } from "next-intl/server";

import { PublicLocaleFab } from "@/components/features/public-locale-fab";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Public marketing / auth — no AppShell; floating locale switcher only. */
export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PublicLocaleFab />
      {children}
    </>
  );
}
