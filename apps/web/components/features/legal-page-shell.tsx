import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Link } from "@/i18n/navigation";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export async function LegalPageShell({
  title,
  updatedAt,
  children,
}: LegalPageShellProps) {
  const t = await getTranslations("legal");

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{updatedAt}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
          {children}
        </CardContent>
      </Card>
      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
