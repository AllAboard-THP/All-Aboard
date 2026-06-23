import { cn } from "@allaboard/ui/lib/utils";

/**
 * In-app global stage — rose → violet → rose (vertical mesh on dark slate).
 * Fixed full-viewport layer under header, footer, and page content.
 * Landing `/` keeps `LandingConceptBackground` instead.
 */
export function AppAbstractBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="app-abstract-background-base absolute inset-0" />
      <div className="app-abstract-background-glow absolute inset-0" />
      <div className="app-abstract-background-depth absolute inset-0" />
    </div>
  );
}
