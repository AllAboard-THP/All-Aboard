import concept2HeroUrl from "../assets/concept-2-bicolor-sail.png";

import { cn } from "@allaboard/ui/lib/utils";

/** Landing hero — [concept-2-bicolor-sail-proposal.png](../../../../Docs/branding/assets/concept-2-bicolor-sail-proposal.png). */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <img
        src={concept2HeroUrl}
        alt=""
        className="size-full object-cover object-center saturate-[0.88]"
        decoding="async"
        fetchPriority="low"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-background/15" />
    </div>
  );
}
