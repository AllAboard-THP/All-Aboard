"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import {
  buildRubberduckRedirectUrl,
  fetchRubberduckRedirectUrl,
} from "@/lib/rubberduck-redirect";
import { Link, useRouter } from "@/i18n/navigation";

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
    const t = await loginRes.text();
    throw new Error(loginRes.status === 401 ? "invalid_credentials" : t);
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
    throw new Error(createText || `Erreur ${createRes.status}`);
  }
  return JSON.parse(createText) as CreateResult;
}

export function HelpRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpForm");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("bob@dev.local");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [rubberduckMessage, setRubberduckMessage] = useState<string | null>(
    null,
  );

  const mutation = useMutation({
    mutationFn: loginAndCreate,
    onSuccess: async (data) => {
      setDuplicateId(null);
      setRubberduckMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (data.hints?.rubberduckEligible) {
        const baseUrl = await fetchRubberduckRedirectUrl();
        if (baseUrl) {
          window.location.assign(
            buildRubberduckRedirectUrl(baseUrl, {
              requestId: data.item.id,
              title: title.trim(),
            }),
          );
          return;
        }
        setRubberduckMessage(t("rubberduckHandoff"));
        setTitle("");
        return;
      }
      router.push(`/requests/${data.item.id}`);
    },
    onError: (err: Error & { existingId?: string }) => {
      setRubberduckMessage(null);
      if (err.message === "duplicate" && err.existingId) {
        setDuplicateId(err.existingId);
      } else {
        setDuplicateId(null);
      }
    },
  });

  function submit() {
    setDuplicateId(null);
    setRubberduckMessage(null);
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mutation.mutate({ email, password, title, tags });
  }

  const errorMessage =
    mutation.error && mutation.error.message !== "duplicate"
      ? mutation.error.message === "invalid_credentials"
        ? t("invalidCredentials")
        : mutation.error.message
      : null;

  return (
    <div className="mt-5 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="help-email">{t("email")}</Label>
        <Input
          id="help-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-password">{t("password")}</Label>
        <Input
          id="help-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-title">{t("title")}</Label>
        <Input
          id="help-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-tags">{t("tags")}</Label>
        <Input
          id="help-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={t("tagsPlaceholder")}
        />
      </div>
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {duplicateId ? (
        <p className="m-0 text-sm text-destructive">
          {t("duplicate")}{" "}
          <Link
            href={`/requests/${duplicateId}`}
            className="font-medium text-primary underline"
          >
            {t("viewExisting")}
          </Link>
        </p>
      ) : null}
      {rubberduckMessage ? (
        <p
          className="m-0 text-sm text-primary"
          data-testid="rubberduck-handoff"
        >
          {rubberduckMessage}
        </p>
      ) : null}
      <Button
        type="button"
        disabled={mutation.isPending || !title.trim() || !password}
        onClick={() => submit()}
        className="mt-1 w-full"
      >
        {mutation.isPending ? tCommon("sending") : t("submit")}
      </Button>
    </div>
  );
}
