"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import {
  approveModerationHelpRequest,
  approveModerationResponse,
  rejectModerationHelpRequest,
  rejectModerationResponse,
} from "@/lib/admin-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  kind: "help-request" | "response";
  itemId: string;
};

export function AdminModerationActions({ kind, itemId }: Props) {
  const router = useRouter();
  const t = useTranslations("admin.moderation");
  const tErrors = useTranslations("errors");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: () =>
      kind === "help-request" ?
        approveModerationHelpRequest(itemId)
      : approveModerationResponse(itemId),
    onSuccess: () => {
      setErrorKey(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      kind === "help-request" ?
        rejectModerationHelpRequest(itemId)
      : rejectModerationResponse(itemId),
    onSuccess: () => {
      setErrorKey(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  const pending = approveMutation.isPending || rejectMutation.isPending;

  function handleReject() {
    const message =
      kind === "help-request" ?
        t("rejectHelpConfirm")
      : t("rejectResponseConfirm");
    if (!window.confirm(message)) return;
    rejectMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-3">
      {errorKey ? (
        <Alert variant="destructive" data-testid="admin-moderation-action-error">
          <AlertTitle>{t("actionErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          data-testid={`admin-moderation-approve-${itemId}`}
          onClick={() => approveMutation.mutate()}
        >
          {pending ? t("actionPending") : t("approve")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          data-testid={`admin-moderation-reject-${itemId}`}
          onClick={handleReject}
        >
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
