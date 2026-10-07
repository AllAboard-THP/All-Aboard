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
  approveMentorResource,
  rejectMentorResource,
} from "@/lib/mentor-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  resourceId: string;
};

export function MentorResourceReviewActions({ resourceId }: Props) {
  const router = useRouter();
  const t = useTranslations("mentor");
  const tErrors = useTranslations("errors");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: () => approveMentorResource(resourceId),
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
    mutationFn: () => rejectMentorResource(resourceId),
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
    if (!window.confirm(t("rejectConfirm"))) return;
    rejectMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-3">
      {errorKey ? (
        <Alert variant="destructive" data-testid="mentor-review-error">
          <AlertTitle>{t("reviewErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          data-testid="mentor-approve-resource"
          onClick={() => approveMutation.mutate()}
        >
          {pending ? t("reviewPending") : t("approve")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          data-testid="mentor-reject-resource"
          onClick={handleReject}
        >
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
