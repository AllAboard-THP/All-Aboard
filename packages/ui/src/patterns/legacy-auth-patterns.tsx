"use client";

import { useState } from "react";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { LegalCguButton } from "../components/legal-cgu-button";
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
  LANDING_AUTH_CARD_WIDTH_CLASS,
  LANDING_AUTH_SUBMIT_BUTTON_CLASS,
  LANDING_GLASS_INPUT_CLASS,
  LANDING_LOGIN_CARD_CLASS,
  LANDING_LOGIN_CARD_LAYOUT_CLASS,
  REGISTER_LANDING_CARD_LAYOUT_CLASS,
  REGISTER_LANDING_CARD_WIDTH_CLASS,
  REGISTER_LANDING_INPUT_CLASS,
  REGISTER_LANDING_SUBMIT_BUTTON_CLASS,
  AUTH_LANDING_LABEL_INSET_CLASS,
} from "./landing-layout";
import {
  BrandLogo,
  Eyebrow,
} from "./legacy-ui";
import { legacyDemoToast } from "./legacy-story-feedback";

export function RegisterForm({
  labels = legacyLabelsFr,
  className,
  variant = "default",
}: {
  labels?: LegacyLabels;
  className?: string;
  /** Landing hero — glass card aligned with `LandingLoginScreen`. */
  variant?: "default" | "landing";
}) {
  const isLanding = variant === "landing";

  return (
    <Card
      className={cn(
        isLanding
          ? cn(
              LANDING_LOGIN_CARD_LAYOUT_CLASS,
              LANDING_AUTH_CARD_WIDTH_CLASS,
              LANDING_LOGIN_CARD_CLASS,
              "max-h-[min(90dvh,calc(100dvh-8rem))] overflow-y-auto",
            )
          : "rounded-[2rem] p-8 md:p-10",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "px-0 pb-0",
          isLanding && "shrink-0 space-y-1 text-center sm:text-left",
        )}
      >
        <CardTitle className={isLanding ? "text-2xl sm:text-3xl" : "text-3xl"}>
          {labels.auth.registerTitle}
        </CardTitle>
        <p className="text-muted-foreground">{labels.auth.registerSubtitle}</p>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-col gap-5 px-0",
          isLanding ? undefined : "pt-6",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-full-name">{labels.auth.fullName}</Label>
            <Input
              id="register-full-name"
              className={
                isLanding
                  ? LANDING_GLASS_INPUT_CLASS
                  : "rounded-xl border-white/10 bg-white/5"
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-level">{labels.auth.educationLevel}</Label>
            <Input
              id="register-level"
              placeholder={labels.auth.educationLevelPlaceholder}
              className={
                isLanding
                  ? LANDING_GLASS_INPUT_CLASS
                  : "rounded-xl border-white/10 bg-white/5"
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-headline">{labels.auth.headline}</Label>
          <Input
            id="register-headline"
            placeholder={labels.auth.headlinePlaceholder}
            className={
              isLanding
                ? LANDING_GLASS_INPUT_CLASS
                : "rounded-xl border-white/10 bg-white/5"
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email">{labels.auth.email}</Label>
          <Input
            id="register-email"
            type="email"
            className={
              isLanding
                ? LANDING_GLASS_INPUT_CLASS
                : "rounded-xl border-white/10 bg-white/5"
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">{labels.auth.password}</Label>
            <Input
              id="register-password"
              type="password"
              className={
                isLanding
                  ? LANDING_GLASS_INPUT_CLASS
                  : "rounded-xl border-white/10 bg-white/5"
              }
            />
            <p className="text-xs text-muted-foreground">
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
              className={
                isLanding
                  ? LANDING_GLASS_INPUT_CLASS
                  : "rounded-xl border-white/10 bg-white/5"
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter
        className={cn("flex-col px-0", isLanding ? "shrink-0 gap-3 pt-0" : "gap-4")}
      >
        <Button
          variant={isLanding ? "landingSubmit" : "default"}
          className={isLanding ? LANDING_AUTH_SUBMIT_BUTTON_CLASS : "w-full rounded-xl"}
          onClick={() => legacyDemoToast(labels.auth.registerSubmit)}
        >
          {labels.auth.registerSubmit}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {labels.auth.hasAccount}{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => legacyDemoToast(labels.auth.signIn)}
          >
            {labels.auth.signIn}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}

export function ForgotPasswordForm({
  labels = legacyLabelsFr,
  className,
  variant = "default",
}: {
  labels?: LegacyLabels;
  className?: string;
  /** Landing hero — glass card aligned with `LandingLoginScreen`. */
  variant?: "default" | "landing";
}) {
  const isLanding = variant === "landing";

  return (
    <Card
      className={cn(
        isLanding
          ? cn(
              REGISTER_LANDING_CARD_LAYOUT_CLASS,
              REGISTER_LANDING_CARD_WIDTH_CLASS,
              LANDING_LOGIN_CARD_CLASS,
            )
          : "w-full rounded-[2rem] p-8 md:p-10",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "px-0 pb-0",
          isLanding ? "shrink-0 space-y-1 text-center" : undefined,
        )}
      >
        <CardTitle
          className={cn(
            isLanding ? "text-xl sm:text-2xl" : "text-3xl",
            isLanding && "text-center",
          )}
        >
          {labels.auth.forgotTitle}
        </CardTitle>
        <p
          className={cn(
            "text-muted-foreground",
            isLanding && "text-center text-sm",
          )}
        >
          {labels.auth.forgotSubtitle}
        </p>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-col px-0",
          isLanding ? "gap-3 sm:gap-4" : "gap-5 pt-6",
        )}
      >
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="forgot-email"
            className={isLanding ? AUTH_LANDING_LABEL_INSET_CLASS : undefined}
          >
            {labels.auth.email}
          </Label>
          <Input
            id="forgot-email"
            type="email"
            className={
              isLanding
                ? REGISTER_LANDING_INPUT_CLASS
                : "rounded-xl border-white/10 bg-white/5"
            }
          />
        </div>
        {isLanding ? (
          <Button
            variant="landingSubmit"
            className={REGISTER_LANDING_SUBMIT_BUTTON_CLASS}
            onClick={() => legacyDemoToast(labels.auth.forgotSubmit)}
          >
            {labels.auth.forgotSubmit}
          </Button>
        ) : null}
      </CardContent>
      {!isLanding ? (
        <CardFooter className="flex-col gap-4 px-0">
          <Button
            variant="default"
            className="w-full rounded-xl"
            onClick={() => legacyDemoToast(labels.auth.forgotSubmit)}
          >
            {labels.auth.forgotSubmit}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => legacyDemoToast(labels.auth.signIn)}
            >
              {labels.auth.signIn}
            </button>
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export type OAuthOnboardingSubmitInput = {
  fullName: string;
  educationLevel?: string;
  headline?: string;
  acceptCgu: boolean;
};

export function OAuthOnboardingForm({
  labels = legacyLabelsFr,
  className,
  initialFullName = "",
  initialEducationLevel = "",
  initialHeadline = "",
  submitting = false,
  errorMessage,
  onSubmit,
  onCguClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  initialFullName?: string;
  initialEducationLevel?: string;
  initialHeadline?: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: OAuthOnboardingSubmitInput) => void | Promise<void>;
  onCguClick?: () => void;
}) {
  const handleCguClick =
    onCguClick ??
    (() => {
      window.open("/legal/cgu", "_blank", "noopener,noreferrer");
    });
  const [fullName, setFullName] = useState(initialFullName);
  const [educationLevel, setEducationLevel] = useState(initialEducationLevel);
  const [headline, setHeadline] = useState(initialHeadline);
  const [acceptCgu, setAcceptCgu] = useState(false);

  return (
    <Card
      className={cn(
        LANDING_LOGIN_CARD_LAYOUT_CLASS,
        LANDING_AUTH_CARD_WIDTH_CLASS,
        LANDING_LOGIN_CARD_CLASS,
        className,
      )}
    >
      <CardHeader className="shrink-0 px-0 pb-0 text-center">
        <CardTitle className="text-2xl sm:text-3xl">
          {labels.auth.onboardingTitle}
        </CardTitle>
        <p className="text-muted-foreground">{labels.auth.onboardingSubtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="onboarding-full-name">{labels.auth.fullName}</Label>
            <Input
              id="onboarding-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="onboarding-level">{labels.auth.educationLevel}</Label>
            <Input
              id="onboarding-level"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              placeholder={labels.auth.educationLevelPlaceholder}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="onboarding-headline">{labels.auth.headline}</Label>
            <Input
              id="onboarding-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={labels.auth.headlinePlaceholder}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="onboarding-cgu"
            checked={acceptCgu}
            onCheckedChange={(checked) => setAcceptCgu(checked === true)}
            className="mt-0.5 shrink-0 border-white/30 bg-white/5"
          />
          <label htmlFor="onboarding-cgu" className="cursor-pointer text-sm leading-snug">
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
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </CardContent>
      <CardFooter className="shrink-0 flex-col gap-3 px-0 pt-0">
        <Button
          variant="landingSubmit"
          className={LANDING_AUTH_SUBMIT_BUTTON_CLASS}
          disabled={submitting || !fullName.trim() || !acceptCgu}
          onClick={() =>
            void onSubmit({
              fullName: fullName.trim(),
              educationLevel: educationLevel.trim() || undefined,
              headline: headline.trim() || undefined,
              acceptCgu,
            })
          }
        >
          {labels.auth.onboardingSubmit}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function RegisterHeroPanel({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <BrandLogo labels={labels} />
      <Eyebrow>{labels.auth.registerEyebrow}</Eyebrow>
      <h1 className="text-4xl leading-tight font-extrabold md:text-5xl">
        {labels.auth.registerHeading}
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        {labels.auth.registerDescription}
      </p>
    </div>
  );
}
