"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AuthMeResponse, SubjectsResponse } from "@allaboard/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  buildHelpRequestPayload,
  HelpRequestFormFields,
  type HelpRequestFormValues,
} from "@/components/features/help-request-form-fields";
import {
  buildRubberduckRedirectUrl,
  fetchRubberduckRedirectUrl,
} from "@/lib/rubberduck-redirect";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";
import { suggestHelpRequestTags } from "@/lib/help-request-client";
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

async function fetchSubjects(): Promise<SubjectsResponse["items"]> {
  const res = await fetch("/api/subjects", { cache: "no-store" });
  if (!res.ok) throw new Error(`Subjects ${res.status}`);
  const data = (await res.json()) as SubjectsResponse;
  return data.items;
}

async function createHelpRequest(
  payload: Record<string, unknown>,
): Promise<CreateResult> {
  const createRes = await fetch("/api/help-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const createText = await createRes.text();

  if (!createRes.ok) {
    throwFromApiResponse(createRes.status, createText);
  }
  return JSON.parse(createText) as CreateResult;
}

const emptyValues: HelpRequestFormValues = {
  title: "",
  body: "",
  tagsRaw: "",
  codeSnippet: "",
  codeLanguage: "",
  subjectId: "",
  urgent: false,
  educationLevel: "",
};

export function HelpRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<HelpRequestFormValues>(emptyValues);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [rubberduckMessage, setRubberduckMessage] = useState<string | null>(
    null,
  );
  const [suggestTagsError, setSuggestTagsError] = useState<string | null>(null);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects-catalog"],
    queryFn: fetchSubjects,
    staleTime: 300_000,
  });

  const suggestTagsMutation = useMutation({
    mutationFn: () =>
      suggestHelpRequestTags({
        ...(values.title.trim() ? { title: values.title.trim() } : {}),
        ...(values.body.trim() ? { body: values.body.trim() } : {}),
      }),
    onSuccess: (data) => {
      setSuggestTagsError(null);
      if (data.tags.length > 0) {
        setValues((current) => ({
          ...current,
          tagsRaw: data.tags.join(", "),
        }));
      }
    },
    onError: (err: Error) => {
      setSuggestTagsError(
        err instanceof ApiRequestError
          ? tErrors(
              mapApiError({
                status: err.status,
                body: { error: err.code },
              }),
            )
          : tCommon("unknownError"),
      );
    },
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
              title: values.title.trim(),
            }),
          );
          return;
        }
        setRubberduckMessage(t("rubberduckHandoff"));
        setValues(emptyValues);
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
    if (authQuery.isPending) return;
    if (!authQuery.data) {
      router.push(`/login?returnTo=${encodeURIComponent("/help/new")}`);
      return;
    }
    setDuplicateId(null);
    setRubberduckMessage(null);
    const payload = buildHelpRequestPayload(
      values,
      authQuery.data.educationLevel,
    );
    mutation.mutate(payload);
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
      <HelpRequestFormFields
        idPrefix="help"
        values={values}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
        subjects={subjectsQuery.data ?? []}
        suggestTagsPending={suggestTagsMutation.isPending}
        onSuggestTags={() => suggestTagsMutation.mutate()}
        suggestTagsError={suggestTagsError}
      />
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
        disabled={mutation.isPending || authQuery.isPending || !values.title.trim()}
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
