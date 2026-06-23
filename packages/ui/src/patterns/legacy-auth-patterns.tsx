"use client";

import { useEffect, useState } from "react";
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
  APP_GLASS_CARD_CLASS,
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
import {
  ProfileAvatarUploadField,
  type ProfileAvatarUploadLabels,
} from "./profile-avatar-upload";

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

export type { ProfileAvatarUploadLabels };

export type OAuthOnboardingSubmitInput = {
  fullName: string;
  educationLevel?: string;
  headline?: string;
  acceptCgu: boolean;
};

export type OAuthOnboardingFormVariant = "onboarding" | "profile";

export function OAuthOnboardingForm({
  labels = legacyLabelsFr,
  className,
  variant = "onboarding",
  title,
  subtitle,
  submitLabel,
  showCgu = true,
  fieldIdPrefix = "onboarding",
  initialFullName = "",
  initialEducationLevel = "",
  initialHeadline = "",
  avatarUrl,
  avatarLabels,
  avatarDisplayName,
  avatarInitials,
  avatarUploading = false,
  onAvatarUpload,
  onAvatarRemove,
  submitting = false,
  errorMessage,
  onSubmit,
  onCguClick,
}: {
  labels?: LegacyLabels;
  className?: string;
  /** `onboarding` = post OAuth sign-up; `profile` = editable from /profile. */
  variant?: OAuthOnboardingFormVariant;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  showCgu?: boolean;
  fieldIdPrefix?: string;
  initialFullName?: string;
  initialEducationLevel?: string;
  initialHeadline?: string;
  /** Profile variant — file upload with crop (saved immediately). */
  avatarUrl?: string;
  avatarLabels?: ProfileAvatarUploadLabels;
  avatarDisplayName?: string;
  avatarInitials?: string;
  avatarUploading?: boolean;
  onAvatarUpload?: (file: Blob) => void | Promise<void>;
  onAvatarRemove?: () => void | Promise<void>;
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

  useEffect(() => {
    setFullName(initialFullName);
  }, [initialFullName]);

  useEffect(() => {
    setEducationLevel(initialEducationLevel);
  }, [initialEducationLevel]);

  useEffect(() => {
    setHeadline(initialHeadline);
  }, [initialHeadline]);

  const showAvatarField =
    variant === "profile" &&
    avatarLabels != null &&
    onAvatarUpload != null;

  const resolvedTitle =
    title ??
    (variant === "profile"
      ? labels.auth.profileCompleteTitle
      : labels.auth.onboardingTitle);
  const resolvedSubtitle =
    subtitle ??
    (variant === "profile"
      ? labels.auth.profileCompleteSubtitle
      : labels.auth.onboardingSubtitle);
  const resolvedSubmit =
    submitLabel ??
    (variant === "profile"
      ? labels.auth.profileCompleteSubmit
      : labels.auth.onboardingSubmit);
  const cguRequired = showCgu;
  const canSubmit =
    Boolean(fullName.trim()) && (!cguRequired || acceptCgu);

  return (
    <Card
      className={cn(
        variant === "profile"
          ? cn(APP_GLASS_CARD_CLASS, "w-full rounded-2xl p-6")
          : cn(
              LANDING_LOGIN_CARD_LAYOUT_CLASS,
              LANDING_AUTH_CARD_WIDTH_CLASS,
              LANDING_LOGIN_CARD_CLASS,
            ),
        className,
      )}
    >
      <CardHeader
        className={cn(
          "shrink-0 px-0 pb-0",
          variant === "profile" ? "text-left" : "text-center",
        )}
      >
        <CardTitle className="text-2xl sm:text-3xl">{resolvedTitle}</CardTitle>
        <p className="text-muted-foreground">{resolvedSubtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0">
        {showAvatarField ? (
          <ProfileAvatarUploadField
            labels={avatarLabels}
            avatarUrl={avatarUrl}
            initials={avatarInitials ?? "?"}
            displayName={avatarDisplayName ?? (fullName.trim() || "Profile")}
            uploading={avatarUploading}
            onUpload={onAvatarUpload}
            onRemove={onAvatarRemove}
            disabled={submitting}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={`${fieldIdPrefix}-full-name`}>
              {labels.auth.fullName}
            </Label>
            <Input
              id={`${fieldIdPrefix}-full-name`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${fieldIdPrefix}-level`}>
              {labels.auth.educationLevel}
            </Label>
            <Input
              id={`${fieldIdPrefix}-level`}
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              placeholder={labels.auth.educationLevelPlaceholder}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${fieldIdPrefix}-headline`}>
              {labels.auth.headline}
            </Label>
            <Input
              id={`${fieldIdPrefix}-headline`}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={labels.auth.headlinePlaceholder}
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
        </div>
        {cguRequired ? (
          <div className="flex items-start gap-2.5">
            <Checkbox
              id={`${fieldIdPrefix}-cgu`}
              checked={acceptCgu}
              onCheckedChange={(checked) => setAcceptCgu(checked === true)}
              className="mt-0.5 shrink-0 border-white/30 bg-white/5"
            />
            <label
              htmlFor={`${fieldIdPrefix}-cgu`}
              className="cursor-pointer text-sm leading-snug"
            >
              <span className="text-muted-foreground">
                {labels.auth.acceptCguPrefix}{" "}
              </span>
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
        ) : null}
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </CardContent>
      <CardFooter className="shrink-0 flex-col gap-3 px-0 pt-0">
        <Button
          variant={variant === "profile" ? "default" : "landingSubmit"}
          className={
            variant === "profile"
              ? "w-full"
              : LANDING_AUTH_SUBMIT_BUTTON_CLASS
          }
          disabled={submitting || !canSubmit}
          onClick={() =>
            void onSubmit({
              fullName: fullName.trim(),
              educationLevel: educationLevel.trim() || undefined,
              headline: headline.trim() || undefined,
              acceptCgu: cguRequired ? acceptCgu : true,
            })
          }
        >
          {resolvedSubmit}
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
