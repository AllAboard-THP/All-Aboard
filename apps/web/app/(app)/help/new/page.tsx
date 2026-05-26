import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { HelpRequestForm } from "@/components/features/help-request-form";
import { MarketingPageShell } from "@/components/features/marketing-page-shell";

export default function NewHelpRequestPage() {
  return (
    <MarketingPageShell maxWidth="narrow">
      <Card className="bg-card/90">
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            Nouvelle demande
          </p>
          <CardTitle className="text-2xl">
            Publier une demande d&apos;aide
          </CardTitle>
          <CardDescription>
            Connexion MVP (ADR 0001), puis envoi vers l&apos;API via le BFF{" "}
            <code className="text-foreground">/api/help-requests</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelpRequestForm />
          <p className="mt-5">
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Retour accueil
            </Link>
          </p>
        </CardContent>
      </Card>
    </MarketingPageShell>
  );
}
