"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AuthMeResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";
import { Link } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import { createSubjectRequest } from "@/lib/subject-request-client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

export function SubjectRequestModal({ open, onOpenChange, returnTo }: Props) {
  const titleId = useId();
  const t = useTranslations("subjectRequests");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    enabled: open,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: createSubjectRequest,
    onSuccess: () => {
      setPhase("success");
    },
  });
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!open) {
      setPhase("form");
      setName("");
      setDescription("");
      resetMutation();
    }
  }, [open, resetMutation]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const trimmedName = name.trim();
  const canSubmit =
    trimmedName.length >= 2 &&
    description.length <= 500 &&
    !mutation.isPending &&
    !authQuery.isPending &&
    Boolean(authQuery.data);

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      data-testid="subject-request-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label={t("closeOverlay")}
        onClick={() => onOpenChange(false)}
      />

      <Card className="relative z-10 w-full max-w-lg border-primary/20 shadow-2xl">
        {phase === "success" ? (
          <>
            <CardHeader className="items-center text-center">
              <div
                className="mb-2 flex size-16 items-center justify-center rounded-full bg-green-500/20 text-2xl text-green-500"
                aria-hidden
              >
                ✓
              </div>
              <CardTitle id={titleId} className="text-xl">
                {t("successTitle")}
              </CardTitle>
              <CardDescription>{t("successDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="w-full"
                onClick={() => onOpenChange(false)}
                data-testid="subject-request-success-close"
              >
                {t("close")}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle id={titleId} className="text-xl">
                    {t("modalTitle")}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t("modalSubtitle")}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 px-2"
                  aria-label={t("close")}
                  onClick={() => onOpenChange(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!authQuery.isPending && !authQuery.data ? (
                <Alert data-testid="subject-request-login-required">
                  <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
                  <AlertDescription>
                    {t.rich("loginRequiredDescription", {
                      link: () => (
                        <Link href={loginHref} className="text-primary underline">
                          {t("loginRequiredLink")}
                        </Link>
                      ),
                    })}
                  </AlertDescription>
                </Alert>
              ) : (
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!canSubmit) return;
                    mutation.mutate({
                      name: trimmedName,
                      ...(description.trim()
                        ? { description: description.trim() }
                        : {}),
                    });
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="subject-request-name">{t("nameLabel")}</Label>
                    <Input
                      id="subject-request-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t("namePlaceholder")}
                      maxLength={60}
                      autoComplete="off"
                      data-testid="subject-request-name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="subject-request-description">
                      {t("descriptionLabel")}
                    </Label>
                    <Textarea
                      id="subject-request-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder={t("descriptionPlaceholder")}
                      rows={3}
                      maxLength={500}
                      className="resize-none"
                      data-testid="subject-request-description"
                    />
                  </div>

                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm text-muted-foreground">
                      {t("infoMessage")}
                    </AlertDescription>
                  </Alert>

                  {errorMessage ? (
                    <p className="m-0 text-sm text-destructive" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!canSubmit}
                      data-testid="subject-request-submit"
                    >
                      {mutation.isPending ? tCommon("sending") : t("submit")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
