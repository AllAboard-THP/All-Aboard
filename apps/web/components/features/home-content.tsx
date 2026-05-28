import type { FeedResponse, HelpRequest } from "@allaboard/types";
import Link from "next/link";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { FeedClientPreview } from "@/components/features/feed-client-preview";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
};

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function FeedItemCard({ item }: { item: HelpRequest }) {
  const hasTags = Boolean(item.tags && item.tags.length > 0);

  return (
    <li>
      <Card className="w-full gap-0 py-4 transition-colors hover:border-primary/50">
        <CardHeader
          className={`gap-1.5 px-4 ${hasTags ? "pb-2" : "pb-0"}`}
        >
          <CardTitle className="text-lg">
            <Link
              href={`/requests/${item.id}`}
              className="text-foreground hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
            <span>Auteur : {item.authorId}</span>
            <span>{formatCreatedAt(item.createdAt)}</span>
          </CardDescription>
        </CardHeader>
        {hasTags ? (
          <CardContent className="px-4 pt-0">
            <p className="m-0 text-xs text-muted-foreground">
              Tags : {item.tags!.join(", ")}
            </p>
          </CardContent>
        ) : null}
      </Card>
    </li>
  );
}

export function HomeContent({ feed, feedError }: Props) {
  const hasItems = Boolean(feed && feed.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          All-Aboard
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          Feed communautaire
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          Parcourez les demandes d&apos;aide publiées par la communauté. Posez la
          vôtre ou consultez une demande pour voir les réponses.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/help/new">Nouvelle demande</Link>
          </Button>
        </div>
      </header>

      <section aria-label="Feed des demandes d'aide">
        {feedError ? (
          <Alert variant="destructive" data-testid="feed-ssr-error">
            <AlertTitle>Impossible de charger le feed</AlertTitle>
            <AlertDescription>{feedError}</AlertDescription>
          </Alert>
        ) : null}

        {!feedError && feed && feed.items.length === 0 ? (
          <Card data-testid="feed-empty">
            <CardHeader>
              <CardTitle className="text-lg">
                Aucune demande pour l&apos;instant
              </CardTitle>
              <CardDescription>
                Soyez le premier à publier une demande d&apos;aide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/help/new">Publier une demande</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!feedError && hasItems ? (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="feed-ssr-list"
          >
            {feed!.items.map((item) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </ul>
        ) : null}

        <div className="mt-4">
          <FeedClientPreview />
        </div>
      </section>
    </div>
  );
}
