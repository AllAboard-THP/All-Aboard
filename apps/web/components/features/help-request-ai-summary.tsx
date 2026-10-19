"use client";

import { useQuery } from "@tanstack/react-query";
import type { HelpRequestDetailResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

type Props = {
  requestId: string;
  status?: string;
  initialAiSummary?: string;
};

async function fetchDetail(id: string): Promise<HelpRequestDetailResponse> {
  const res = await fetch(`/api/help-requests/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Detail ${res.status}`);
  }
  return (await res.json()) as HelpRequestDetailResponse;
}

export function HelpRequestAiSummary({
  requestId,
  status,
  initialAiSummary,
}: Props) {
  const t = useTranslations("helpRequest");
  const isResolved = status === "resolved";
  const hasSummary = Boolean(initialAiSummary?.trim());

  const q = useQuery({
    queryKey: ["help-request-ai-summary", requestId],
    queryFn: () => fetchDetail(requestId),
    enabled: isResolved && !hasSummary,
    refetchInterval: (query) => {
      const summary = query.state.data?.item.aiSummary?.trim();
      return summary ? false : 3_000;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  if (!isResolved) {
    return null;
  }

  const aiSummary = initialAiSummary?.trim() || q.data?.item.aiSummary?.trim();

  if (!aiSummary) {
    return (
      <Card className="mb-6" data-testid="help-request-ai-summary-pending">
        <CardHeader>
          <CardTitle className="text-base">{t("aiSummaryTitle")}</CardTitle>
          <CardDescription>{t("aiSummaryPending")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6" data-testid="help-request-ai-summary">
      <CardHeader>
        <CardTitle className="text-base">{t("aiSummaryTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="m-0 whitespace-pre-wrap text-sm text-foreground">
          {aiSummary}
        </p>
      </CardContent>
    </Card>
  );
}
