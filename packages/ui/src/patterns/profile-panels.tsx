"use client";

import type { ReactNode } from "react";

import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/tabs";
import { cn } from "../lib/utils";
import { APP_GLASS_CARD_CLASS } from "./landing-layout";
import { SubjectTag } from "./legacy-ui";
import type {
  ProfileActivityPost,
  ProfileActivityReply,
  ProfilePageLabels,
  ProfileSubjectCatalogItem,
  ProfileSubjectChip,
} from "./profile-types";

export function ProfileAboutEditor({
  title,
  placeholder,
  value,
  onChange,
  saveLabel,
  onSave,
  saving = false,
  className,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  saveLabel: string;
  onSave: () => void;
  saving?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <Textarea
        id="profile-bio"
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="resize-y"
      />
      <Button
        type="button"
        className="mt-4"
        disabled={saving}
        onClick={onSave}
      >
        {saveLabel}
      </Button>
    </div>
  );
}

export function ProfileAboutReadOnly({
  title,
  bio,
  emptyLabel,
  className,
}: {
  title: string;
  bio: string;
  emptyLabel: string;
  className?: string;
}) {
  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <p className="leading-relaxed text-muted-foreground">
        {bio.trim() || emptyLabel}
      </p>
    </div>
  );
}

export function ProfileSubjectsEditor({
  labels,
  catalog,
  selectedIds,
  onToggle,
  saveLabel,
  hint,
  onSave,
  saving = false,
  exploreAction,
  className,
}: {
  labels: Pick<
    ProfilePageLabels,
    "subjectsTitle" | "subjectsEmpty" | "subjectsCta"
  >;
  catalog: ProfileSubjectCatalogItem[];
  selectedIds: string[];
  onToggle: (subjectId: string) => void;
  saveLabel: string;
  hint: string;
  onSave: () => void;
  saving?: boolean;
  exploreAction?: ReactNode;
  className?: string;
}) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <h2 className="mb-1 text-xl font-semibold">{labels.subjectsTitle}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
      {catalog.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {catalog.map((subject) => {
            const selected = selectedSet.has(subject.id);
            return (
              <button
                key={subject.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(subject.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-opacity",
                  selected ? "opacity-100 ring-2 ring-primary/40" : "opacity-60",
                )}
                style={{
                  color: subject.accentColor,
                  borderColor: `${subject.accentColor}33`,
                  backgroundColor: `${subject.accentColor}18`,
                }}
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.subjectsEmpty}</p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          disabled={saving || catalog.length === 0}
          onClick={onSave}
        >
          {saveLabel}
        </Button>
        {exploreAction}
      </div>
    </div>
  );
}

export function ProfileSubjectsPanel({
  labels,
  subjects,
  exploreAction,
  className,
}: {
  labels: Pick<ProfilePageLabels, "subjectsTitle" | "subjectsEmpty" | "subjectsCta">;
  subjects: ProfileSubjectChip[];
  exploreAction?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <h2 className="mb-3 text-xl font-semibold">{labels.subjectsTitle}</h2>
      {subjects.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <SubjectTag
              key={subject.id}
              name={subject.name}
              accentColor={subject.accentColor ?? "#6366f1"}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.subjectsEmpty}</p>
      )}
      {exploreAction ? <div className="mt-4">{exploreAction}</div> : null}
    </div>
  );
}

