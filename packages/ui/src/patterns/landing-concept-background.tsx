import conceptLandingPortEntryPngUrl from "../assets/concept-landing-port-entry.png";
import conceptLandingPortEntryWebpUrl from "../assets/concept-landing-port-entry.webp";

import { cn } from "@allaboard/ui/lib/utils";

/** Bust browser/Vite cache when the canonical Docs asset changes (md5 prefix). */
const LANDING_CONCEPT_BG_REVISION = "editorial-v4-b";

const LANDING_CONCEPT_WIDTH = 3840;
const LANDING_CONCEPT_HEIGHT = 2560;

function brandAssetUrl(asset: string | { src: string }): string {
  const base = typeof asset === "string" ? asset : asset.src;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${LANDING_CONCEPT_BG_REVISION}`;
}

/**
 * Landing hero stage — raster only; fills main between header and footer (not under footer).
 * Legibility via hero text shadows. Canonical: Docs/branding/assets/concept-landing-port-entry.{webp,png}
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none overflow-hidden", className)} aria-hidden>
      <picture>
        <source srcSet={brandAssetUrl(conceptLandingPortEntryWebpUrl)} type="image/webp" />
        <img
          src={brandAssetUrl(conceptLandingPortEntryPngUrl)}
          alt=""
          width={LANDING_CONCEPT_WIDTH}
          height={LANDING_CONCEPT_HEIGHT}
          sizes="100vw"
          className="size-full object-cover object-[52%_44%] lg:object-[52%_42%]"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}
