"use client";

import { useQuery } from "@tanstack/react-query";
import type { HelpRequestDetailResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";

type Props = {
  requestId: string;
  initialDetail: HelpRequestDetailResponse;
};

async function fetchDetail(
  id: string,
): Promise<HelpRequestDetailResponse> {
  const res = await fetch(`/api/help-requests/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Detail ${res.status}`);
  }
  return (await res.json()) as HelpRequestDetailResponse;
}

export function HelpRequestDetailClient({ requestId, initialDetail }: Props) {
  const t = useTranslations("common");
  const q = useQuery({
    queryKey: ["help-request", requestId],
    queryFn: () => fetchDetail(requestId),
    initialData: initialDetail,
    staleTime: 60_000,
  });

  if (q.isFetching && !q.isPending) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-testid="help-request-refetching"
      >
        {t("refetching")}
      </p>
    );
  }

  return null;
}
