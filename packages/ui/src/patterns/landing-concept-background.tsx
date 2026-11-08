import { cn } from "@allaboard/ui/lib/utils";

import { LandingCellField } from "./landing-cell-field";

/**
 * Marketing landing stage — ink field and the cell network.
 * Replaces the mural photo. Auth pages keep `AppAbstractBackground`.
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("landing-cell-stage pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
      aria-hidden
      data-testid="landing-concept-background"
    >
      <LandingCellField />
      <div className="landing-cell-vignette absolute inset-0" />
    </div>
  );
}
