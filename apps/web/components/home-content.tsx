import type { FeedResponse } from "@allaboard/types";
import Link from "next/link";

import { FeedClientPreview } from "@/components/feed-client-preview";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
};

export function HomeContent({ feed, feedError }: Props) {
  return (
    <div
      data-testid="r1-home-main"
      className="grid min-h-[calc(100vh-8rem)] place-items-center p-6"
    >
      <FadeIn>
      <Card className="w-full max-w-3xl" aria-label="Etat du site All-Aboard">
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            All-Aboard
          </p>
          <CardTitle className="text-3xl sm:text-4xl">
            Site en construction
          </CardTitle>
          <CardDescription className="max-w-prose text-base">
            L&apos;espace où les étudiants s&apos;aident vraiment. Publiez une
            requête, recevez des réponses ciblées et partagez vos savoirs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/25 p-4">
            <p className="text-sm font-bold text-emerald-300">Feed API (SSR)</p>
            {feedError ? (
              <p
                className="mt-2 text-sm text-red-300"
                data-testid="feed-ssr-error"
              >
                {feedError}
              </p>
            ) : feed ? (
              <ul
                className="mt-2 list-inside list-disc text-sm text-slate-200"
                data-testid="feed-ssr-list"
              >
                {feed.items.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Données issues de <code>GET /feed</code> via{" "}
              <code>API_URL</code> (cache Next <code>revalidate: 60</code>).
            </p>
            <FeedClientPreview />
          </div>

          <Badge variant="success" className="gap-1">
            <span aria-hidden="true">●</span>
            Lancement MVP en préparation
          </Badge>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-indigo-500/35 bg-slate-900/45 shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-indigo-300">
                  Feed social cible
                </CardTitle>
                <CardDescription>
                  Requêtes et réponses triées par pertinence.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-violet-500/35 bg-slate-900/45 shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-violet-300">
                  Chat temps réel
                </CardTitle>
                <CardDescription>
                  Échanges rapides avec la communauté.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-teal-500/35 bg-slate-900/45 shadow-none">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-teal-300">
                  Exploration par matière
                </CardTitle>
                <CardDescription>
                  Trouvez l&apos;aide par thème et niveau.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="mailto:contact@allaboard.app">Nous contacter</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/health">Statut technique</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}
