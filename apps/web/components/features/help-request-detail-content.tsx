import type { HelpRequestDetailResponse } from "@allaboard/types";
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

import { HelpRequestDetailClient } from "@/components/features/help-request-detail-client";

type Props = {
  id: string;
  detail: HelpRequestDetailResponse | null;
  detailError: string | null;
  notFound: boolean;
};

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function HelpRequestDetailContent({
  id,
  detail,
  detailError,
  notFound,
}: Props) {
  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card data-testid="help-request-not-found">
          <CardHeader>
            <CardTitle className="text-2xl">Demande introuvable</CardTitle>
            <CardDescription>
              Aucune demande ne correspond à l&apos;identifiant{" "}
              <code className="text-foreground">{id}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/">Retour au feed</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="help-request-error">
          <AlertTitle>Impossible de charger la demande</AlertTitle>
          <AlertDescription>{detailError ?? "Erreur inconnue"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">Retour au feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item } = detail;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          Demande d&apos;aide
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {item.title}
        </h1>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1 text-base">
          <span>Auteur : {item.authorId}</span>
          <span>{formatCreatedAt(item.createdAt)}</span>
        </CardDescription>
        {item.tags && item.tags.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Tags : {item.tags.join(", ")}
          </p>
        ) : null}
      </header>

      <HelpRequestDetailClient initialDetail={detail} requestId={id} />

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">Retour au feed</Link>
        </Button>
      </div>
    </div>
  );
}
