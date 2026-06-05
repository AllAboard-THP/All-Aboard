/** Horizontal padding for full-bleed landing chrome (logo left, auth actions right). */
export const LANDING_EDGE_PADDING_CLASS =
  "w-full px-4 sm:pl-5 sm:pr-6 lg:pl-8 lg:pr-10 xl:pl-10 xl:pr-14";

/** Lighter glass for landing header/footer — see .landing-chrome in globals.css. */
export const LANDING_GLASS_CHROME_CLASS = "landing-chrome border-white/10";

/** Landing header/footer — brightness highlight on hover only. */
export const LANDING_CHROME_HOVER_HIGHLIGHT_CLASS =
  "transition-[filter] duration-200 ease-out hover:brightness-110 motion-reduce:transition-none";

/** Fixed app header shell (landing + in-app pages). */
export const APP_CHROME_HEADER_CLASS = `fixed top-0 z-50 w-full border-b ${LANDING_GLASS_CHROME_CLASS} ${LANDING_CHROME_HOVER_HIGHLIGHT_CLASS}`;

/** App footer chrome (landing + in-app pages). */
export const APP_CHROME_FOOTER_CLASS = `${LANDING_GLASS_CHROME_CLASS} ${LANDING_CHROME_HOVER_HIGHLIGHT_CLASS}`;

/** Header inner row — same alignment as `LandingPublicHeader`. */
export const APP_CHROME_HEADER_ROW_CLASS =
  `flex min-h-[4.25rem] w-full items-center justify-between gap-4 py-2 sm:min-h-[4.5rem] ${LANDING_EDGE_PADDING_CLASS}`;

/** Footer inner row — same alignment as landing shell footer. */
export const APP_CHROME_FOOTER_ROW_CLASS =
  `flex w-full flex-col items-center justify-between gap-4 md:flex-row ${LANDING_EDGE_PADDING_CLASS}`;

/** Offset below fixed header (logo + tagline) — landing hero / shell. */
export const LANDING_HEADER_OFFSET_CLASS = "pt-[4.75rem] sm:pt-20";

/** In-app main — header clearance + extra gap before body cards (feed, resources, …). */
export const APP_CHROME_MAIN_OFFSET_CLASS = "pt-[6rem] sm:pt-24";

/** Main landmark below fixed header (edge padding + optional inner max width). */
export const APP_CHROME_MAIN_CLASS = `flex-1 w-full ${APP_CHROME_MAIN_OFFSET_CLASS} ${LANDING_EDGE_PADDING_CLASS}`;

/** Feed main — balanced side padding (between flush rails and heavy gutters). */
export const APP_CHROME_FEED_EDGE_PADDING_CLASS =
  "w-full px-4 sm:px-5 lg:px-6 xl:px-8";

export const APP_CHROME_FEED_MAIN_CLASS = `flex-1 w-full ${APP_CHROME_MAIN_OFFSET_CLASS} ${APP_CHROME_FEED_EDGE_PADDING_CLASS}`;

export const APP_CHROME_MAIN_INNER_CLASS = "mx-auto w-full max-w-7xl";

/** Feed three-column — wide stage with a soft max width. */
export const APP_CHROME_FEED_INNER_CLASS = "mx-auto w-full min-w-0 max-w-[100rem]";

/** Shell footer spacing aligned with landing. */
export const APP_CHROME_FOOTER_SHELL_CLASS =
  "mt-auto shrink-0 border-t border-white/5 py-6 sm:py-8";

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

/** Hero title + subtitle — see `.landing-hero-hover-zoom` in globals.css. */
export const LANDING_HERO_HOVER_ZOOM_CLASS = "landing-hero-hover-zoom";

export const LANDING_HERO_HEADING_CLASS =
  `text-[clamp(2rem,5vw,4rem)] leading-[1.08] ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

export const LANDING_HERO_DESCRIPTION_CLASS =
  `landing-hero-description text-lg leading-relaxed sm:text-xl ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

/** Landing + feed glass cards — `.landing-glass-card` (glass, saturation, subtle hover zoom). */
export const LANDING_GLASS_CARD_CLASS =
  "landing-glass-card motion-reduce:transition-none";

/** Feed side rails — darker glass for illustrated stage readability. */
export const FEED_STAGE_GLASS_CARD_CLASS =
  "feed-stage-glass-card motion-reduce:transition-none";

/** Feed post cards — slightly darker than rails (code + thread). */
export const FEED_POST_GLASS_CARD_CLASS =
  "feed-post-glass-card motion-reduce:transition-none";

/** Rail list rows — scaled closer to center post typography. */
export const FEED_RAIL_LIST_ITEM_CLASS =
  "w-full rounded-2xl bg-white/5 p-5 text-left transition-colors hover:bg-white/10 lg:p-6";

/** Login card — same glass + hover as feed panels. */
export const LANDING_LOGIN_CARD_CLASS = LANDING_GLASS_CARD_CLASS;

/** Glass pill fields — `.landing-glass-input` in globals.css (minimal white highlight on hover/focus). */
export const LANDING_GLASS_INPUT_CLASS =
  "landing-glass-input h-10 rounded-xl sm:h-11 focus-visible:ring-0";

/** Collapsible feed thread inside unified post card — see globals.css `.feed-thread-panel`. */
export const FEED_POST_THREAD_PANEL_CLASS = "feed-thread-panel";

export const FEED_POST_THREAD_PANEL_OPEN_CLASS = "feed-thread-panel--open";

export const FEED_POST_THREAD_INNER_CLASS = "feed-thread-panel__inner";

export const FEED_COMMENT_ITEM_CLASS = "feed-comment-item";

export const FEED_COMMENT_ITEM_NEW_CLASS = "feed-comment-item--new";

export const FEED_REPLY_FOOTER_CLASS = "feed-reply-footer";
