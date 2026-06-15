import { getTranslations } from "next-intl/server";

import { LegalPageShell } from "@/components/features/legal-page-shell";

export default async function LegalCguPage() {
  const t = await getTranslations("legal.cgu");

  return (
    <LegalPageShell title={t("title")} updatedAt={t("updatedAt")}>
      <p>{t("section1")}</p>
      <p>{t("section2")}</p>
    </LegalPageShell>
  );
}
