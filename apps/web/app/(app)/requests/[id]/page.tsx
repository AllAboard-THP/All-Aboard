import Link from "next/link";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HelpRequestDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            Détail demande (stub)
          </p>
          <CardTitle className="text-2xl">Demande {id}</CardTitle>
          <CardDescription>
            Page MOC pour le parcours feed → détail. Données API dans l&apos;issue
            #26.
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
