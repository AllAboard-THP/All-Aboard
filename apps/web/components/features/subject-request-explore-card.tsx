"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { usePathname } from "@/i18n/navigation";

import { SubjectRequestModal } from "@/components/features/subject-request-modal";

export function SubjectRequestExploreCard() {
  const pathname = usePathname();
  const t = useTranslations("subjectRequests");
  const [open, setOpen] = useState(false);

  return (
    <>
      <li>
        <Card
          className="h-full border-2 border-dashed transition-colors hover:border-primary/50"
          data-testid="subject-request-explore-card"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-full w-full flex-col rounded-xl p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("exploreCardAria")}
          >
            <CardHeader className="gap-4 p-0">
              <div
                className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px]"
                aria-hidden
              >
                <div className="flex size-full items-center justify-center rounded-2xl bg-card text-2xl font-bold text-primary">
                  +
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{t("exploreCardTitle")}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {t("exploreCardDescription")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto flex items-center justify-between p-0 pt-4 text-sm text-muted-foreground">
              <span>{t("exploreCardCta")}</span>
              <span className="text-primary" aria-hidden>
                →
              </span>
            </CardContent>
          </button>
        </Card>
      </li>

      {open ? (
        <SubjectRequestModal
          open={open}
          onOpenChange={setOpen}
          returnTo={pathname}
        />
      ) : null}
    </>
  );
}
