"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { SubjectRequestStatus } from "@allaboard/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import { updateSubjectRequestStatus } from "@/lib/admin-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  requestId: string;
  currentStatus: SubjectRequestStatus;
};

export function AdminSubjectRequestActions({
  requestId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const t = useTranslations("admin.subjectRequests");
  const tErrors = useTranslations("errors");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (status: SubjectRequestStatus) =>
      updateSubjectRequestStatus(requestId, status),
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

  if (currentStatus !== "pending") {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {errorKey ? (
        <Alert variant="destructive" data-testid="admin-subject-request-error">
          <AlertTitle>{t("actionErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={mutation.isPending}
          data-testid={`admin-subject-approve-${requestId}`}
          onClick={() => mutation.mutate("approved")}
        >
          {mutation.isPending ? t("actionPending") : t("approve")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          data-testid={`admin-subject-reject-${requestId}`}
          onClick={() => mutation.mutate("rejected")}
        >
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
