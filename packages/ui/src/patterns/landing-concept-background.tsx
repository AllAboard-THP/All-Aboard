import conceptLandingPortEntryUrl from "../assets/concept-landing-port-entry.png";

import { cn } from "@allaboard/ui/lib/utils";

/** Bust browser/Vite cache when the canonical Docs asset changes (md5 prefix). */
const LANDING_CONCEPT_BG_REVISION = "fd8d3f6f";

function brandAssetUrl(asset: string | { src: string }): string {
  const base = typeof asset === "string" ? asset : asset.src;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${LANDING_CONCEPT_BG_REVISION}`;
}

const LANDING_BG_IMAGE_CLASS =
  "size-full object-cover object-[42%_40%] brightness-[0.96] saturate-[1.02]";

/** Softens the photo's harsh sharp-to-bokeh leaf transition on the right. */
const LANDING_BG_BLUR_HARMONIZE_MASK =
  "linear-gradient(to right, transparent 0%, transparent 28%, rgba(0,0,0,0.25) 48%, rgba(0,0,0,0.62) 68%, rgba(0,0,0,0.92) 84%, black 100%)";

/**
 * Landing hero — street-art mural photo (2700×1800); fixed full-viewport cover (no stretch), under header/footer glass.
 * Canonical raster: Docs/branding/assets/concept-landing-port-entry.png
 */
export function LandingConceptBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <img
        src={brandAssetUrl(conceptLandingPortEntryUrl)}
        alt=""
        className={LANDING_BG_IMAGE_CLASS}
        decoding="async"
        fetchPriority="low"
      />
      <img
        src={brandAssetUrl(conceptLandingPortEntryUrl)}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 blur-[6px] sm:blur-[8px]",
          LANDING_BG_IMAGE_CLASS,
        )}
        style={{
          WebkitMaskImage: LANDING_BG_BLUR_HARMONIZE_MASK,
          maskImage: LANDING_BG_BLUR_HARMONIZE_MASK,
        }}
        decoding="async"
        fetchPriority="low"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/58 via-background/10 to-background/8" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/40" />
    </div>
  );
}
