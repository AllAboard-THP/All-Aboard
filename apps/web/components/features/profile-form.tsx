"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AuthMeResponse, Subject, UpdateUserMeBody } from "@allaboard/types";
import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";

import { PasskeyManager } from "@/components/features/passkey-manager";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  initialProfile: AuthMeResponse;
  subjects: Subject[];
  locale: AppLocale;
};

async function patchProfile(body: UpdateUserMeBody) {
  const res = await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as { item: AuthMeResponse };
}

export function ProfileForm({ initialProfile, subjects, locale }: Props) {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");

  const [fullName, setFullName] = useState(initialProfile.fullName ?? "");
  const [headline, setHeadline] = useState(initialProfile.headline ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "");
  const [educationLevel, setEducationLevel] = useState(
    initialProfile.educationLevel ?? "",
  );
  const [notifyOnComment, setNotifyOnComment] = useState(
    initialProfile.notifyOnComment ?? true,
  );
  const [notifyOnMessage, setNotifyOnMessage] = useState(
    initialProfile.notifyOnMessage ?? true,
  );
  const [subjectIds, setSubjectIds] = useState<string[]>(
    initialProfile.competenceSubjects?.map((s) => s.id) ?? [],
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const isMentor = initialProfile.role === "mentor";

  const mutation = useMutation({
    mutationFn: patchProfile,
    onSuccess: () => {
      setSavedMessage(t("saved"));
    },
    onError: () => {
      setSavedMessage(null);
    },
  });

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : null;

  function toggleSubject(subjectId: string) {
    setSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSavedMessage(null);
    mutation.mutate({
      fullName: fullName.trim(),
      headline: headline.trim() || null,
      bio: bio.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      educationLevel: educationLevel.trim() || null,
      notifyOnComment,
      notifyOnMessage,
      ...(isMentor ? { subjectIds } : {}),
    });
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-5"
        onSubmit={submit}
        data-testid="profile-form"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="profile-full-name">{t("fullName")}</Label>
            <Input
              id="profile-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-education">{t("educationLevel")}</Label>
            <Input
              id="profile-education"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-headline">{t("headline")}</Label>
          <Input
            id="profile-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-bio">{t("bio")}</Label>
          <Textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-avatar">{t("avatarUrl")}</Label>
          <Input
            id="profile-avatar"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://"
          />
        </div>

        {isMentor && subjects.length > 0 ? (
          <fieldset className="grid gap-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium">{t("competences")}</legend>
            <p className="m-0 text-xs text-muted-foreground">
              {t("competencesHint")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const checked = subjectIds.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubject(subject.id)}
                      className="size-4 rounded border-input"
                    />
                    <span>{subject.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <fieldset className="grid gap-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">{t("notifications")}</legend>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyOnMessage}
              onChange={(e) => setNotifyOnMessage(e.target.checked)}
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>{t("notifyOnMessage")}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyOnComment}
              onChange={(e) => setNotifyOnComment(e.target.checked)}
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>{t("notifyOnComment")}</span>
          </label>
        </fieldset>

        {errorMessage ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {savedMessage ? (
          <p className="m-0 text-sm text-primary" role="status">
            {savedMessage}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending || !fullName.trim()}>
          {mutation.isPending ? tCommon("updating") : t("save")}
        </Button>
      </form>

      <PasskeyManager locale={locale} />
    </div>
  );
}
