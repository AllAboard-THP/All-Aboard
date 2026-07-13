"use client";

import { useState, type ReactNode } from "react";

import { Button } from "../components/button";
import { GoogleSignInButton } from "../components/google-sign-in-button";
import { Separator } from "../components/separator";
import { Checkbox } from "../components/checkbox";
import { Input } from "../components/input";
import { Label } from "../components/label";
import type { LegacyLabels } from "../i18n/legacy-labels";
import { cn } from "../lib/utils";
import {
  AUTH_LANDING_LABEL_INSET_CLASS,
  LOGIN_DEDICATED_CARD_CLASS,
  LOGIN_DEDICATED_CARD_LAYOUT_CLASS,
  LOGIN_DEDICATED_CARD_SLOT_CLASS,
  LOGIN_DEDICATED_INPUT_CLASS,
  LOGIN_DEDICATED_MUTED_TEXT_CLASS,
  LOGIN_DEDICATED_TEXT_CLASS,
  LANDING_AUTH_SUBMIT_BUTTON_CLASS,
} from "./landing-layout";
import { legacyDemoToast } from "./legacy-story-feedback";

export type LoginDedicatedSubmitInput = {
  email: string;
  password: string;
};

type LoginDedicatedBodyProps = {
  labels: LegacyLabels;
  onForgotPasswordClick?: () => void;
  onSignUpClick?: () => void;
  onGoogleSignInClick?: () => void;
  onSubmit?: (input: LoginDedicatedSubmitInput) => void | Promise<void>;
  submitting?: boolean;
  errorMessage?: string | null;
  className?: string;
  title?: string;
  subtitle?: string;
  /** Replaces the default email/password form (e.g. passkey flow in apps/web). */
  children?: ReactNode;
};

/**
 * Dedicated login card — centered glass panel, white copy, lighter inputs.
 * Used on `/login` (full-viewport hero) — not embedded in the marketing landing.
 */
export function LoginDedicatedBody({
  labels,
  onForgotPasswordClick,
  onSignUpClick,
  onGoogleSignInClick,
  onSubmit,
  submitting = false,
  errorMessage,
  className,
  title,
  subtitle,
  children,
}: LoginDedicatedBodyProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleForgotPassword =
    onForgotPasswordClick ??
    (() => legacyDemoToast(labels.auth.forgotPassword));
  const handleSignUp =
    onSignUpClick ?? (() => legacyDemoToast(labels.auth.signUp));
  const handleGoogleSignIn =
    onGoogleSignInClick ??
    (() => legacyDemoToast(labels.auth.continueWithGoogle));
  const handleSubmit =
    onSubmit ??
    (() => {
      legacyDemoToast(labels.auth.submit);
    });

  return (
    <div className={cn(LOGIN_DEDICATED_CARD_SLOT_CLASS, className)}>
      <div
        className={cn(
          LOGIN_DEDICATED_CARD_LAYOUT_CLASS,
          LOGIN_DEDICATED_CARD_CLASS,
        )}
        data-testid="login-page-card"
      >
        <header className="flex flex-col gap-2 text-center">
          <h1
            className={cn(
              "m-0 text-2xl leading-none font-semibold sm:text-3xl",
              LOGIN_DEDICATED_TEXT_CLASS,
            )}
          >
            {title ?? labels.auth.loginTitle}
          </h1>
          {(subtitle ?? labels.auth.loginSubtitle) ? (
            <p className={cn("m-0 text-sm", LOGIN_DEDICATED_MUTED_TEXT_CLASS)}>
              {subtitle ?? labels.auth.loginSubtitle}
            </p>
          ) : null}
        </header>

        {children ?? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="login-dedicated-email"
                className={cn(AUTH_LANDING_LABEL_INSET_CLASS, LOGIN_DEDICATED_TEXT_CLASS)}
              >
                {labels.auth.email}
              </Label>
              <Input
                id="login-dedicated-email"
                type="email"
                autoComplete="email"
                className={LOGIN_DEDICATED_INPUT_CLASS}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="login-dedicated-password"
                className={cn(AUTH_LANDING_LABEL_INSET_CLASS, LOGIN_DEDICATED_TEXT_CLASS)}
              >
                {labels.auth.password}
              </Label>
              <Input
                id="login-dedicated-password"
                type="password"
                autoComplete="current-password"
                className={LOGIN_DEDICATED_INPUT_CLASS}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox id="login-dedicated-remember" />
                <Label
                  htmlFor="login-dedicated-remember"
                  className={cn("text-sm", LOGIN_DEDICATED_TEXT_CLASS)}
                >
                  {labels.auth.rememberMe}
                </Label>
              </div>
              <button
                type="button"
                className={cn(
                  "shrink-0 text-xs hover:underline sm:text-sm",
                  LOGIN_DEDICATED_MUTED_TEXT_CLASS,
                )}
                onClick={handleForgotPassword}
              >
                {labels.auth.forgotPassword}
              </button>
            </div>

            {errorMessage ? (
              <p className="m-0 text-center text-sm text-red-300" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="button"
              variant="landingSubmit"
              className={LANDING_AUTH_SUBMIT_BUTTON_CLASS}
              disabled={submitting}
              onClick={() => void handleSubmit({ email, password })}
            >
              {labels.auth.submit}
            </Button>

            <div className="flex w-full items-center gap-3">
              <Separator className="flex-1 opacity-30" />
              <span className={cn("text-xs", LOGIN_DEDICATED_MUTED_TEXT_CLASS)}>
                {labels.auth.orContinueWithEmail}
              </span>
              <Separator className="flex-1 opacity-30" />
            </div>

            <GoogleSignInButton
              label={labels.auth.continueWithGoogle}
              onClick={handleGoogleSignIn}
            />

            <p className={cn("m-0 text-center text-sm", LOGIN_DEDICATED_MUTED_TEXT_CLASS)}>
              {labels.auth.noAccount}{" "}
              <button
                type="button"
                className="font-medium text-white underline underline-offset-2 hover:text-white/90"
                onClick={handleSignUp}
              >
                {labels.auth.signUp}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
