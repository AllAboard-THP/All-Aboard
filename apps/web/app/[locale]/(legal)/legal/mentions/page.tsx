import { getTranslations } from "next-intl/server";

import { LegalPageShell } from "@/components/features/legal-page-shell";

export default async function LegalMentionsPage() {
  const t = await getTranslations("legal.mentions");

  return (
    <LegalPageShell title={t("title")} updatedAt={t("updatedAt")}>
      <p>{t("section1")}</p>
      <p>{t("section2")}</p>
    </LegalPageShell>
  );
}
