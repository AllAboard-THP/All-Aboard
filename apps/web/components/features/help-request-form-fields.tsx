"use client";

import type { Subject } from "@allaboard/types";
import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";

export type HelpRequestFormValues = {
  title: string;
  body: string;
  tagsRaw: string;
  codeSnippet: string;
  codeLanguage: string;
  subjectId: string;
  urgent: boolean;
  educationLevel: string;
};

export function parseTagsRaw(tagsRaw: string): string[] {
  return tagsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function tagsToRaw(tags?: string[]): string {
  return tags?.join(", ") ?? "";
}

export function buildHelpRequestPayload(
  values: HelpRequestFormValues,
  profileEducationLevel?: string,
): Record<string, unknown> {
  const tags = parseTagsRaw(values.tagsRaw);
  const educationLevel =
    values.educationLevel.trim() || profileEducationLevel?.trim() || "";

  return {
    title: values.title.trim(),
    ...(values.body.trim() ? { body: values.body.trim() } : {}),
    ...(tags.length ? { tags } : {}),
    ...(values.codeSnippet.trim()
      ? {
          codeSnippet: values.codeSnippet.trim(),
          codeLanguage: values.codeLanguage.trim() || "plaintext",
        }
      : {}),
    ...(values.subjectId ? { subjectId: values.subjectId } : {}),
    ...(values.urgent ? { urgent: true } : {}),
    ...(educationLevel ? { educationLevel } : {}),
  };
}

type FieldsProps = {
  idPrefix: string;
  values: HelpRequestFormValues;
  onChange: (patch: Partial<HelpRequestFormValues>) => void;
  subjects: Subject[];
  suggestTagsPending?: boolean;
  onSuggestTags?: () => void;
  suggestTagsError?: string | null;
};

export function HelpRequestFormFields({
  idPrefix,
  values,
  onChange,
  subjects,
  suggestTagsPending = false,
  onSuggestTags,
  suggestTagsError,
}: FieldsProps) {
  const t = useTranslations("helpForm");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");

  const canSuggestTags =
    Boolean(onSuggestTags) &&
    (values.title.trim().length > 0 || values.body.trim().length > 0);

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-title`}>{t("title")}</Label>
        <Input
          id={`${idPrefix}-title`}
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-body`}>{t("body")}</Label>
        <Textarea
          id={`${idPrefix}-body`}
          value={values.body}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={5}
          placeholder={t("bodyPlaceholder")}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor={`${idPrefix}-tags`}>{t("tags")}</Label>
          {onSuggestTags ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canSuggestTags || suggestTagsPending}
              onClick={onSuggestTags}
              data-testid={`${idPrefix}-suggest-tags`}
            >
              {suggestTagsPending ? tCommon("updating") : t("suggestTags")}
            </Button>
          ) : null}
        </div>
        <Input
          id={`${idPrefix}-tags`}
          value={values.tagsRaw}
          onChange={(e) => onChange({ tagsRaw: e.target.value })}
          placeholder={t("tagsPlaceholder")}
        />
        {suggestTagsError ? (
          <p className="m-0 text-sm text-destructive">{suggestTagsError}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-subject`}>{t("subject")}</Label>
        <select
          id={`${idPrefix}-subject`}
          value={values.subjectId}
          onChange={(e) => onChange({ subjectId: e.target.value })}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t("subjectPlaceholder")}</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-code-language`}>{t("codeLanguage")}</Label>
          <Input
            id={`${idPrefix}-code-language`}
            value={values.codeLanguage}
            onChange={(e) => onChange({ codeLanguage: e.target.value })}
            placeholder={t("codeLanguagePlaceholder")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-education`}>{tProfile("educationLevel")}</Label>
          <Input
            id={`${idPrefix}-education`}
            value={values.educationLevel}
            onChange={(e) => onChange({ educationLevel: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-code`}>{t("codeSnippet")}</Label>
        <Textarea
          id={`${idPrefix}-code`}
          value={values.codeSnippet}
          onChange={(e) => onChange({ codeSnippet: e.target.value })}
          rows={4}
          placeholder={t("codeSnippetPlaceholder")}
          className="font-mono text-sm"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.urgent}
          onChange={(e) => onChange({ urgent: e.target.checked })}
          data-testid={`${idPrefix}-urgent`}
          className="size-4 rounded border-input"
        />
        {t("urgent")}
      </label>
    </>
  );
}
