import conceptFeedThreeColumnUrl from "../assets/concept-feed-three-column-morning-illustrated.png";

import { cn } from "@allaboard/ui/lib/utils";

/** Bust browser/Vite cache when the canonical Docs asset changes (md5 prefix). */
const FEED_CONCEPT_BG_REVISION = "93b29497";

function brandAssetUrl(asset: string | { src: string }): string {
  const base = typeof asset === "string" ? asset : asset.src;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${FEED_CONCEPT_BG_REVISION}`;
}

/**
 * Feed three-column stage — illustrated morning scene; premium in-scene branding
 * (canonical logo mark on tote, mug, yacht, framed print, small paper plane).
 * Canonical raster: Docs/branding/assets/concept-feed-three-column-morning-illustrated.png
 */
export function FeedConceptBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <img
        src={brandAssetUrl(conceptFeedThreeColumnUrl)}
        alt=""
        className="size-full object-cover object-center brightness-[1.1] saturate-[0.95]"
        decoding="async"
        fetchPriority="low"
      />
      {/* Tri-band: softer rails, brighter central lane (illustrated morning). */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/48 via-background/8 to-background/48" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-background/5" />
    </div>
  );
}

/** Left/right rail — full-width stacked panels on stage background. */
export const FEED_SIDE_RAIL_COLUMN_CLASS =
  "hidden min-w-0 flex-col gap-6 lg:col-span-3 lg:flex lg:w-full lg:gap-7";

/** Center lane — posts fill lane width. */
export const FEED_CENTER_COLUMN_CLASS =
  "col-span-1 flex min-w-0 w-full flex-col items-stretch gap-6 lg:col-span-6 lg:gap-8";

/** 12-col feed grid — balanced gutters (3 · 6 · 3). */
export const FEED_THREE_COLUMN_GRID_CLASS =
  "relative z-10 grid w-full min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-7 lg:gap-y-6";
