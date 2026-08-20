import type { AuthMeResponse, Subject } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { ProfileForm } from "@/components/features/profile-form";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  profile: AuthMeResponse;
  subjects: Subject[];
  locale: AppLocale;
};

function profileAvatarSrc(profile: AuthMeResponse): string | null {
  if (profile.avatarUrl?.trim()) return profile.avatarUrl.trim();
  return null;
}

function profileInitials(profile: AuthMeResponse): string {
  const source = profile.fullName?.trim() || profile.displayName?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export async function ProfileContent({ profile, subjects, locale }: Props) {
  const t = await getTranslations("profile");
  const avatarSrc = profileAvatarSrc(profile);
  const displayName =
    profile.fullName?.trim() ||
    profile.displayName?.trim() ||
    profile.userId;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URL
            <img
              src={avatarSrc}
              alt={displayName}
              className="size-16 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-lg font-semibold text-muted-foreground"
            >
              {profileInitials(profile)}
            </div>
          )}
          <div>
            <h1 className="m-0 text-3xl font-semibold text-foreground">
              {t("title")}
            </h1>
            <p className="mt-1 mb-0 text-muted-foreground">{t("description")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Badge variant="secondary">{profile.role}</Badge>
              <Link
                href={`/users/${profile.userId}`}
                className="text-sm font-medium text-primary underline"
              >
                {t("viewPublicProfile")}
              </Link>
              <Link
                href="/me/posts"
                className="text-sm font-medium text-primary underline"
              >
                {t("myPostsLink")}
              </Link>
              <Link
                href="/me/bookmarks"
                className="text-sm font-medium text-primary underline"
              >
                {t("myBookmarksLink")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("settingsTitle")}</CardTitle>
          <CardDescription>{t("settingsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialProfile={profile}
            subjects={subjects}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
