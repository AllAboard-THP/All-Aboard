"use client";

import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Checkbox } from "../components/checkbox";
import { Input } from "../components/input";
import { Label } from "../components/label";
import type { LegacyLabels } from "../i18n/legacy-labels";
import { cn } from "../lib/utils";
import { LandingAuthHeroLayout } from "./landing-auth-hero-layout";
import {
  LANDING_GLASS_INPUT_CLASS,
  LANDING_LOGIN_CARD_CLASS,
  LANDING_LOGIN_CARD_LAYOUT_CLASS,
  LANDING_LOGIN_CARD_WIDTH_CLASS,
} from "./landing-layout";
import { legacyDemoToast } from "./legacy-story-feedback";

type LandingHeroBodyProps = {
  labels: LegacyLabels;
  onForgotPasswordClick?: () => void;
};

/**
 * Landing body — hero stage inside `LandingPageShell` main:
 * copy column (left) + square login card (right), vertically centered.
 */
export function LandingHeroBody({
  labels,
  onForgotPasswordClick,
}: LandingHeroBodyProps) {
  const handleForgotPassword =
    onForgotPasswordClick ??
    (() => legacyDemoToast(labels.auth.forgotPassword));

  return (
    <LandingAuthHeroLayout labels={labels}>
      <Card
        className={cn(
          LANDING_LOGIN_CARD_LAYOUT_CLASS,
          LANDING_LOGIN_CARD_WIDTH_CLASS,
          LANDING_LOGIN_CARD_CLASS,
        )}
      >
        <CardHeader className="shrink-0 space-y-1 px-0 pb-0 text-center sm:text-left">
          <CardTitle className="text-2xl sm:text-3xl">
            {labels.auth.loginTitle}
          </CardTitle>
          <p className="text-muted-foreground">{labels.auth.loginSubtitle}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-0">
          <div className="flex flex-col gap-2">
            <Label htmlFor="legacy-email">{labels.auth.email}</Label>
            <Input
              id="legacy-email"
              type="email"
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="legacy-password">{labels.auth.password}</Label>
            <Input
              id="legacy-password"
              type="password"
              className={LANDING_GLASS_INPUT_CLASS}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox id="legacy-remember" />
              <Label htmlFor="legacy-remember" className="text-sm">
                {labels.auth.rememberMe}
              </Label>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs text-primary hover:underline sm:text-sm"
              onClick={handleForgotPassword}
            >
              {labels.auth.forgotPassword}
            </button>
          </div>
        </CardContent>
        <CardFooter className="shrink-0 flex-col gap-3 px-0 pt-0">
          <Button
            className="h-12 w-full rounded-2xl"
            onClick={() => legacyDemoToast(labels.auth.submit)}
          >
            {labels.auth.submit}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {labels.auth.noAccount}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => legacyDemoToast(labels.auth.signUp)}
            >
              {labels.auth.signUp}
            </button>
          </p>
        </CardFooter>
      </Card>
    </LandingAuthHeroLayout>
  );
}
