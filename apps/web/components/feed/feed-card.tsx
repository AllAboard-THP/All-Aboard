import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  tag?: string;
};

export function FeedCard({ id, title, excerpt, tag }: Props) {
  return (
    <Card data-testid={`feed-card-${id}`} className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            <Link href={`/feed#${id}`} className="hover:text-primary focus-ring rounded-sm">
              {title}
            </Link>
          </CardTitle>
          {tag ? <Badge variant="secondary">{tag}</Badge> : null}
        </div>
      </CardHeader>
      {excerpt ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{excerpt}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
