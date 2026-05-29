"use client";

import {
  ArrowLeft,
  Check,
  Crown,
  FileText,
  MessageCircle,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyAdminUsers,
  type AdminUserRow,
} from "./fixtures/legacy-admin-users";
import {
  legacyModeration,
  type ModerationFixture,
  type ModerationFlaggedComment,
  type ModerationFlaggedPost,
} from "./fixtures/legacy-moderation";

function ModerationItemActions({
  labels,
}: {
  labels: LegacyLabels;
}) {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        size="sm"
        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
      >
        <Check data-icon="inline-start" />
        {labels.moderation.approve}
      </Button>
      <Button
        type="button"
        size="sm"
        className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
      >
        <Trash2 data-icon="inline-start" />
        {labels.moderation.reject}
      </Button>
    </div>
  );
}

function FlaggedPostRow({
  post,
  labels,
}: {
  post: ModerationFlaggedPost;
  labels: LegacyLabels;
}) {
  return (
    <div className="p-5">
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">{post.authorInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{post.authorName}</span>
            <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 text-xs text-orange-400">
              {labels.moderation.pendingBadge}
            </span>
          </div>
          <p className="mb-1 font-semibold">{post.title}</p>
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
        </div>
      </div>
      <ModerationItemActions labels={labels} />
    </div>
  );
}

function FlaggedCommentRow({
  comment,
  labels,
}: {
  comment: ModerationFlaggedComment;
  labels: LegacyLabels;
}) {
  return (
    <div className="p-5">
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">
            {comment.authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 text-xs text-orange-400">
              {labels.moderation.pendingBadge}
            </span>
          </div>
          <p className="mb-1 text-xs text-muted-foreground">
            {labels.moderation.replyToPrefix}{" "}
            <span>{comment.postTitle}</span>
          </p>
          <p className="text-sm text-muted-foreground">{comment.body}</p>
        </div>
      </div>
      <ModerationItemActions labels={labels} />
    </div>
  );
}

export function AdminModerationQueue({
  fixture = legacyModeration,
  labels = legacyLabelsFr,
  className,
}: {
  fixture?: ModerationFixture;
  labels?: LegacyLabels;
  className?: string;
}) {
  const total = fixture.flaggedPosts.length + fixture.flaggedComments.length;

  return (
    <div className={cn("mx-auto max-w-4xl", className)}>
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label={labels.adminUsers.back}
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">{labels.moderation.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.moderation.subtitle(total)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto border-white/10 bg-white/5"
        >
          <Shield data-icon="inline-start" />
          {labels.moderation.denylist}
        </Button>
      </div>

      <div className="glass mb-6 rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 p-5">
          <FileText className="size-4 text-orange-400" />
          <h2 className="font-semibold">{labels.moderation.postsTitle}</h2>
          <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-xs font-medium text-orange-400">
            {fixture.flaggedPosts.length}
          </span>
        </div>
        {fixture.flaggedPosts.length > 0 ? (
          <div className="divide-y divide-white/5">
            {fixture.flaggedPosts.map((post) => (
              <FlaggedPostRow key={post.id} post={post} labels={labels} />
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {labels.moderation.postsEmpty}
          </p>
        )}
      </div>

      <div className="glass rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 p-5">
          <MessageCircle className="size-4 text-orange-400" />
          <h2 className="font-semibold">{labels.moderation.commentsTitle}</h2>
          <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-xs font-medium text-orange-400">
            {fixture.flaggedComments.length}
          </span>
        </div>
        {fixture.flaggedComments.length > 0 ? (
          <div className="divide-y divide-white/5">
            {fixture.flaggedComments.map((comment) => (
              <FlaggedCommentRow
                key={comment.id}
                comment={comment}
                labels={labels}
              />
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {labels.moderation.commentsEmpty}
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminUsersTable({
  users = legacyAdminUsers,
  labels = legacyLabelsFr,
  className,
}: {
  users?: AdminUserRow[];
  labels?: LegacyLabels;
  className?: string;
}) {
  const columns = labels.adminUsers.columns;

  return (
    <div className={cn("mx-auto max-w-7xl", className)}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{labels.adminUsers.title}</h1>
          <p className="text-muted-foreground">
            {labels.adminUsers.total(users.length)}
          </p>
        </div>
        <Button className="rounded-lg">
          <Crown data-icon="inline-start" />
          {labels.adminUsers.createAdmin}
        </Button>
      </div>

      <button
        type="button"
        className="mb-4 inline-flex items-center text-sm text-primary hover:underline"
      >
        <ArrowLeft className="mr-2 size-3" />
        {labels.adminUsers.back}
      </button>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">{columns.name}</th>
              <th className="px-6 py-4 text-left font-semibold">{columns.email}</th>
              <th className="px-6 py-4 text-left font-semibold">{columns.posts}</th>
              <th className="px-6 py-4 text-left font-semibold">
                {columns.comments}
              </th>
              <th className="px-6 py-4 text-left font-semibold">{columns.role}</th>
              <th className="px-6 py-4 text-left font-semibold">
                {columns.createdAt}
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                {columns.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-white/10 transition-colors hover:bg-white/5"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {user.email || "—"}
                </td>
                <td className="px-6 py-4">{user.postsCount}</td>
                <td className="px-6 py-4">{user.commentsCount}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      user.role === "admin"
                        ? "text-yellow-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {user.role === "admin" ? (
                      <Crown className="mr-1 inline size-3" />
                    ) : (
                      <User className="mr-1 inline size-3" />
                    )}
                    {user.role === "admin"
                      ? labels.adminUsers.roleAdmin
                      : labels.adminUsers.roleStudent}
                  </span>
                  {user.isMentor ? (
                    <span className="ml-2 text-xs font-semibold text-emerald-400">
                      {labels.adminUsers.mentorBadge}
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className={cn(
                        "text-left text-xs transition-colors",
                        user.role === "admin"
                          ? "text-orange-400 hover:text-orange-300"
                          : "text-yellow-400 hover:text-yellow-300",
                      )}
                    >
                      {user.role === "admin"
                        ? labels.adminUsers.demoteAdmin
                        : labels.adminUsers.promoteAdmin}
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "text-left text-xs transition-colors",
                        user.isMentor
                          ? "text-red-400 hover:text-red-300"
                          : "text-emerald-400 hover:text-emerald-300",
                      )}
                    >
                      {user.isMentor
                        ? labels.adminUsers.removeMentor
                        : labels.adminUsers.promoteMentor}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
