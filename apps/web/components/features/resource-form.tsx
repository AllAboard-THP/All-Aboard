"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse, Resource, Subject } from "@allaboard/types";
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
import { Textarea } from "@allaboard/ui/components/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  createResource,
  updateResource,
} from "@/lib/resource-client";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  subjects: Subject[];
  resourceId?: string;
  initialItem?: Resource;
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

export function ResourceForm({ mode, subjects, resourceId, initialItem }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("resources");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");

  const [title, setTitle] = useState(initialItem?.title ?? "");
  const [subjectId, setSubjectId] = useState(initialItem?.subjectId ?? "");
  const [tagsRaw, setTagsRaw] = useState(tagsToRaw(initialItem?.tags));
  const [body, setBody] = useState(initialItem?.body ?? "");

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isAuthor =
    mode === "edit" &&
    Boolean(authQuery.data) &&
    authQuery.data!.userId === initialItem?.authorId;
  const isAdmin = authQuery.data?.role === "admin";
  const canEdit = mode === "create" || isAuthor || isAdmin;
  const canPublish =
    authQuery.data?.role === "mentor" || authQuery.data?.role === "admin";

  const mutation = useMutation({
    mutationFn: async (input: {
      title: string;
      body: string;
      subjectId: string;
      tags: string[];
    }) => {
      if (mode === "create") {
        return createResource({
          title: input.title,
          body: input.body,
          subjectId: input.subjectId,
          ...(input.tags.length ? { tags: input.tags } : {}),
        });
      }
      if (!resourceId) {
        throw new Error("missing resource id");
      }
      return updateResource(resourceId, {
        title: input.title,
        body: input.body,
        subjectId: input.subjectId,
        tags: input.tags,
      });
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      router.push(`/resources/${data.item.id}`);
    },
  });

  function submit() {
    if (!canEdit) return;
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    mutation.mutate({
      title: title.trim(),
      body: body.trim(),
      subjectId,
      tags,
    });
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

  const returnPath =
    mode === "edit" && resourceId
      ? `/resources/${resourceId}/edit`
      : "/resources/new";
  const loginHref = `/login?returnTo=${encodeURIComponent(returnPath)}`;

  if (!authQuery.isPending && !authQuery.data) {
    return (
      <Alert data-testid="resource-form-login-required">
        <AlertTitle>{t("formLoginRequiredTitle")}</AlertTitle>
        <AlertDescription>
          {t.rich("formLoginRequiredDescription", {
            link: () => (
              <Link href={loginHref} className="text-primary underline">
                {t("formLoginRequiredLink")}
              </Link>
            ),
          })}
        </AlertDescription>
      </Alert>
    );
  }

  if (mode === "edit" && !authQuery.isPending && authQuery.data && !canEdit) {
    return (
      <Alert variant="destructive" data-testid="resource-form-forbidden">
        <AlertTitle>{t("editForbiddenTitle")}</AlertTitle>
        <AlertDescription>{t("editForbiddenDescription")}</AlertDescription>
      </Alert>
    );
  }

  const submitLabel =
    mode === "edit"
      ? t("formSubmitSave")
      : canPublish
        ? t("formSubmitPublish")
        : t("formSubmitPropose");

  return (
    <div className="grid gap-4" data-testid="resource-form">
      <div className="grid gap-2">
        <Label htmlFor="resource-title">{t("formTitle")}</Label>
        <Input
          id="resource-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("formTitlePlaceholder")}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="resource-subject">{t("formSubject")}</Label>
          <span className="text-xs text-destructive">{t("formSubjectRequired")}</span>
        </div>
        <select
          id="resource-subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t("formSubjectPlaceholder")}</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="resource-tags">{t("formTags")}</Label>
          <span className="text-xs text-muted-foreground">{t("formTagsOptional")}</span>
        </div>
        <Input
          id="resource-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={t("formTagsPlaceholder")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="resource-body">{t("formBody")}</Label>
        <Textarea
          id="resource-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("formBodyPlaceholder")}
          rows={12}
          className="resize-y"
        />
      </div>

      {errorMessage ? (
        <p className="m-0 text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          disabled={
            mutation.isPending ||
            authQuery.isPending ||
            !title.trim() ||
            !body.trim() ||
            !subjectId
          }
          onClick={() => submit()}
        >
          {mutation.isPending ? tCommon("sending") : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={mode === "edit" && resourceId ? `/resources/${resourceId}` : "/resources"}>
            {t("editCancel")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
