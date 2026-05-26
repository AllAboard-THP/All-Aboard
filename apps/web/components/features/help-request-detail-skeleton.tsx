import { Skeleton } from "@allaboard/ui/components/skeleton";

export function HelpRequestDetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-6 p-6"
      data-testid="help-request-detail-skeleton"
      aria-busy="true"
      aria-label="Chargement de la demande"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
