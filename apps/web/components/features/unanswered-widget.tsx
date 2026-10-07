import type { HelpRequest } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { PostCard, type PostCardLabels } from "@/components/features/post-card";

type Props = {
  items: HelpRequest[];
  labels: PostCardLabels;
};

export async function UnansweredWidget({ items, labels }: Props) {
  const t = await getTranslations("feed");

  if (items.length === 0) {
    return null;
  }

  return (
    <aside aria-label={t("unansweredAria")} data-testid="feed-unanswered-widget">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("unansweredTitle")}</CardTitle>
          <CardDescription>{t("unansweredDescription")}</CardDescription>
        </CardHeader>
        <ul className="flex list-none flex-col gap-2 px-4 pb-4 pt-0">
          {items.map((item) => (
            <li key={item.id}>
              <PostCard item={item} labels={labels} compact />
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
