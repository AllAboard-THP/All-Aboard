import conceptFeedHeroUrl from "../assets/concept-feed-hero.png";

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
 * Canonical raster: packages/ui/src/assets/concept-feed-hero.png
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
        src={brandAssetUrl(conceptFeedHeroUrl)}
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

/** Left/right rail — centered in outer tri-band lanes (not flush to viewport). */
export const FEED_SIDE_RAIL_COLUMN_CLASS =
  "hidden min-w-0 flex-col gap-6 lg:flex lg:w-full lg:max-w-[21rem] lg:gap-7 xl:max-w-[23rem]";

/** Left rail — sits in the left band, inset from the edge. */
export const FEED_LEFT_RAIL_COLUMN_CLASS = cn(
  FEED_SIDE_RAIL_COLUMN_CLASS,
  "lg:justify-self-center lg:pl-2 xl:pl-4",
);

/** Right rail — sits in the right band, inset from the edge. */
export const FEED_RIGHT_RAIL_COLUMN_CLASS = cn(
  FEED_SIDE_RAIL_COLUMN_CLASS,
  "lg:justify-self-center lg:pr-2 xl:pr-4",
);

/** Rail panel — natural height. */
export const FEED_SIDE_RAIL_PANEL_CLASS = "flex w-full flex-col";

/** Center lane — moderate width; balanced with side rails. */
export const FEED_CENTER_COLUMN_CLASS =
  "col-span-1 flex min-w-0 w-full max-w-3xl flex-col items-stretch gap-8 justify-self-center lg:max-w-[42rem] lg:gap-10 xl:gap-11";

/**
 * Tri-band grid — outer `1fr` lanes + moderate gutters (between tight 3·6·3 and edge-flush).
 */
export const FEED_THREE_COLUMN_GRID_CLASS =
  "relative z-10 grid w-full min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)] lg:gap-x-9 lg:gap-y-6 xl:gap-x-12 2xl:gap-x-16";
