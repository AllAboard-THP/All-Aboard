"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Plus, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import { Input } from "../components/input";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyResources,
  type LegacyResource,
} from "./fixtures/legacy-resources";
import { legacySubjects } from "./fixtures/legacy-subjects";
import { SubjectTag } from "./legacy-ui";
import { legacyDemoToast } from "./legacy-story-feedback";

export function SearchBar({
  placeholder,
  buttonLabel,
  defaultValue = "",
  tone = "emerald",
  className,
}: {
  placeholder: string;
  buttonLabel: string;
  defaultValue?: string;
  tone?: "emerald" | "primary";
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const buttonClass =
    tone === "emerald"
      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
      : "bg-primary/20 text-primary hover:bg-primary/30";

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            legacyDemoToast(buttonLabel);
          }
        }}
        placeholder={placeholder}
        className="h-12 rounded-xl border-white/10 bg-white/5 pr-28 pl-10"
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
        <Button
          type="button"
          size="xs"
          className={buttonClass}
          onClick={() => {
            if (value.trim()) {
              legacyDemoToast(buttonLabel);
            }
          }}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

export function PageHeaderWithIcon({
  title,
  subtitle,
  ctaLabel,
  icon: Icon = BookOpen,
  iconClassName = "text-emerald-400",
  className,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  icon?: typeof BookOpen;
  iconClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-start justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
          <Icon className={cn("size-7", iconClassName)} />
          {title}
        </h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-400"
        onClick={() => legacyDemoToast(ctaLabel)}
      >
        <Plus data-icon="inline-start" />
        {ctaLabel}
      </Button>
    </div>
  );
}

export function ResourceCard({
  resource,
  className,
}: {
  resource: LegacyResource;
  className?: string;
}) {
  const subject = legacySubjects.find((s) => s.slug === resource.subjectSlug);

  return (
    <button
      type="button"
      className={cn(
        "glass w-full rounded-2xl p-6 text-left transition-colors hover:bg-white/5",
        className,
      )}
      onClick={() => legacyDemoToast(resource.title)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="mb-1 text-lg font-semibold transition-colors hover:text-emerald-400">
            {resource.title}
          </h2>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {resource.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs">
              <Avatar className="size-4">
                <AvatarFallback className="text-[8px]">
                  {resource.authorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-emerald-400">
                {resource.authorName}
              </span>
              <GraduationCap className="size-3 text-emerald-400/70" />
            </span>
            {subject ? (
              <SubjectTag
                name={subject.name}
                accentColor={subject.accentColor}
                icon={subject.icon}
              />
            ) : null}
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {resource.timeAgo}
            </span>
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors hover:text-emerald-400" />
      </div>
    </button>
  );
}

export function ResourceCardList({
  resources = legacyResources,
  className,
}: {
  resources?: LegacyResource[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

export function ResourcesPageHeader({
  labels = legacyLabelsFr,
}: {
  labels?: LegacyLabels;
}) {
  return (
    <PageHeaderWithIcon
      title={labels.resources.title}
      subtitle={labels.resources.subtitle}
      ctaLabel={labels.resources.publishCta}
    />
  );
}
