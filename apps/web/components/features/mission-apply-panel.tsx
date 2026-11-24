"use client";

import type { Mission } from "@allaboard/types";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";

import { Link, useRouter } from "@/i18n/navigation";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";
import { applyToMission, withdrawMyApplication } from "@/lib/mission-client";

const MESSAGE_MAX = 2000;

type Props = {
  mission: Mission;
  viewerId: string;
};

function useErrorText(error: unknown): string | null {
  const tErrors = useTranslations("errors");
  if (!error) return null;
  if (error instanceof ApiRequestError) {
    return tErrors(mapApiError({ status: error.status, body: { error: error.code } }));
  }
  return tErrors("unknown");
}

/** Apply, see one's application status, or (for the author) jump to the board. */
export function MissionApplyPanel({ mission, viewerId }: Props) {
  const t = useTranslations("missions");
  const router = useRouter();
  const [message, setMessage] = useState("");

  const apply = useMutation({
    mutationFn: () => applyToMission(mission.id, { message: message.trim() }),
    onSuccess: () => {
      setMessage("");
      router.refresh();
    },
  });
  const withdraw = useMutation({
    mutationFn: () => withdrawMyApplication(mission.id),
    onSuccess: () => router.refresh(),
  });
  const applyError = useErrorText(apply.error);
  const withdrawError = useErrorText(withdraw.error);

  if (mission.author.id === viewerId) {
    return (
      <div className="flex flex-wrap gap-2" data-testid="mission-author-actions">
        <Button asChild>
          <Link href="/dashboard/missions">{t("manageCta")}</Link>
        </Button>
        {mission.status === "open" || mission.status === "in_progress" ?
          <Button variant="outline" asChild>
            <Link href={`/missions/${mission.id}/edit`}>{t("editCta")}</Link>
          </Button>
        : null}
      </div>
    );
  }

  const application = mission.viewerApplication;
  if (application && application.status !== "withdrawn") {
    const canWithdraw = application.status === "pending" || application.status === "accepted";
    return (
      <div className="flex flex-col gap-3" data-testid="mission-application-status">
        <p className="m-0 text-sm">
          {t("yourApplication", {
            status: t(`applicationStatus.${application.status}`),
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/missions">{t("followCta")}</Link>
          </Button>
          {canWithdraw ?
            <Button
              variant="ghost"
              disabled={withdraw.isPending}
              onClick={() => withdraw.mutate()}
              data-testid="mission-withdraw-application"
            >
              {t("withdrawApplication")}
            </Button>
          : null}
        </div>
        {withdrawError ?
          <Alert variant="destructive">
            <AlertDescription>{withdrawError}</AlertDescription>
          </Alert>
        : null}
      </div>
    );
  }

  if (mission.status !== "open") {
    return (
      <p className="m-0 text-sm text-muted-foreground" data-testid="mission-closed">
        {t("applicationsClosed")}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      data-testid="mission-apply-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (message.trim()) apply.mutate();
      }}
    >
      <Label htmlFor="mission-apply-message">{t("applyLabel")}</Label>
      <Textarea
        id="mission-apply-message"
        value={message}
        maxLength={MESSAGE_MAX}
        rows={4}
        placeholder={t("applyPlaceholder")}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {message.length}/{MESSAGE_MAX}
        </span>
        <Button type="submit" disabled={apply.isPending || !message.trim()}>
          {t("applyCta")}
        </Button>
      </div>
      {applyError ?
        <Alert variant="destructive">
          <AlertDescription>{applyError}</AlertDescription>
        </Alert>
      : null}
    </form>
  );
}
