import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mentions légales</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-sm text-muted-foreground">
          <p>Page légale MVP (§8.10) — contenu à compléter avant production.</p>
        </CardContent>
      </Card>
    </div>
  );
}
