import Link from "next/link";
import { cookies } from "next/headers";

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
import { Separator } from "@allaboard/ui/components/separator";

import { fetchAuthMe, fetchMentorFeed } from "@/lib/api-server";
import { FeedItemTags } from "@/components/features/feed-item-tags";

export const dynamic = "force-dynamic";

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MentorDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="mentor-unauthenticated">
          <AlertTitle>Connexion requise</AlertTitle>
          <AlertDescription>
            Connectez-vous via{" "}
            <Link href="/help/new" className="text-primary underline">
              Nouvelle demande
            </Link>{" "}
            pour accéder au dashboard mentor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const meResult = await fetchAuthMe(token);
  if (!meResult.ok || meResult.data.role !== "mentor") {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="mentor-forbidden">
          <AlertTitle>Accès réservé aux mentors</AlertTitle>
          <AlertDescription>
            Compte MVP mentor : utilisez l&apos;identifiant{" "}
            <code className="text-foreground">alice</code> (ou un id listé dans{" "}
            <code className="text-foreground">MVP_MENTOR_USER_IDS</code>).
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">Retour au feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  const feedResult = await fetchMentorFeed();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          Mentor
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          Demandes à traiter
        </h1>
        <p className="m-0 text-muted-foreground">
          Connecté en tant que {meResult.data.userId} — demandes taguées
          mentor/domaine.
        </p>
      </header>

      <Separator className="mb-6" />

      {feedResult.ok && feedResult.data.items.length === 0 ? (
        <Card data-testid="mentor-feed-empty">
          <CardHeader>
            <CardTitle className="text-lg">Aucune demande taguée</CardTitle>
            <CardDescription>
              Les demandes avec des tags mentor ou domaine apparaîtront ici.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!feedResult.ok ? (
        <Alert variant="destructive" data-testid="mentor-feed-error">
          <AlertTitle>Impossible de charger les demandes</AlertTitle>
          <AlertDescription>{feedResult.error}</AlertDescription>
        </Alert>
      ) : null}

      {feedResult.ok && feedResult.data.items.length > 0 ? (
        <ul
          className="flex list-none flex-col gap-3 p-0"
          data-testid="mentor-feed-list"
        >
          {feedResult.data.items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardHeader className="pb-2">
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
                {item.tags && item.tags.length > 0 ? (
                  <CardContent className="pt-0">
                    <FeedItemTags tags={item.tags} />
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">Retour au feed</Link>
        </Button>
      </div>
    </div>
  );
}
