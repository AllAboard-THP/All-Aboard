"use client";

import { Button } from "../components/button";
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
  BrandLogo,
  Eyebrow,
} from "./legacy-ui";

export function RegisterForm({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "hero-panel glass rounded-[2rem] border-white/10 p-8 shadow-none md:p-10",
        className,
      )}
    >
      <CardHeader className="px-0 pb-0">
        <CardTitle className="text-3xl">{labels.auth.registerTitle}</CardTitle>
        <p className="text-muted-foreground">{labels.auth.registerSubtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-full-name">{labels.auth.fullName}</Label>
            <Input
              id="register-full-name"
              className="rounded-xl border-white/10 bg-white/5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-level">{labels.auth.educationLevel}</Label>
            <Input
              id="register-level"
              placeholder={labels.auth.educationLevelPlaceholder}
              className="rounded-xl border-white/10 bg-white/5"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-headline">{labels.auth.headline}</Label>
          <Input
            id="register-headline"
            placeholder={labels.auth.headlinePlaceholder}
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email">{labels.auth.email}</Label>
          <Input
            id="register-email"
            type="email"
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">{labels.auth.password}</Label>
            <Input
              id="register-password"
              type="password"
              className="rounded-xl border-white/10 bg-white/5"
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
              className="rounded-xl border-white/10 bg-white/5"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 px-0">
        <Button className="w-full rounded-xl">{labels.auth.registerSubmit}</Button>
        <p className="text-center text-sm text-muted-foreground">
          {labels.auth.hasAccount}{" "}
          <button type="button" className="text-primary hover:underline">
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
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "hero-panel glass w-full rounded-[2rem] border-white/10 p-8 shadow-none md:p-10",
        className,
      )}
    >
      <CardHeader className="px-0 pb-0">
        <CardTitle className="text-3xl">{labels.auth.forgotTitle}</CardTitle>
        <p className="text-muted-foreground">{labels.auth.forgotSubtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-0 pt-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">{labels.auth.email}</Label>
          <Input
            id="forgot-email"
            type="email"
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 px-0">
        <Button className="w-full rounded-xl">{labels.auth.forgotSubmit}</Button>
        <p className="text-center text-sm text-muted-foreground">
          <button type="button" className="text-primary hover:underline">
            {labels.auth.signIn}
          </button>
        </p>
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
