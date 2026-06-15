import type { HelpRequest, PublicUserResponse, Response } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { PostCard, type PostCardLabels } from "@/components/features/post-card";
import { UserProfilePagination } from "@/components/features/user-profile-pagination";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";
import {
  publicUserHref,
  type PublicUserPageParams,
} from "@/lib/user-search-params";

type Props = {
  userId: string;
  data: PublicUserResponse;
  params: PublicUserPageParams;
};

function profileAvatarSrc(
  profile: PublicUserResponse["profile"],
): string | null {
  if (profile.avatarUrl?.trim()) return profile.avatarUrl.trim();
  return null;
}

function profileInitials(profile: PublicUserResponse["profile"]): string {
  const source = profile.displayName.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function excerpt(body: string, maxLength: number): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function ResponseListItem({
  item,
  locale,
  label,
}: {
  item: Response;
  locale: AppLocale;
  label: string;
}) {
  return (
    <Card data-testid="user-response-item">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <Link
            href={`/requests/${item.helpRequestId}`}
            className="text-foreground hover:text-primary hover:underline"
          >
            {label}
          </Link>
        </CardTitle>
        <CardDescription>
          {formatDateTime(item.createdAt ?? new Date(0).toISOString(), locale)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          {excerpt(item.body, 280)}
        </p>
      </CardContent>
    </Card>
  );
}

export async function UserPublicContent({ userId, data, params }: Props) {
  const t = await getTranslations("profile.public");
  const tPostCard = await getTranslations("postCard");
  const tFeed = await getTranslations("feed");
  const locale = (await getLocale()) as AppLocale;
  const { profile } = data;
  const avatarSrc = profileAvatarSrc(profile);

  const postCardLabels: PostCardLabels = {
    author: (authorId) => tPostCard("author", { authorId }),
    formatDate: (iso) => formatDateTime(iso, locale),
    responsesCount: (count) => tPostCard("responsesCount", { count }),
    likesCount: (count) => tPostCard("likesCount", { count }),
    urgent: tPostCard("urgent"),
    resolved: tPostCard("resolved"),
    filterByTagAria: (tag) => tPostCard("filterByTagAria", { tag }),
  };

  const posts = data.tab === "posts" ? (data.items as HelpRequest[]) : [];
  const responses = data.tab === "responses" ? (data.items as Response[]) : [];

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <header className="mb-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URL
              <img
                src={avatarSrc}
                alt={profile.displayName}
                className="size-20 rounded-full border border-border object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="flex size-20 items-center justify-center rounded-full border border-border bg-muted text-xl font-semibold text-muted-foreground"
              >
                {profileInitials(profile)}
              </div>
            )}
            <div>
              <h1 className="m-0 text-3xl font-semibold text-foreground">
                {profile.displayName}
              </h1>
              {profile.headline ? (
                <p className="mt-1 mb-0 text-sm text-muted-foreground">
                  {profile.headline}
                </p>
              ) : null}
              {profile.educationLevel ? (
                <p className="mt-1 mb-0 text-xs text-muted-foreground">
                  {t("educationLevel", { level: profile.educationLevel })}
                </p>
              ) : null}
              <Badge variant="secondary" className="mt-2">
                {profile.role}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {profile.bio ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("aboutTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="m-0 leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="m-0 text-3xl font-bold text-primary">
              {profile.stats.postsCount}
            </p>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">
              {t("statsPosts")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="m-0 text-3xl font-bold text-primary">
              {profile.stats.responsesCount}
            </p>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">
              {t("statsResponses")}
            </p>
          </CardContent>
        </Card>
      </div>

      {profile.competenceSubjects && profile.competenceSubjects.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {profile.competenceSubjects.map((subject) => (
            <Badge
              key={subject.id}
              variant="outline"
              style={{
                borderColor: `${subject.accentColor}66`,
                color: subject.accentColor,
              }}
            >
              {subject.name}
            </Badge>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={params.tab === "posts" ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={publicUserHref(userId, { ...params, tab: "posts", page: 1 })}>
                {t("tabPosts")}
              </Link>
            </Button>
            <Button
              variant={params.tab === "responses" ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={publicUserHref(userId, {
                  ...params,
                  tab: "responses",
                  page: 1,
                })}
              >
                {t("tabResponses")}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.tab === "posts" && posts.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-muted-foreground">
              {t("emptyPosts")}
            </p>
          ) : null}
          {data.tab === "responses" && responses.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-muted-foreground">
              {t("emptyResponses")}
            </p>
          ) : null}

          {data.tab === "posts" && posts.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {posts.map((item) => (
                <li key={item.id}>
                  <PostCard item={item} labels={postCardLabels} />
                </li>
              ))}
            </ul>
          ) : null}

          {data.tab === "responses" && responses.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {responses.map((item) => (
                <li key={item.id}>
                  <ResponseListItem
                    item={item}
                    locale={locale}
                    label={t("responseOnRequest", { id: item.helpRequestId })}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <UserProfilePagination
            userId={userId}
            params={params}
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
