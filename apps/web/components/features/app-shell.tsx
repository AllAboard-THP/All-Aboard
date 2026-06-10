import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { AppShellLayout } from "@/components/features/app-shell-layout";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <AppShellLayout brandName={t("brand")} year={year}>
      {children}
    </AppShellLayout>
  );
}
