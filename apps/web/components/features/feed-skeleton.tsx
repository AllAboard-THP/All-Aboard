import { Skeleton } from "@allaboard/ui/components/skeleton";

export function FeedSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-6 p-6"
      data-testid="feed-skeleton"
      aria-busy="true"
      aria-label="Chargement du feed"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    </div>
  );
}
