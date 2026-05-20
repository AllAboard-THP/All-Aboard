import type { FeedResponse } from "@allaboard/types";
import Link from "next/link";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { FeedClientPreview } from "@/components/features/feed-client-preview";
import { MarketingPageShell } from "@/components/features/marketing-page-shell";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
};

export function HomeContent({ feed, feedError }: Props) {
  return (
    <MarketingPageShell>
      <section
        className="glass-panel rounded-2xl p-8 shadow-xl"
        aria-label="Etat du site All-Aboard"
      >
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          All-Aboard
        </p>
        <h1 className="mt-3.5 mb-3 text-4xl leading-tight font-semibold text-foreground md:text-5xl">
          Site en construction
        </h1>
        <p className="m-0 max-w-prose text-base leading-relaxed text-muted-foreground">
          L&apos;espace ou les etudiants s&apos;aident vraiment. Publiez une requete,
          recevez des reponses ciblees et partagez vos savoirs. Version en
          preparation, ouverture prochaine.
        </p>

        <Card className="mt-5 border-primary/35 bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">
              Feed API (SSR)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {feedError ? (
              <p
                className="m-0 text-sm text-destructive"
                data-testid="feed-ssr-error"
              >
                {feedError}
              </p>
            ) : feed ? (
              <ul
                className="mt-2.5 list-inside list-disc pl-0 text-sm text-foreground"
                data-testid="feed-ssr-list"
              >
                {feed.items.map((item) => (
                  <li key={item.id} className="mb-1.5">
                    {item.title}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 mb-0 text-xs text-muted-foreground">
              Données issues de <code>GET /feed</code> via{" "}
              <code className="text-foreground">API_URL</code> (cache Next{" "}
              <code className="text-foreground">revalidate: 60</code>).
            </p>
            <FeedClientPreview />
          </CardContent>
        </Card>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-3.5 py-2 text-sm font-semibold text-primary">
          <span aria-hidden="true">●</span>
          <span>Lancement MVP en preparation</span>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
          <Card className="border-primary/35 bg-card/45">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">
                Feed social cible
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Requetes et reponses triees par pertinence.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-accent/35 bg-card/45">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-accent">
                Chat temps reel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Echanges rapides avec la communaute.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/45">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground">
                Exploration par matiere
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Trouvez l&apos;aide par theme et niveau.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/help/new">Nouvelle demande</Link>
          </Button>
          <Button asChild>
            <a href="mailto:contact@allaboard.app">Nous contacter</a>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/health">Statut technique</Link>
          </Button>
        </div>
      </section>
    </MarketingPageShell>
  );
}
