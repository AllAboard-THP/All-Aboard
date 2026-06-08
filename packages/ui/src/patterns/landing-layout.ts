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

/** Symmetric horizontal padding for landing hero — aligned with header/footer edges. */
export const LANDING_HERO_PADDING_CLASS = LANDING_EDGE_PADDING_CLASS;

/** Hero fills viewport between header and footer — vertically centered in main. */
export const LANDING_HERO_SECTION_CLASS =
  "relative flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6";

/** Landing body — hero stage (auth-grid + vertical center + chrome-aligned padding). */
export const LANDING_HERO_BODY_CLASS = `auth-grid ${LANDING_HERO_SECTION_CLASS} ${LANDING_HERO_PADDING_CLASS}`;

/** Hero grid wrapper — stretches to fill shell main so copy can pin pills to the bottom. */
export const LANDING_HERO_CONTAINER_CLASS =
  "flex w-full min-h-0 flex-1 items-center";

export const LANDING_HERO_GRID_CLASS =
  "grid w-full min-h-0 min-w-0 flex-1 items-stretch gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-x-16 lg:py-2 xl:gap-x-24 2xl:gap-x-32";

/** Left column — fills grid row height; copy spread top-to-bottom on large screens. */
export const LANDING_HERO_COPY_CLASS =
  "flex min-h-0 min-w-0 flex-col gap-6 sm:gap-8 lg:h-full lg:justify-between lg:gap-10 xl:gap-12";

/** Eyebrow + title + description stack. */
export const LANDING_HERO_COPY_TOP_CLASS =
  "flex flex-col gap-5 sm:gap-6 lg:gap-7 xl:gap-8";

/** Feature pills — single horizontal row (wraps only on narrow viewports). */
export const LANDING_HERO_PILLS_CLASS =
  "flex flex-row flex-wrap gap-2.5 sm:gap-3 lg:flex-nowrap lg:gap-3.5 lg:shrink-0";

/** Right column — login card pinned to the outer edge, vertically centered with copy. */
export const LANDING_HERO_LOGIN_COLUMN_CLASS =
  "flex min-w-0 w-full items-center justify-center sm:justify-end lg:h-full";

/** Hero title + subtitle — see `.landing-hero-hover-zoom` in globals.css. */
export const LANDING_HERO_HOVER_ZOOM_CLASS = "landing-hero-hover-zoom";

export const LANDING_HERO_HEADING_CLASS =
  `text-[clamp(2.5rem,4.8vw,5.25rem)] leading-[1.05] ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

export const LANDING_HERO_DESCRIPTION_CLASS =
  `landing-hero-description text-pretty text-xl leading-relaxed sm:text-2xl lg:text-[clamp(1.125rem,1.35vw,1.5rem)] ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

/** Auth card width — login (square) and forgot-password (auto height). */
export const LANDING_AUTH_CARD_WIDTH_CLASS =
  "ml-auto w-full max-w-[min(100%,22rem)] sm:max-w-[24rem] lg:max-w-[26rem]";

/** Login card — square footprint within the hero right column. */
export const LANDING_LOGIN_CARD_WIDTH_CLASS = `aspect-square ${LANDING_AUTH_CARD_WIDTH_CLASS}`;

/** Login card inner layout — centered stack inside the square. */
export const LANDING_LOGIN_CARD_LAYOUT_CLASS =
  "flex shrink-0 flex-col justify-center gap-5 rounded-[2rem] border-white/10 p-6 shadow-none sm:gap-6 sm:p-7 lg:p-8";

/** Canonical glass surface — `.app-glass-card` in globals.css (feed search rail style). */
export const APP_GLASS_CARD_CLASS =
  "app-glass-card motion-reduce:transition-none";

/** @deprecated Use APP_GLASS_CARD_CLASS — kept for existing imports. */
export const LANDING_GLASS_CARD_CLASS = APP_GLASS_CARD_CLASS;

/** @deprecated Use APP_GLASS_CARD_CLASS — kept for existing imports. */
export const FEED_STAGE_GLASS_CARD_CLASS = APP_GLASS_CARD_CLASS;

/** @deprecated Use APP_GLASS_CARD_CLASS — kept for existing imports. */
export const FEED_POST_GLASS_CARD_CLASS = APP_GLASS_CARD_CLASS;

/** Rail list rows — scaled closer to center post typography. */
export const FEED_RAIL_LIST_ITEM_CLASS =
  "w-full rounded-2xl bg-white/5 p-5 text-left transition-colors hover:bg-white/10 lg:p-6";

/** Login card — same glass + hover as feed panels. */
export const LANDING_LOGIN_CARD_CLASS = LANDING_GLASS_CARD_CLASS;

/** Glass pill fields — `.landing-glass-input` in globals.css (minimal white highlight on hover/focus). */
export const LANDING_GLASS_INPUT_CLASS =
  "landing-glass-input h-11 rounded-xl sm:h-12 focus-visible:ring-0";

/** Collapsible feed thread inside unified post card — see globals.css `.feed-thread-panel`. */
export const FEED_POST_THREAD_PANEL_CLASS = "feed-thread-panel";

export const FEED_POST_THREAD_PANEL_OPEN_CLASS = "feed-thread-panel--open";

export const FEED_POST_THREAD_INNER_CLASS = "feed-thread-panel__inner";

export const FEED_COMMENT_ITEM_CLASS = "feed-comment-item";

export const FEED_COMMENT_ITEM_NEW_CLASS = "feed-comment-item--new";

export const FEED_REPLY_FOOTER_CLASS = "feed-reply-footer";
