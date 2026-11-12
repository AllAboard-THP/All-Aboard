"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import { Checkbox } from "@allaboard/ui/components/checkbox";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";

import { useRouter } from "@/i18n/navigation";
import { createDenylistPattern } from "@/lib/admin-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

export function AdminDenylistCreateForm() {
  const router = useRouter();
  const t = useTranslations("admin.denylist");
  const tErrors = useTranslations("errors");
  const [label, setLabel] = useState("");
  const [pattern, setPattern] = useState("");
  const [active, setActive] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createDenylistPattern({
        label: label.trim(),
        pattern: pattern.trim(),
        active,
      }),
    onSuccess: () => {
      setLabel("");
      setPattern("");
      setActive(true);
      setErrorKey(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  const canSubmit = label.trim().length > 0 && pattern.trim().length > 0;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || mutation.isPending) return;
        mutation.mutate();
      }}
      data-testid="admin-denylist-create-form"
    >
      {errorKey ? (
        <Alert variant="destructive" data-testid="admin-denylist-create-error">
          <AlertTitle>{t("createErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="denylist-label">{t("labelField")}</Label>
          <Input
            id="denylist-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="denylist-pattern">{t("patternField")}</Label>
          <Input
            id="denylist-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            disabled={mutation.isPending}
            className="font-mono text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="denylist-active"
          checked={active}
          onCheckedChange={(checked) => setActive(checked === true)}
          disabled={mutation.isPending}
        />
        <Label htmlFor="denylist-active">{t("activeField")}</Label>
      </div>
      <div>
        <Button
          type="submit"
          disabled={!canSubmit || mutation.isPending}
          data-testid="admin-denylist-submit"
        >
          {mutation.isPending ? t("submitPending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
