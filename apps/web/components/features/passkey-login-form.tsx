"use client";

import {
  browserSupportsWebAuthnAutofill,
  startAuthentication,
} from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";
import {
  LOGIN_DEDICATED_MUTED_TEXT_CLASS,
} from "@allaboard/ui/patterns/landing-layout";
import { Link, useRouter } from "@/i18n/navigation";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";
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
  /** `dedicated` — white copy on dark glass login card. */
  variant?: "default" | "dedicated";
};

export function PasskeyLoginForm({
  returnTo = DEFAULT_POST_LOGIN_PATH,
  variant = "default",
}: Props) {
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

  const isDedicated = variant === "dedicated";
  const hintClass = isDedicated
    ? LOGIN_DEDICATED_MUTED_TEXT_CLASS
    : "text-muted-foreground";
  const linkClass = isDedicated
    ? "font-medium text-white underline underline-offset-2 hover:text-white/90"
    : "font-medium text-primary underline";

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
      <p className={cn("m-0 text-sm", hintClass)}>{t("loginHint")}</p>
      {errorMessage ? (
        <p
          className={cn(
            "m-0 text-sm",
            isDedicated ? "text-red-300" : "text-destructive",
          )}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      <Button
        type="button"
        variant={isDedicated ? "landingSubmit" : "default"}
        disabled={mutation.isPending}
        className={cn("w-full", isDedicated && "h-12 rounded-2xl font-semibold")}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? tCommon("sending") : t("loginSubmit")}
      </Button>
      <p className={cn("m-0 text-center text-sm", hintClass)}>
        {t("noAccount")}{" "}
        <Link href={registerHref} className={linkClass}>
          {t("registerLink")}
        </Link>
      </p>
    </div>
  );
}
