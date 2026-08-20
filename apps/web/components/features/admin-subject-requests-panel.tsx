"use client";

import type { AdminSubjectRequestItem } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { cn } from "@allaboard/ui/lib/utils";

import { AdminSubjectRequestActions } from "@/components/features/admin-subject-request-actions";

type TabKey = "pending" | "approved" | "rejected";

type Props = {
  pending: AdminSubjectRequestItem[];
  approved: AdminSubjectRequestItem[];
  rejected: AdminSubjectRequestItem[];
  localeDateFormatter: (iso: string) => string;
};

const TABS: TabKey[] = ["pending", "approved", "rejected"];

export function AdminSubjectRequestsPanel({
  pending,
  approved,
  rejected,
  localeDateFormatter,
}: Props) {
  const t = useTranslations("admin.subjectRequests");
  const [tab, setTab] = useState<TabKey>("pending");

  const buckets: Record<TabKey, AdminSubjectRequestItem[]> = {
    pending,
    approved,
    rejected,
  };
  const items = buckets[tab];

  const tabLabels: Record<TabKey, string> = {
    pending: t("tabPending"),
    approved: t("tabApproved"),
    rejected: t("tabRejected"),
  };

  const tabCounts: Record<TabKey, number> = {
    pending: pending.length,
    approved: approved.length,
    rejected: rejected.length,
  };

  return (
    <>
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("title")}
        data-testid="admin-subject-requests-tabs"
      >
        {TABS.map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={tab === key ? "default" : "outline"}
            role="tab"
            aria-selected={tab === key}
            data-testid={`admin-subject-tab-${key}`}
            onClick={() => setTab(key)}
          >
            {tabLabels[key]}
            {tabCounts[key] > 0 ? (
              <Badge variant="secondary" className={cn("ml-2")}>
                {tabCounts[key]}
              </Badge>
            ) : null}
          </Button>
        ))}
      </div>

      <Card data-testid="admin-subject-requests-list">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">{tabLabels[tab]}</CardTitle>
        </CardHeader>
        {items.length > 0 ? (
          <CardContent className="p-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="border-b border-border p-5 last:border-b-0"
                data-testid="admin-subject-request-row"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="m-0 font-semibold">{item.name}</p>
                  <Badge variant="outline">{tabLabels[tab]}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {localeDateFormatter(item.createdAt)}
                  </span>
                </div>
                {item.description ? (
                  <p className="mb-2 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                <p className="mb-4 text-xs text-muted-foreground">
                  {t("author", {
                    name: item.authorDisplayName ?? item.authorEmail ?? item.authorId,
                  })}
                </p>
                <AdminSubjectRequestActions
                  requestId={item.id}
                  currentStatus={item.status}
                />
              </div>
            ))}
          </CardContent>
        ) : (
          <CardContent>
            <CardDescription>{t("empty")}</CardDescription>
          </CardContent>
        )}
      </Card>
    </>
  );
}
