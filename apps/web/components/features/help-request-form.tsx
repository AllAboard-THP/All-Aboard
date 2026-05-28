"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";

import { Link, useRouter } from "@/i18n/navigation";
import { mapApiErrorToKey } from "@/lib/map-api-error";

type CreateResult = {
  item: { id: string };
  hints?: { rubberduckEligible?: boolean };
};

type DuplicateError = {
  existingId?: string;
};

async function loginAndCreate(input: {
  email: string;
  password: string;
  title: string;
  tags: string[];
}): Promise<CreateResult> {
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(
      loginRes.status === 401 ? "invalid_credentials" : text || "generic",
    );
  }

  const createRes = await fetch("/api/help-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: input.title,
      ...(input.tags.length ? { tags: input.tags } : {}),
    }),
  });
  const createText = await createRes.text();

  if (createRes.status === 409) {
    const dup = JSON.parse(createText) as DuplicateError;
    const err = new Error("duplicate") as Error & { existingId?: string };
    err.existingId = dup.existingId;
    throw err;
  }
  if (!createRes.ok) {
    throw new Error(createText || "generic");
  }
  return JSON.parse(createText) as CreateResult;
}

export function HelpRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpRequest");
  const tErrors = useTranslations("errors");
  const [email, setEmail] = useState("bob@dev.local");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [rubberduckHint, setRubberduckHint] = useState(false);

  const mutation = useMutation({
    mutationFn: loginAndCreate,
    onSuccess: async (data) => {
      setDuplicateId(null);
      setRubberduckHint(Boolean(data.hints?.rubberduckEligible));
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (data.hints?.rubberduckEligible) {
        setTitle("");
        return;
      }
      router.push(`/requests/${data.item.id}`);
    },
    onError: (err: Error & { existingId?: string }) => {
      setRubberduckHint(false);
      if (err.message === "duplicate" && err.existingId) {
        setDuplicateId(err.existingId);
      } else {
        setDuplicateId(null);
      }
    },
  });

  function submit() {
    setDuplicateId(null);
    setRubberduckHint(false);
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mutation.mutate({ email, password, title, tags });
  }

  const errorKey =
    mutation.error && mutation.error.message !== "duplicate"
      ? mapApiErrorToKey(mutation.error.message)
      : null;

  return (
    <div className="mt-5 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="help-email">{t("emailLabel")}</Label>
        <Input
          id="help-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-password">{t("passwordLabel")}</Label>
        <Input
          id="help-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-title">{t("titleLabel")}</Label>
        <Input
          id="help-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-tags">{t("tagsLabel")}</Label>
        <Input
          id="help-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={t("tagsPlaceholder")}
        />
      </div>
      {errorKey ? (
        <p className="m-0 text-sm text-destructive">{tErrors(errorKey)}</p>
      ) : null}
      {duplicateId ? (
        <p className="m-0 text-sm text-destructive">
          {t("duplicateMessage")}{" "}
          <Link
            href={`/requests/${duplicateId}`}
            className="font-medium text-primary underline"
          >
            {t("viewExisting")}
          </Link>
        </p>
      ) : null}
      {rubberduckHint ? (
        <p className="m-0 text-sm text-primary">{t("rubberduckHint")}</p>
      ) : null}
      <Button
        type="button"
        disabled={mutation.isPending || !title.trim() || !password}
        onClick={() => submit()}
        className="mt-1 w-full"
      >
        {mutation.isPending ? t("submitPending") : t("submit")}
      </Button>
    </div>
  );
}
