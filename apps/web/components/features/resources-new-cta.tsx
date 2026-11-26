"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuthMeResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";

import { Link } from "@/i18n/navigation";

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

export function ResourcesNewCta() {
  const t = useTranslations("resources");
  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const canPublish =
    authQuery.data?.role === "mentor" || authQuery.data?.role === "admin";
  const label = canPublish ? t("newCtaMentor") : t("newCtaStudent");

  return (
    <Button size="sm" asChild data-testid="resources-new-cta">
      <Link href="/resources/new">{label}</Link>
    </Button>
  );
}
