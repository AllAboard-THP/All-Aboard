import { cn } from "@allaboard/ui/lib/utils";

import { LandingNetworkField } from "./landing-network-field";

/**
 * Marketing landing stage — indigo/fuchsia network on the dark stage.
 * Replaces the mural photo. Auth pages keep `AppAbstractBackground`.
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("landing-network-stage pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
      aria-hidden
      data-testid="landing-concept-background"
    >
      <LandingNetworkField />
      <div className="landing-network-vignette absolute inset-0" />
    </div>
  );
}
