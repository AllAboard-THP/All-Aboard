"use client";

import {
  ArrowRight,
  Check,
  ClipboardCheck,
  HandHeart,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyMentorDashboard,
  type MentorDashboardFixture,
  type MentorHelpPost,
  type MentorPendingResource,
} from "./fixtures/legacy-mentor";
import { StatCard, SubjectTag } from "./legacy-ui";

export function MentorStatsGrid({
  fixture = legacyMentorDashboard,
  labels = legacyLabelsFr,
  className,
}: {
  fixture?: MentorDashboardFixture;
  labels?: LegacyLabels;
  className?: string;
}) {
  const hasPending = fixture.pendingCount > 0;
  const hasHelp = fixture.helpCount > 0;

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <StatCard
        value={fixture.publishedCount}
        label={labels.mentor.statsPublished}
        tone="emerald"
      />
      <StatCard
        value={fixture.pendingCount}
        label={labels.mentor.statsPending}
        tone="yellow"
        className={cn(hasPending && "ring-1 ring-yellow-400/40")}
      />
      <StatCard
        value={fixture.helpCount}
        label={labels.mentor.statsHelp}
        tone="orange"
        className={cn(hasHelp && "ring-1 ring-red-400/40")}
      />
    </div>
  );
}

export function MentorHelpPanel({
  posts = legacyMentorDashboard.helpPosts,
  labels = legacyLabelsFr,
  className,
}: {
  posts?: MentorHelpPost[];
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("glass mb-6 rounded-2xl", className)}>
      <div className="flex items-center gap-2 border-b border-white/10 p-5">
        <HandHeart className="size-4 text-red-400" />
        <h2 className="font-semibold">{labels.mentor.helpPanelTitle}</h2>
        {posts.length > 0 ? (
          <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-medium text-red-400">
            {posts.length}
          </span>
        ) : null}
      </div>

      {posts.length > 0 ? (
        <div className="divide-y divide-white/5">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-5">
              <Avatar className="mt-0.5 size-9 shrink-0">
                <AvatarFallback className="text-xs">
                  {post.authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{post.authorName}</span>
                  <SubjectTag
                    name={post.subjectName}
                    accentColor={post.subjectColor}
                  />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {post.timeAgo}
                  </span>
                </div>
                <p className="mb-1 text-sm font-medium">{post.title}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
              </div>
              <Button
                type="button"
                size="xs"
                className="shrink-0 bg-red-400/10 text-red-400 hover:bg-red-400/20"
              >
                {labels.mentor.helpCta}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-muted-foreground">
          {labels.mentor.helpEmpty}
        </p>
      )}
    </div>
  );
}

export function MentorValidationPanel({
  resources = legacyMentorDashboard.pendingResources,
  labels = legacyLabelsFr,
  className,
}: {
  resources?: MentorPendingResource[];
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl", className)}>
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <ClipboardCheck className="size-4 text-yellow-400" />
          {labels.mentor.validationPanelTitle}
          {resources.length > 0 ? (
            <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
              {resources.length}
            </span>
          ) : null}
        </h2>
      </div>

      {resources.length > 0 ? (
        <div className="divide-y divide-white/5">
          {resources.map((resource) => (
            <div key={resource.id} className="p-5">
              <div className="mb-3">
                <h3 className="mb-1 font-semibold">{resource.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {resource.excerpt}
                </p>
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Avatar className="size-4">
                    <AvatarFallback className="text-[8px]">
                      {resource.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  {resource.authorName}
                </span>
                <SubjectTag
                  name={resource.subjectName}
                  accentColor={resource.subjectColor}
                />
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  {labels.mentor.submittedPrefix} {resource.timeAgo}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                >
                  <Check data-icon="inline-start" />
                  {labels.mentor.approve}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <X data-icon="inline-start" />
                  {labels.mentor.reject}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-10 text-center text-muted-foreground">
          {labels.mentor.validationEmpty}
        </p>
      )}
    </div>
  );
}
