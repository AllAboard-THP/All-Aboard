import conceptLandingPortEntryUrl from "../assets/concept-landing-port-entry.png";

import { cn } from "@allaboard/ui/lib/utils";

/** Bust browser/Vite cache when the canonical Docs asset changes (md5 prefix). */
const LANDING_CONCEPT_BG_REVISION = "c0316a46";

function brandAssetUrl(asset: string | { src: string }): string {
  const base = typeof asset === "string" ? asset : asset.src;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${LANDING_CONCEPT_BG_REVISION}`;
}

/**
 * Landing hero — editorial illustration, sailboat entering port.
 * Canonical raster: Docs/branding/assets/concept-landing-port-entry.png
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <img
        src={brandAssetUrl(conceptLandingPortEntryUrl)}
        alt=""
        className="size-full object-cover object-center brightness-[1.02] saturate-[0.9]"
        decoding="async"
        fetchPriority="low"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/62 via-background/14 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-background/5" />
    </div>
  );
}
