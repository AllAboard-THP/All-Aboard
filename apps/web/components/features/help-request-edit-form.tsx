"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse, HelpRequest } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import { updateHelpRequest } from "@/lib/help-request-client";

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

function tagsToRaw(tags?: string[]): string {
  return tags?.join(", ") ?? "";
}

export function HelpRequestEditForm({ requestId, initialItem }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpRequest");
  const tForm = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState(initialItem.title);
  const [tagsRaw, setTagsRaw] = useState(tagsToRaw(initialItem.tags));

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isAuthor =
    Boolean(authQuery.data) &&
    authQuery.data!.userId === initialItem.authorId;

  const mutation = useMutation({
    mutationFn: (input: { title: string; tags: string[] }) =>
      updateHelpRequest(requestId, {
        title: input.title,
        tags: input.tags,
      }),
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
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mutation.mutate({ title, tags });
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
      <div className="grid gap-2">
        <Label htmlFor="help-edit-title">{tForm("title")}</Label>
        <Input
          id="help-edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-edit-tags">{tForm("tags")}</Label>
        <Input
          id="help-edit-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={tForm("tagsPlaceholder")}
        />
      </div>
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={mutation.isPending || authQuery.isPending || !title.trim()}
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
