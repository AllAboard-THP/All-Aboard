"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import { registerPasskey } from "@/lib/passkey-auth";

type Props = {
  returnTo?: string;
};

export function PasskeyRegisterForm({ returnTo = "/" }: Props) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptCgu, setAcceptCgu] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      registerPasskey({
        fullName: fullName.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        acceptCgu: true,
      }),
    onSuccess: async () => {
      router.push(returnTo);
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
      : mutation.error instanceof Error &&
          mutation.error.name !== "NotAllowedError"
        ? t("webauthnFailed")
        : null;

  const canSubmit = fullName.trim().length > 0 && acceptCgu;

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) mutation.mutate();
      }}
      data-testid="passkey-register-form"
    >
      <div className="grid gap-2">
        <Label htmlFor="register-full-name">{t("fullName")}</Label>
        <Input
          id="register-full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="register-email">{t("emailOptional")}</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={acceptCgu}
          onChange={(e) => setAcceptCgu(e.target.checked)}
          data-testid="register-accept-cgu"
          className="mt-0.5 size-4 rounded border-input"
        />
        <span>{t("acceptCgu")}</span>
      </label>
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={mutation.isPending || !canSubmit}
        className="w-full"
      >
        {mutation.isPending ? tCommon("sending") : t("registerSubmit")}
      </Button>
      <p className="m-0 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-primary underline"
        >
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
