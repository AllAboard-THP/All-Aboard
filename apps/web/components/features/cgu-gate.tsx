"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";

async function acceptLegal(): Promise<{ cguAcceptedAt: string }> {
  const res = await fetch("/api/legal/accept", {
    method: "POST",
    credentials: "include",
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as { cguAcceptedAt: string };
}

export function CguGate() {
  const router = useRouter();
  const t = useTranslations("legal");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [accepted, setAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: acceptLegal,
    onSuccess: () => {
      router.refresh();
    },
  });

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : mutation.error instanceof Error
        ? tCommon("unknownError")
        : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      data-testid="cgu-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cgu-gate-title"
    >
      <Card className="w-full max-w-lg border-primary/20 shadow-2xl">
        <CardHeader>
          <CardTitle id="cgu-gate-title" className="text-xl">
            {t("gateTitle")}
          </CardTitle>
          <CardDescription>{t("gateSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
            <p className="m-0 text-sm leading-relaxed text-muted-foreground">
              {t.rich("gateIntro", {
                cgu: (chunks) => (
                  <Link
                    href="/legal/cgu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    {chunks}
                  </Link>
                ),
                mentions: (chunks) => (
                  <Link
                    href="/legal/mentions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>

          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (accepted) mutation.mutate();
            }}
          >
            <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                data-testid="cgu-gate-checkbox"
                className="mt-0.5 size-4 rounded border-input"
              />
              <span>{t("gateAcceptLabel")}</span>
            </label>

            {errorMessage ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={!accepted || mutation.isPending}
              className="w-full"
              data-testid="cgu-gate-submit"
            >
              {mutation.isPending ? tCommon("sending") : t("gateSubmit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
