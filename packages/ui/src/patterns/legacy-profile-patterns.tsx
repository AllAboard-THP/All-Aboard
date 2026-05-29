"use client";

import { Mail } from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/tabs";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyProfile,
  type LegacyProfile,
} from "./fixtures/legacy-profile";
import { StatCard } from "./legacy-ui";
import { legacyDemoToast } from "./legacy-story-feedback";

export function ProfileHeaderCard({
  profile = legacyProfile,
  labels = legacyLabelsFr,
  showMessageCta = true,
  className,
}: {
  profile?: LegacyProfile;
  labels?: LegacyLabels;
  showMessageCta?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-between gap-6 rounded-2xl p-6 md:flex-row",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarFallback className="text-xl">{profile.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="mb-1 text-sm text-muted-foreground">{profile.headline}</p>
          <p className="text-xs text-muted-foreground">
            {labels.profile.levelPrefix} {profile.educationLevel}
          </p>
        </div>
      </div>

      {showMessageCta ? (
        <Button
          className="rounded-xl"
          onClick={() => legacyDemoToast(labels.profile.sendMessage)}
        >
          <Mail data-icon="inline-start" />
          {labels.profile.sendMessage}
        </Button>
      ) : null}
    </div>
  );
}

export function ProfileStatGrid({
  profile = legacyProfile,
  labels = legacyLabelsFr,
  className,
}: {
  profile?: LegacyProfile;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      <StatCard
        value={profile.postsCount}
        label={labels.profile.statsPosts}
        tone="primary"
      />
      <StatCard
        value={profile.repliesCount}
        label={labels.profile.statsReplies}
        tone="primary"
      />
      <StatCard
        value={profile.rating}
        label={labels.profile.statsRating}
        tone="accent"
      />
    </div>
  );
}

export function ProfileAboutCard({
  profile = legacyProfile,
  labels = legacyLabelsFr,
  className,
}: {
  profile?: LegacyProfile;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      <h2 className="mb-3 text-xl font-semibold">{labels.profile.aboutTitle}</h2>
      <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
    </div>
  );
}

export function ProfileActivityTabs({
  profile = legacyProfile,
  labels = legacyLabelsFr,
  className,
}: {
  profile?: LegacyProfile;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      <Tabs defaultValue="posts">
        <TabsList className="mb-6 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger
            value="posts"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white/5 data-[state=inactive]:text-muted-foreground"
          >
            {labels.profile.tabPosts}
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white/5 data-[state=inactive]:text-muted-foreground"
          >
            {labels.profile.tabReplies}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-white/10 p-4"
              >
                <h3 className="font-semibold text-primary">{post.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.timeAgo}
                </p>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-muted-foreground">
              {labels.profile.postsEmpty}
            </p>
          )}
        </TabsContent>

        <TabsContent value="replies" className="space-y-4">
          {profile.replies.length > 0 ? (
            profile.replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-xl border border-white/10 p-4"
              >
                <p className="mb-2 text-sm text-muted-foreground">
                  <strong>{labels.profile.replyOnPrefix}</strong> {reply.postTitle}
                </p>
                <p className="text-muted-foreground">{reply.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {labels.profile.publishedPrefix} {reply.timeAgo}
                </p>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-muted-foreground">
              {labels.profile.repliesEmpty}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
