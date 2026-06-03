/** Horizontal padding for full-bleed landing chrome (logo left, auth actions right). */
export const LANDING_EDGE_PADDING_CLASS =
  "w-full px-4 sm:pl-5 sm:pr-6 lg:pl-8 lg:pr-10 xl:pl-10 xl:pr-14";

/** Lighter glass for landing header/footer — see .landing-chrome in globals.css. */
export const LANDING_GLASS_CHROME_CLASS = "landing-chrome border-white/10";

/** Offset below fixed landing header (logo + tagline). */
export const LANDING_HEADER_OFFSET_CLASS = "pt-[4.75rem] sm:pt-20";

/** Tagline under wordmark — same stack as UI, no chrome / no eyebrow caps. */
export const LANDING_HEADER_TAGLINE_CLASS =
  "text-xs font-normal leading-snug tracking-normal text-muted-foreground normal-case sm:text-sm";

/** Symmetric horizontal padding for landing hero (equal left/right gutters). */
export const LANDING_HERO_PADDING_CLASS =
  "px-4 sm:px-6 lg:px-8 xl:px-12";

/** Hero fills viewport between header and footer. */
export const LANDING_HERO_SECTION_CLASS =
  "relative flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6 lg:py-8";

/** Centered hero block — even edge space without column overlap. */
export const LANDING_HERO_CONTAINER_CLASS =
  "mx-auto flex w-full min-h-0 max-w-6xl flex-col justify-center xl:max-w-7xl lg:min-h-[calc(100dvh-13.5rem)]";

export const LANDING_HERO_GRID_CLASS =
  "grid w-full min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12";

/** Left column copy — shared UI typography. */
export const LANDING_HERO_COPY_CLASS =
  "flex min-w-0 flex-col gap-5 sm:gap-6 lg:max-w-2xl";

export const LANDING_HERO_HEADING_CLASS =
  "text-[clamp(2rem,5vw,4rem)] leading-[1.08]";

export const LANDING_HERO_DESCRIPTION_CLASS =
  "text-lg leading-relaxed text-muted-foreground sm:text-xl";

/** Login card — zoom + glow on hover. */
export const LANDING_LOGIN_CARD_CLASS =
  "origin-center transition-[transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.02] hover:border-white/25 hover:shadow-[0_0_1.5rem_rgb(99_102_241/0.45)] motion-reduce:transition-none motion-reduce:hover:scale-100";

/** Inner login controls — highlight only, no scale. */
export const LANDING_LOGIN_INNER_HIGHLIGHT_CLASS =
  "transition-[filter,background-color,border-color,box-shadow,color] duration-200 ease-out hover:brightness-110";

export const LANDING_LOGIN_INPUT_HIGHLIGHT_CLASS =
  "transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_0.75rem_rgb(99_102_241/0.35)] focus-visible:border-white/30 focus-visible:bg-white/10";
