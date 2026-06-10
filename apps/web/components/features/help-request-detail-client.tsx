"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuthMeResponse,
  CreateResponseResponse,
  HelpRequestDetailResponse,
} from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";

type Props = {
  requestId: string;
  initialDetail: HelpRequestDetailResponse;
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

async function fetchDetail(
  id: string,
  filterByCertifications: boolean,
): Promise<HelpRequestDetailResponse> {
  const qs = filterByCertifications ? "?filterByCertifications=true" : "";
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(id)}${qs}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Detail ${res.status}`);
  }
  return (await res.json()) as HelpRequestDetailResponse;
}

async function loginAndRespond(input: {
  email: string;
  password: string;
  body: string;
  requestId: string;
}): Promise<CreateResponseResponse> {
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    throwFromApiResponse(loginRes.status, text);
  }

  const createRes = await fetch(
    `/api/help-requests/${encodeURIComponent(input.requestId)}/responses`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: input.body }),
    },
  );
  const createText = await createRes.text();
  if (!createRes.ok) {
    throwFromApiResponse(createRes.status, createText);
  }
  return JSON.parse(createText) as CreateResponseResponse;
}

export function HelpRequestDetailClient({ requestId, initialDetail }: Props) {
  const t = useTranslations("helpRequest");
  const tForm = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("alice@dev.local");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [filterByCertifications, setFilterByCertifications] = useState(false);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isMentor = authQuery.data?.role === "mentor";

  useEffect(() => {
    if (isMentor) {
      setFilterByCertifications(true);
    }
  }, [isMentor]);

  const q = useQuery({
    queryKey: ["help-request", requestId, filterByCertifications],
    queryFn: () => fetchDetail(requestId, filterByCertifications),
    initialData: filterByCertifications ? undefined : initialDetail,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: loginAndRespond,
    onSuccess: async () => {
      setBody("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  const detail = q.data ?? initialDetail;
  const responses = detail.responses ?? [];
  const hiddenCount =
    detail.certificationFilter &&
    detail.certificationFilter.totalCount > detail.certificationFilter.visibleCount
      ? detail.certificationFilter.totalCount -
        detail.certificationFilter.visibleCount
      : 0;

  function submit() {
    mutation.mutate({ email, password, body, requestId });
  }

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : null;

  return (
    <>
      {isMentor ? (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/30 px-4 py-3"
          data-testid="mentor-cert-filter-panel"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={filterByCertifications}
              onChange={(e) => setFilterByCertifications(e.target.checked)}
              data-testid="mentor-cert-filter-toggle"
              className="size-4 rounded border-input"
            />
            {t("certFilter")}
          </label>
          {filterByCertifications && hiddenCount > 0 ? (
            <p
              className="m-0 text-sm text-muted-foreground"
              data-testid="mentor-cert-filter-hidden-count"
            >
              {t("certHidden", { count: hiddenCount })}
            </p>
          ) : null}
        </div>
      ) : null}

      {q.isFetching && !q.isPending ? (
        <p
          className="mb-3 text-sm text-muted-foreground"
          data-testid="help-request-refetching"
        >
          {tCommon("updating")}
        </p>
      ) : null}

      <section aria-label={t("responsesSection")} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          {t("responsesSection")}
        </h2>
        {responses.length === 0 ? (
          <Card data-testid="responses-empty">
            <CardHeader>
              <CardTitle className="text-base">
                {t("responsesEmptyTitle")}
              </CardTitle>
              <CardDescription>
                {t("responsesEmptyDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="responses-list"
          >
            {responses.map((r) => (
              <li key={r.id} data-testid="response-item">
                <Card>
                  <CardContent className="pt-6">
                    <p className="m-0 text-sm text-foreground">{r.body}</p>
                    <p className="mt-2 mb-0 text-xs text-muted-foreground">
                      {r.authorId}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={t("replySection")} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          {t("replySection")}
        </h2>
        <Card data-testid="response-form">
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="response-email">{tForm("email")}</Label>
              <Input
                id="response-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response-password">{tForm("password")}</Label>
              <Input
                id="response-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response-body">{t("replyBody")}</Label>
              <Textarea
                id="response-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
            </div>
            {errorMessage ? (
              <p className="m-0 text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <Button
              type="button"
              disabled={mutation.isPending || !body.trim() || !password}
              onClick={() => submit()}
            >
              {mutation.isPending ? tCommon("sending") : t("replySubmit")}
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
