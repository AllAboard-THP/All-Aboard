import type { Resource } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

function truncateBody(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

type Props = {
  resource: Resource;
  locale: AppLocale;
};

export async function ResourceCard({ resource, locale }: Props) {
  const t = await getTranslations("resources");
  const tCommon = await getTranslations("common");

  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">
            <Link
              href={`/resources/${resource.id}`}
              className="text-foreground hover:text-primary hover:underline"
              aria-label={t("cardLinkAria", { title: resource.title })}
            >
              {resource.title}
            </Link>
          </CardTitle>
          {resource.status === "pending" ? (
            <Badge variant="secondary" data-testid="resource-pending-badge">
              {t("statusPending")}
            </Badge>
          ) : null}
        </div>
        <CardDescription className="line-clamp-2">
          {truncateBody(resource.body)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/users/${resource.authorId}`}
            className="font-medium text-primary hover:underline"
          >
            {tCommon("author", { authorId: resource.authorId })}
          </Link>
          {resource.subject ? (
            <Badge
              variant="outline"
              style={{
                borderColor: `${resource.subject.accentColor}66`,
                color: resource.subject.accentColor,
                backgroundColor: `${resource.subject.accentColor}18`,
              }}
            >
              {resource.subject.name}
            </Badge>
          ) : null}
          {resource.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-muted-foreground">
              #{tag}
            </Badge>
          ))}
          <span className="ml-auto text-xs">
            {formatDateTime(resource.createdAt, locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
