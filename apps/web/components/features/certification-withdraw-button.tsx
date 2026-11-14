"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import { withdrawCertification } from "@/lib/certification-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  recipientId: string;
  certificationId: string;
};

/** Withdraws the viewer's own +1, after an inline confirmation. */
export function CertificationWithdrawButton({
  recipientId,
  certificationId,
}: Props) {
  const t = useTranslations("profile.public.certifications");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => withdrawCertification(recipientId, certificationId),
    onSuccess: () => {
      setConfirming(false);
      router.refresh();
    },
  });

  const errorKey =
    mutation.error instanceof ApiRequestError ?
      mapApiError({
        status: mutation.error.status,
        body: { error: mutation.error.code },
      })
    : mutation.error ? "unknown"
    : null;

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ?
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            {t("withdrawConfirm")}
          </span>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={mutation.isPending}
            data-testid="certification-withdraw-confirm"
            onClick={() => mutation.mutate()}
          >
            {t("withdrawYes")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => setConfirming(false)}
          >
            {t("cancel")}
          </Button>
        </div>
      : <Button
          type="button"
          size="sm"
          variant="ghost"
          data-testid="certification-withdraw"
          onClick={() => setConfirming(true)}
        >
          {t("withdraw")}
        </Button>
      }
      {errorKey ?
        <p className="m-0 text-xs text-destructive" role="alert">
          {tErrors(errorKey)}
        </p>
      : null}
    </div>
  );
}
