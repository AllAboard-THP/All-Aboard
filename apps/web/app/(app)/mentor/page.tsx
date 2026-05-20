import Link from "next/link";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

export default function MentorDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            Mentor
          </p>
          <CardTitle className="text-2xl">Dashboard mentor (stub)</CardTitle>
          <CardDescription>
            Zone mentor du parcours MOC. Notifications et demandes à traiter —
            hors scope #25.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="m-0 text-sm text-muted-foreground">
            Aucune demande en attente (stub).
          </p>
          <Button variant="outline" asChild>
            <Link href="/">Retour au feed</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
