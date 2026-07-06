"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse, HelpRequest, SubjectsResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  buildHelpRequestPayload,
  HelpRequestFormFields,
  tagsToRaw,
  type HelpRequestFormValues,
} from "@/components/features/help-request-form-fields";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  suggestHelpRequestTags,
  updateHelpRequest,
} from "@/lib/help-request-client";

type Props = {
  requestId: string;
  initialItem: HelpRequest;
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

function initialValues(item: HelpRequest): HelpRequestFormValues {
  return {
    title: item.title,
    body: item.body ?? "",
    tagsRaw: tagsToRaw(item.tags),
    codeSnippet: item.codeSnippet ?? "",
    codeLanguage: item.codeLanguage ?? "",
    subjectId: item.subjectId ?? "",
    urgent: item.urgent ?? false,
    educationLevel: item.educationLevel ?? "",
  };
}

export function HelpRequestEditForm({ requestId, initialItem }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpRequest");
  const tForm = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<HelpRequestFormValues>(() =>
    initialValues(initialItem),
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

  const isAuthor =
    Boolean(authQuery.data) &&
    authQuery.data!.userId === initialItem.authorId;

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
    mutationFn: () => {
      const payload = buildHelpRequestPayload(
        values,
        authQuery.data?.educationLevel,
      );
      return updateHelpRequest(requestId, {
        title: payload.title as string,
        ...(payload.body ? { body: payload.body as string } : { body: "" }),
        tags: (payload.tags as string[] | undefined) ?? [],
        ...(payload.codeSnippet
          ? {
              codeSnippet: payload.codeSnippet as string,
              codeLanguage: payload.codeLanguage as string,
            }
          : { codeSnippet: null, codeLanguage: values.codeLanguage.trim() || "plaintext" }),
        ...(values.subjectId
          ? { subjectId: values.subjectId }
          : { subjectId: null }),
        urgent: values.urgent,
        ...(payload.educationLevel
          ? { educationLevel: payload.educationLevel as string }
          : {}),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      await queryClient.invalidateQueries({
        queryKey: ["help-request", requestId],
      });
      router.push(`/requests/${requestId}`);
    },
  });

  function submit() {
    if (!isAuthor) return;
    mutation.mutate();
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

  const loginHref = `/login?returnTo=${encodeURIComponent(`/requests/${requestId}/edit`)}`;

  if (!authQuery.isPending && !authQuery.data) {
    return (
      <Alert data-testid="help-edit-login-required">
        <AlertTitle>{tForm("loginRequiredTitle")}</AlertTitle>
        <AlertDescription>
          {tForm.rich("loginRequiredDescription", {
            link: () => (
              <Link href={loginHref} className="text-primary underline">
                {tForm("loginRequiredLink")}
              </Link>
            ),
          })}
        </AlertDescription>
      </Alert>
    );
  }

  if (!authQuery.isPending && authQuery.data && !isAuthor) {
    return (
      <Alert variant="destructive" data-testid="help-edit-forbidden">
        <AlertTitle>{t("editForbiddenTitle")}</AlertTitle>
        <AlertDescription>{t("editForbiddenDescription")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4" data-testid="help-request-edit-form">
      <HelpRequestFormFields
        idPrefix="help-edit"
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={mutation.isPending || authQuery.isPending || !values.title.trim()}
          onClick={() => submit()}
        >
          {mutation.isPending ? tCommon("sending") : t("editSave")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/requests/${requestId}`}>{t("editCancel")}</Link>
        </Button>
      </div>
    </div>
  );
}
