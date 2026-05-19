import { Card, CardContent } from "@/components/ui/card";

export function FeedEmpty({ message = "Aucune entrée pour le moment." }: { message?: string }) {
  return (
    <Card data-testid="feed-empty" className="border-dashed">
      <CardContent className="flex min-h-[120px] items-center justify-center p-8 text-center text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
