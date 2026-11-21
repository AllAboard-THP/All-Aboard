"use client";

import type { Skill } from "@allaboard/types";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";

import { useRouter } from "@/i18n/navigation";
import { giveCertification } from "@/lib/certification-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

/** Same limit as the API (`CERTIFICATION_COMMENT_MAX`). */
export const CERTIFICATION_COMMENT_MAX = 280;

type Props = {
  recipientId: string;
  recipientName: string;
  /** Active skills the viewer has not certified yet for this recipient. */
  skills: Skill[];
};

export function SkillCertificationForm({
  recipientId,
  recipientName,
  skills,
}: Props) {
  const t = useTranslations("profile.public.certifications");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const selectId = useId();
  const commentId = useId();
  const [open, setOpen] = useState(false);
  const [skillId, setSkillId] = useState("");
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      giveCertification(recipientId, {
        skillId,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      setOpen(false);
      setSkillId("");
      setComment("");
      router.refresh();
    },
  });

  if (skills.length === 0) {
    return (
      <p
        className="m-0 text-sm text-muted-foreground"
        data-testid="certification-all-given"
      >
        {t("allGiven")}
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        data-testid="certification-open"
        onClick={() => setOpen(true)}
      >
        {t("give", { name: recipientName })}
      </Button>
    );
  }

  const errorKey =
    mutation.error instanceof ApiRequestError ?
      mapApiError({
        status: mutation.error.status,
        body: { error: mutation.error.code },
      })
    : mutation.error ? "unknown"
    : null;
  const canSubmit =
    skillId.length > 0 &&
    comment.length <= CERTIFICATION_COMMENT_MAX &&
    !mutation.isPending;

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border p-4"
      data-testid="certification-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) mutation.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={selectId}>{t("skillLabel")}</Label>
        <select
          id={selectId}
          value={skillId}
          onChange={(event) => setSkillId(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          data-testid="certification-skill"
        >
          <option value="">{t("skillPlaceholder")}</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={commentId}>{t("commentLabel")}</Label>
        <Textarea
          id={commentId}
          value={comment}
          maxLength={CERTIFICATION_COMMENT_MAX}
          placeholder={t("commentPlaceholder")}
          onChange={(event) => setComment(event.target.value)}
          data-testid="certification-comment"
        />
        <p className="m-0 text-xs text-muted-foreground">
          {t("commentHint", { max: CERTIFICATION_COMMENT_MAX })}
        </p>
      </div>
      {errorKey ?
        <p className="m-0 text-sm text-destructive" role="alert">
          {tErrors(errorKey)}
        </p>
      : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit}
          data-testid="certification-submit"
        >
          {mutation.isPending ? t("submitPending") : t("submit")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setOpen(false);
            mutation.reset();
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
