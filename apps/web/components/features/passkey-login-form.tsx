"use client";

import {
  browserSupportsWebAuthnAutofill,
  startAuthentication,
} from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  fetchPasskeyLoginOptions,
  loginWithPasskey,
  verifyPasskeyLoginResponse,
} from "@/lib/passkey-auth";

type Props = {
  returnTo?: string;
};

export function PasskeyLoginForm({ returnTo = "/" }: Props) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const conditionalStarted = useRef(false);

  const mutation = useMutation({
    mutationFn: () => loginWithPasskey(),
    onSuccess: async () => {
      router.push(returnTo);
      router.refresh();
    },
  });

  useEffect(() => {
    if (conditionalStarted.current) return;
    if (!browserSupportsWebAuthnAutofill()) return;

    conditionalStarted.current = true;
    let cancelled = false;

    void (async () => {
      try {
        const options = await fetchPasskeyLoginOptions();
        if (cancelled) return;
        const authResponse = await startAuthentication({
          optionsJSON: options as Parameters<
            typeof startAuthentication
          >[0]["optionsJSON"],
          useBrowserAutofill: true,
        });
        if (cancelled) return;
        await verifyPasskeyLoginResponse(authResponse);
        router.push(returnTo);
        router.refresh();
      } catch {
        // User dismissed autofill or no passkey available — ignore.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [returnTo, router]);

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

  const registerHref =
    returnTo !== "/"
      ? `/register?returnTo=${encodeURIComponent(returnTo)}`
      : "/register";

  return (
    <div className="grid gap-4" data-testid="passkey-login-form">
      <input
        type="text"
        autoComplete="username webauthn"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute size-0 opacity-0"
        readOnly
      />
      <p className="m-0 text-sm text-muted-foreground">{t("loginHint")}</p>
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="button"
        disabled={mutation.isPending}
        className="w-full"
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? tCommon("sending") : t("loginSubmit")}
      </Button>
      <p className="m-0 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href={registerHref} className="font-medium text-primary underline">
          {t("registerLink")}
        </Link>
      </p>
    </div>
  );
}
