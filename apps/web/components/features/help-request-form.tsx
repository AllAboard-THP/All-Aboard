"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AuthMeResponse } from "@allaboard/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import {
  buildRubberduckRedirectUrl,
  fetchRubberduckRedirectUrl,
} from "@/lib/rubberduck-redirect";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";
import { Link, useRouter } from "@/i18n/navigation";

type CreateResult = {
  item: { id: string };
  hints?: { rubberduckEligible?: boolean };
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

async function createHelpRequest(input: {
  title: string;
  tags: string[];
}): Promise<CreateResult> {
  const createRes = await fetch("/api/help-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: input.title,
      ...(input.tags.length ? { tags: input.tags } : {}),
    }),
  });
  const createText = await createRes.text();

  if (!createRes.ok) {
    throwFromApiResponse(createRes.status, createText);
  }
  return JSON.parse(createText) as CreateResult;
}

export function HelpRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [rubberduckMessage, setRubberduckMessage] = useState<string | null>(
    null,
  );

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: createHelpRequest,
    onSuccess: async (data) => {
      setDuplicateId(null);
      setRubberduckMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (data.hints?.rubberduckEligible) {
        const baseUrl = await fetchRubberduckRedirectUrl();
        if (baseUrl) {
          window.location.assign(
            buildRubberduckRedirectUrl(baseUrl, {
              requestId: data.item.id,
              title: title.trim(),
            }),
          );
          return;
        }
        setRubberduckMessage(t("rubberduckHandoff"));
        setTitle("");
        return;
      }
      router.push(`/requests/${data.item.id}`);
    },
    onError: (err: Error) => {
      setRubberduckMessage(null);
      if (err instanceof ApiRequestError && err.code === "duplicate" && err.existingId) {
        setDuplicateId(err.existingId);
      } else {
        setDuplicateId(null);
      }
    },
  });

  function submit() {
    if (!authQuery.data) {
      router.push(`/login?returnTo=${encodeURIComponent("/help/new")}`);
      return;
    }
    setDuplicateId(null);
    setRubberduckMessage(null);
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mutation.mutate({ title, tags });
  }

  const errorMessage =
    mutation.error instanceof ApiRequestError && mutation.error.code !== "duplicate"
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : null;

  const loginHref = `/login?returnTo=${encodeURIComponent("/help/new")}`;

  return (
    <div className="mt-5 grid gap-4">
      {!authQuery.data && !authQuery.isPending ? (
        <Alert data-testid="help-form-login-required">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link href={loginHref} className="text-primary underline">
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="help-title">{t("title")}</Label>
        <Input
          id="help-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-tags">{t("tags")}</Label>
        <Input
          id="help-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={t("tagsPlaceholder")}
        />
      </div>
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {duplicateId ? (
        <p className="m-0 text-sm text-destructive">
          {t("duplicate")}{" "}
          <Link
            href={`/requests/${duplicateId}`}
            className="font-medium text-primary underline"
          >
            {t("viewExisting")}
          </Link>
        </p>
      ) : null}
      {rubberduckMessage ? (
        <p
          className="m-0 text-sm text-primary"
          data-testid="rubberduck-handoff"
        >
          {rubberduckMessage}
        </p>
      ) : null}
      <Button
        type="button"
        disabled={mutation.isPending || !title.trim()}
        onClick={() => submit()}
        className="mt-1 w-full"
      >
        {mutation.isPending
          ? tCommon("sending")
          : authQuery.data
            ? t("submit")
            : t("submitSignIn")}
      </Button>
    </div>
  );
}
