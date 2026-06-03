import conceptOpenSpaceLandingUrl from "../assets/concept-open-space-landing.png";

import { cn } from "@allaboard/ui/lib/utils";

function brandAssetUrl(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}

/** Landing hero — [concept-open-space-landing.png](../../../../Docs/branding/assets/concept-open-space-landing.png). */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <img
        src={brandAssetUrl(conceptOpenSpaceLandingUrl)}
        alt=""
        className="size-full object-cover object-[32%_34%] brightness-[1.02] saturate-[0.92]"
        decoding="async"
        fetchPriority="low"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/88 via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-background/10" />
    </div>
  );
}
