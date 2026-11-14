"use client";

import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";

import { Link } from "@/i18n/navigation";

export function AppShellAuthActions() {
  const t = useTranslations("userMenu");

  return (
    <div className="flex items-center gap-2" data-testid="app-shell-auth-actions">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">{t("login")}</Link>
      </Button>
      <Button variant="secondary" size="sm" asChild>
        <Link href="/register">{t("register")}</Link>
      </Button>
    </div>
  );
}