export function ProfileAccountPanel({
  labels,
  email,
  cguAcceptedLabel,
  notifyOnComment,
  notifyOnMessage,
  onNotifyOnCommentChange,
  onNotifyOnMessageChange,
  onSave,
  saving = false,
  className,
}: {
  labels: Pick<
    ProfilePageLabels,
    | "accountTitle"
    | "emailLabel"
    | "cguLabel"
    | "notifyCommentLabel"
    | "notifyMessageLabel"
    | "accountSave"
  >;
  email: string;
  cguAcceptedLabel?: string;
  notifyOnComment: boolean;
  notifyOnMessage: boolean;
  onNotifyOnCommentChange: (checked: boolean) => void;
  onNotifyOnMessageChange: (checked: boolean) => void;
  onSave: () => void;
  saving?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <h2 className="mb-4 text-xl font-semibold">{labels.accountTitle}</h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{labels.emailLabel}</dt>
          <dd className="font-medium text-foreground">{email}</dd>
        </div>
        {cguAcceptedLabel ? (
          <div>
            <dt className="text-muted-foreground">{labels.cguLabel}</dt>
            <dd className="text-foreground">{cguAcceptedLabel}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="profile-notify-comment"
            checked={notifyOnComment}
            onCheckedChange={(checked) =>
              onNotifyOnCommentChange(checked === true)
            }
          />
          <Label htmlFor="profile-notify-comment" className="font-normal">
            {labels.notifyCommentLabel}
          </Label>
        </div>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="profile-notify-message"
            checked={notifyOnMessage}
            onCheckedChange={(checked) =>
              onNotifyOnMessageChange(checked === true)
            }
          />
          <Label htmlFor="profile-notify-message" className="font-normal">
            {labels.notifyMessageLabel}
          </Label>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full"
        disabled={saving}
        onClick={onSave}
      >
        {labels.accountSave}
      </Button>
    </div>
  );
}

function ActivityListItem({
  title,
  body,
  meta,
  onClick,
}: {
  title: string;
  body?: string;
  meta: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <h3 className="font-semibold text-primary">{title}</h3>
      {body ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{body}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl border border-white/10 p-4 text-left transition-colors hover:border-primary/40"
      >
        {content}
      </button>
    );
  }

  return <div className="rounded-xl border border-white/10 p-4">{content}</div>;
}

export function ProfileActivityPanel({
  labels,
  posts,
  replies,
  activeTab,
  onTabChange,
  onPostClick,
  onReplyClick,
  postsEmptyAction,
  className,
}: {
  labels: Pick<
    ProfilePageLabels,
    | "tabPosts"
    | "tabReplies"
    | "postsEmpty"
    | "repliesEmpty"
    | "replyOnPrefix"
    | "publishedPrefix"
  >;
  posts: ProfileActivityPost[];
  replies: ProfileActivityReply[];
  activeTab: "posts" | "responses";
  onTabChange: (tab: "posts" | "responses") => void;
  onPostClick?: (postId: string) => void;
  onReplyClick?: (helpRequestId: string) => void;
  postsEmptyAction?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(APP_GLASS_CARD_CLASS, "rounded-2xl p-6", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          onTabChange(value as "posts" | "responses")
        }
      >
        <TabsList className="mb-6 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger
            value="posts"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white/5 data-[state=inactive]:text-muted-foreground"
          >
            {labels.tabPosts}
          </TabsTrigger>
          <TabsTrigger
            value="responses"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white/5 data-[state=inactive]:text-muted-foreground"
          >
            {labels.tabReplies}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <ActivityListItem
                key={post.id}
                title={post.title}
                body={post.excerpt}
                meta={post.meta}
                onClick={
                  onPostClick ? () => onPostClick(post.id) : undefined
                }
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{labels.postsEmpty}</p>
              {postsEmptyAction ? (
                <div className="mt-4 flex justify-center">{postsEmptyAction}</div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-3">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <ActivityListItem
                key={reply.id}
                title={`${labels.replyOnPrefix} ${reply.postTitle}`}
                body={reply.body}
                meta={`${labels.publishedPrefix} ${reply.meta}`}
                onClick={
                  onReplyClick
                    ? () => onReplyClick(reply.helpRequestId)
                    : undefined
                }
              />
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {labels.repliesEmpty}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ProfileRoleBadge({
  label,
  variant = "secondary",
}: {
  label: string;
  variant?: "default" | "secondary" | "outline";
}) {
  return <Badge variant={variant}>{label}</Badge>;
}
