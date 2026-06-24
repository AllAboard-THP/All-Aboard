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
  deleteDenylistPattern,
  updateDenylistPatternActive,
} from "@/lib/admin-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  patternId: string;
  active: boolean;
};

export function AdminDenylistRowActions({ patternId, active }: Props) {
  const router = useRouter();
  const t = useTranslations("admin.denylist");
  const tErrors = useTranslations("errors");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const toggleMutation = useMutation({
    mutationFn: () => updateDenylistPatternActive(patternId, !active),
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

  const deleteMutation = useMutation({
    mutationFn: () => deleteDenylistPattern(patternId),
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

  const pending = toggleMutation.isPending || deleteMutation.isPending;

  function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    deleteMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-2">
      {errorKey ? (
        <Alert variant="destructive" data-testid="admin-denylist-row-error">
          <AlertTitle>{t("actionErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          data-testid={`admin-denylist-toggle-${patternId}`}
          onClick={() => toggleMutation.mutate()}
        >
          {pending ? t("actionPending") : t("toggleActive")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={pending}
          data-testid={`admin-denylist-delete-${patternId}`}
          onClick={handleDelete}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
