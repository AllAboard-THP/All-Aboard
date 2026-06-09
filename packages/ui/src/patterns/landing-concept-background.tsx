import { cn } from "@allaboard/ui/lib/utils";

/**
 * Landing hero stage — muted bicolor gradient (slate → indigo → pink).
 * Left ~40% stays pale for copy; right carries soft brand indigo → pink wash.
 * Restore raster via Docs/branding/assets/concept-landing-port-entry.{webp,png} when ready.
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "landing-hero-stage-bicolor pointer-events-none overflow-hidden",
        className,
      )}
      aria-hidden
    />
  );
}
