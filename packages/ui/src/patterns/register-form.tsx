"use client";

import { useState } from "react";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { GoogleSignInButton } from "../components/google-sign-in-button";
import { LegalCguButton } from "../components/legal-cgu-button";
import { Separator } from "../components/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  LANDING_LOGIN_CARD_CLASS,
  REGISTER_LANDING_CARD_LAYOUT_CLASS,
  REGISTER_LANDING_CARD_WIDTH_CLASS,
  REGISTER_LANDING_CGU_ROW_CLASS,
  REGISTER_LANDING_INPUT_CLASS,
  REGISTER_LANDING_SUBMIT_BUTTON_CLASS,
} from "./landing-layout";
import { legacyDemoToast } from "./legacy-story-feedback";

export function AcceptCguField({
  id,
  checked,
  onCheckedChange,
  labels,
  onCguClick,
  className,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  labels: LegacyLabels;
  onCguClick?: () => void;
  className?: string;
}) {
  const handleCguClick =
    onCguClick ??
    (() => {
      window.open("/legal/cgu", "_blank", "noopener,noreferrer");
    });

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5 shrink-0 border-white/30 bg-white/5"
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
        <span className="text-muted-foreground">{labels.auth.acceptCguPrefix} </span>
        <LegalCguButton
          label={labels.auth.acceptCguTermsLink}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleCguClick();
          }}
          className="inline align-baseline font-normal"
        />
      </label>
    </div>
  );
}

export type RegisterSubmitInput = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptCgu: boolean;
};

export function DedicatedRegisterForm({
  labels = legacyLabelsFr,
  className,
  variant = "default",
  submitting = false,
  errorMessage,
  onSubmit,
  onGoogleSignInClick,
  onCguClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  variant?: "default" | "landing";
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: RegisterSubmitInput) => void | Promise<void>;
  onGoogleSignInClick?: () => void;
  onCguClick?: () => void;
}) {
  const isLanding = variant === "landing";
  const inputClass = isLanding
    ? REGISTER_LANDING_INPUT_CLASS
    : "rounded-xl border-white/10 bg-white/5";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleGoogleSignIn =
    onGoogleSignInClick ??
    (() => legacyDemoToast(labels.auth.continueWithGoogle));

  const passwordsMismatch =
    passwordConfirmation.length > 0 && password !== passwordConfirmation;
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordConfirmation.length > 0 &&
    !passwordsMismatch &&
    acceptCgu &&
    !submitting;

  function handleSubmit() {
    if (!canSubmit) return;
    if (password !== passwordConfirmation) {
      setClientError(labels.auth.registerPasswordMismatch);
      return;
    }
    setClientError(null);
    void onSubmit({
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
      passwordConfirmation,
      acceptCgu,
    });
  }

  const displayedError = clientError ?? errorMessage;

  return (
    <Card
      className={cn(
        isLanding
          ? cn(
              REGISTER_LANDING_CARD_LAYOUT_CLASS,
              REGISTER_LANDING_CARD_WIDTH_CLASS,
              LANDING_LOGIN_CARD_CLASS,
            )
          : "rounded-[2rem] p-8 md:p-10",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "px-0 pb-0",
          isLanding ? "shrink-0 text-center" : undefined,
        )}
      >
        <CardTitle
          className={cn(
            isLanding ? "text-xl sm:text-2xl" : "text-3xl",
            isLanding && "text-center",
          )}
        >
          {labels.auth.registerTitle}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-col px-0",
          isLanding ? "gap-3 sm:gap-4" : "gap-5 pt-6",
        )}
      >
        <GoogleSignInButton
          label={labels.auth.continueWithGoogle}
          onClick={handleGoogleSignIn}
          className={isLanding ? "h-10 rounded-xl" : undefined}
        />
        <div className="flex w-full items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {labels.auth.orContinueWithEmail}
          </span>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-first-name">{labels.auth.firstName}</Label>
            <Input
              id="register-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              autoComplete="given-name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-last-name">{labels.auth.lastName}</Label>
            <Input
              id="register-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email">{labels.auth.email}</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">{labels.auth.password}</Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              aria-describedby={isLanding ? "register-password-hint" : undefined}
            />
            <p
              id="register-password-hint"
              className={cn(
                "text-muted-foreground",
                isLanding ? "text-[11px] leading-tight" : "text-xs",
              )}
            >
              {labels.auth.passwordHint}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password-confirm">
              {labels.auth.passwordConfirmation}
            </Label>
            <Input
              id="register-password-confirm"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
        </div>
        {isLanding ? (
          <>
            <AcceptCguField
              id="register-cgu"
              checked={acceptCgu}
              onCheckedChange={setAcceptCgu}
              labels={labels}
              onCguClick={onCguClick}
              className={REGISTER_LANDING_CGU_ROW_CLASS}
            />
            {displayedError ? (
              <p className="text-sm text-destructive">{displayedError}</p>
            ) : null}
            <Button
              variant="landingSubmit"
              className={REGISTER_LANDING_SUBMIT_BUTTON_CLASS}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {labels.auth.registerSubmit}
            </Button>
          </>
        ) : (
          <>
            <AcceptCguField
              id="register-cgu"
              checked={acceptCgu}
              onCheckedChange={setAcceptCgu}
              labels={labels}
              onCguClick={onCguClick}
            />
            {displayedError ? (
              <p className="text-sm text-destructive">{displayedError}</p>
            ) : null}
          </>
        )}
      </CardContent>
      {!isLanding ? (
        <CardFooter className="flex-col gap-4 px-0">
          <Button
            variant="default"
            className="w-full rounded-xl"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {labels.auth.registerSubmit}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
