"use client";

import type { Mission, MissionKind, Skill } from "@allaboard/types";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";

import { useRouter } from "@/i18n/navigation";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";
import { createMission, updateMission } from "@/lib/mission-client";
import { MISSION_KINDS } from "@/lib/missions-search-params";

const SELECT_CLASS =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none";

export const GITHUB_REPO_RE =
  /^https:\/\/github\.com\/[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}\/?$/;

type Props = {
  skills: Skill[];
  /** Edit mode when set. */
  initial?: Mission;
};

/** `2026-11-24T00:00:00.000Z` → `2026-11-24` for a date input. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

/** Date input → ISO at midnight UTC, or null when empty. */
function fromDateInput(value: string): string | null {
  return value ? `${value}T00:00:00.000Z` : null;
}

export function MissionForm({ skills, initial }: Props) {
  const t = useTranslations("missions.form");
  const tMissions = useTranslations("missions");
  const tErrors = useTranslations("errors");
  const router = useRouter();

  const [kind, setKind] = useState<MissionKind>(initial?.kind ?? "personal_project");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [githubRepoUrl, setGithubRepoUrl] = useState(initial?.githubRepoUrl ?? "");
  const [compensation, setCompensation] = useState(initial?.compensation ?? "");
  const [places, setPlaces] = useState(String(initial?.places ?? 1));
  const [startsAt, setStartsAt] = useState(toDateInput(initial?.startsAt));
  const [endsAt, setEndsAt] = useState(toDateInput(initial?.endsAt));
  const [skillIds, setSkillIds] = useState<string[]>(
    initial?.skills.map((skill) => skill.id) ?? [],
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        kind,
        title: title.trim(),
        description: description.trim(),
        githubRepoUrl: githubRepoUrl.trim() || null,
        compensation: compensation.trim() || null,
        places: Number(places),
        startsAt: fromDateInput(startsAt),
        endsAt: fromDateInput(endsAt),
        skillIds,
      };
      return initial ? updateMission(initial.id, body) : createMission(body);
    },
    onSuccess: (data) => {
      router.push(`/missions/${data.item.id}`);
      router.refresh();
    },
  });

  function submit() {
    setLocalError(null);
    if (title.trim().length < 3) return setLocalError(t("titleTooShort"));
    if (description.trim().length < 10) return setLocalError(t("descriptionTooShort"));
    if (githubRepoUrl.trim() && !GITHUB_REPO_RE.test(githubRepoUrl.trim())) {
      return setLocalError(t("repoInvalid"));
    }
    const count = Number(places);
    if (!Number.isInteger(count) || count < 1 || count > 500) {
      return setLocalError(t("placesInvalid"));
    }
    if (startsAt && endsAt && endsAt < startsAt) return setLocalError(t("datesInvalid"));
    mutation.mutate();
  }

  function toggleSkill(id: string) {
    setSkillIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id].slice(0, 10),
    );
  }

  const apiError =
    mutation.error instanceof ApiRequestError ?
      tErrors(mapApiError({ status: mutation.error.status, body: { error: mutation.error.code } }))
    : mutation.error ? tErrors("unknown")
    : null;
  const error = localError ?? apiError;

  return (
    <form
      className="flex flex-col gap-5"
      data-testid="mission-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="mission-kind">{t("kind")}</Label>
        <select
          id="mission-kind"
          className={SELECT_CLASS}
          value={kind}
          onChange={(event) => setKind(event.target.value as MissionKind)}
        >
          {MISSION_KINDS.map((value) => (
            <option key={value} value={value}>
              {tMissions(`kind.${value}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mission-title">{t("title")}</Label>
        <Input
          id="mission-title"
          value={title}
          maxLength={160}
          onChange={(event) => setTitle(event.target.value)}
        />
        <p className="m-0 text-xs text-muted-foreground">{t("titleHint")}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mission-description">{t("description")}</Label>
        <Textarea
          id="mission-description"
          rows={8}
          value={description}
          maxLength={10000}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="mission-places">{t("places")}</Label>
          <Input
            id="mission-places"
            type="number"
            min={1}
            max={500}
            value={places}
            onChange={(event) => setPlaces(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mission-compensation">{t("compensation")}</Label>
          <Input
            id="mission-compensation"
            value={compensation}
            maxLength={200}
            placeholder={t("compensationPlaceholder")}
            onChange={(event) => setCompensation(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="mission-starts">{t("startsAt")}</Label>
          <Input
            id="mission-starts"
            type="date"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mission-ends">{t("endsAt")}</Label>
          <Input
            id="mission-ends"
            type="date"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mission-repo">{t("repo")}</Label>
        <Input
          id="mission-repo"
          type="url"
          value={githubRepoUrl}
          placeholder="https://github.com/owner/repo"
          onChange={(event) => setGithubRepoUrl(event.target.value)}
        />
      </div>

      {skills.length > 0 ?
        <fieldset className="m-0 grid gap-2 border-0 p-0">
          <legend className="mb-2 text-sm font-medium">{t("skills")}</legend>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const selected = skillIds.includes(skill.id);
              return (
                <Button
                  key={skill.id}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  onClick={() => toggleSkill(skill.id)}
                >
                  {skill.label}
                </Button>
              );
            })}
          </div>
        </fieldset>
      : null}

      {error ?
        <Alert variant="destructive" data-testid="mission-form-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {initial ? t("save") : t("publish")}
        </Button>
      </div>
    </form>
  );
}
