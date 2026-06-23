import conceptLandingHeroPngUrl from "../assets/concept-landing-hero.png";
import conceptLandingHeroWebpUrl from "../assets/concept-landing-hero.webp";

import { cn } from "@allaboard/ui/lib/utils";

/** Bust browser/Vite cache when the canonical Docs asset changes (md5 prefix). */
const LANDING_CONCEPT_BG_REVISION = "fd8d3f6f";

const LANDING_CONCEPT_WIDTH = 2700;
const LANDING_CONCEPT_HEIGHT = 1800;

function brandAssetUrl(asset: string | { src: string }): string {
  const base = typeof asset === "string" ? asset : asset.src;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${LANDING_CONCEPT_BG_REVISION}`;
}

const LANDING_BG_IMAGE_CLASS =
  "size-full object-cover object-[42%_40%] brightness-[0.96] saturate-[1.02]";

/**
 * Landing hero — mural photo (2700×1800); fixed full-viewport cover under header/footer glass.
 * Canonical: packages/ui/src/assets/concept-landing-hero.{webp,png}
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
      <picture>
        <source
          srcSet={brandAssetUrl(conceptLandingHeroWebpUrl)}
          type="image/webp"
        />
        <img
          src={brandAssetUrl(conceptLandingHeroPngUrl)}
          alt=""
          width={LANDING_CONCEPT_WIDTH}
          height={LANDING_CONCEPT_HEIGHT}
          sizes="100vw"
          className={LANDING_BG_IMAGE_CLASS}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-background/58 via-background/10 to-background/8" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/40" />
    </div>
  );
}
