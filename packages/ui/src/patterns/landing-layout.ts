/** Horizontal padding for full-bleed landing chrome (logo left, auth actions right). */
export const LANDING_EDGE_PADDING_CLASS =
  "w-full px-4 sm:pl-5 sm:pr-6 lg:pl-8 lg:pr-10 xl:pl-10 xl:pr-14";

/** Root wrapper for in-app pages on `AppAbstractBackground` (standard landing glass applies). */
export const APP_STAGE_CLASS = "app-stage";

/**
 * Canonical app chrome — header, footer, brand, offsets.
 * Single source of truth: all MVP pages MUST use these constants or
 * `AppChromeHeader` / `AppChromeFooter` / `AppChromeBrand` from `app-chrome-shell.tsx`.
 * See `.cursor/rules/app-chrome-shell.mdc` and `Docs/design-system/app-shell.md`.
 */

/** @deprecated Prefer APP_SHELL_*_CHROME_CLASS — lighter legacy glass (`.landing-chrome`). */
export const LANDING_GLASS_CHROME_CLASS = "landing-chrome border-white/10";

/** Landing shell chrome — Connexion-card glass surface (`.landing-shell-chrome`). */
export const LANDING_SHELL_GLASS_MOTION_CLASS = "motion-reduce:transition-none";

/** Shared header glass — same surface as landing Connexion card + shell. */
export const APP_SHELL_HEADER_CHROME_CLASS = `landing-shell-chrome landing-shell-chrome--header ${LANDING_SHELL_GLASS_MOTION_CLASS}`;

/** Shared footer glass — same surface as landing Connexion card + shell. */
export const APP_SHELL_FOOTER_CHROME_CLASS = `landing-shell-chrome landing-shell-chrome--footer ${LANDING_SHELL_GLASS_MOTION_CLASS}`;

/** Shared sidebar glass — same surface, right-edge separator on desktop. */
export const APP_SHELL_SIDEBAR_CHROME_CLASS = `landing-shell-chrome landing-shell-chrome--sidebar ${LANDING_SHELL_GLASS_MOTION_CLASS}`;

/** Collapsed rail width (icon-only). */
export const APP_SIDEBAR_WIDTH_COLLAPSED = "4rem";

/** Expanded drawer width — primary navigation + context panel. */
export const APP_SIDEBAR_WIDTH_EXPANDED = "18rem";

/** Header grid column synced with `--app-sidebar-width` (set by AppSidebarProvider). */
export const APP_SIDEBAR_GRID_CLASS = "md:grid-cols-[var(--app-sidebar-width)_minmax(0,1fr)]";

/**
 * Header grid when sidebar is present — leading column grows with brand (logo + wordmark)
 * even if the sidebar rail is collapsed to icon width.
 */
export const APP_CHROME_HEADER_SIDEBAR_GRID_CLASS =
  "md:grid-cols-[minmax(var(--app-sidebar-width),max-content)_minmax(0,1fr)]";

/** Sidebar shell width transition — see `.app-sidebar-shell` in globals.css. */
export const APP_SIDEBAR_SHELL_CLASS = "app-sidebar-shell w-full md:w-[var(--app-sidebar-width)]";

/** @deprecated Use `.landing-shell-chrome:hover` — kept for one-off imports. */
export const LANDING_CHROME_HOVER_HIGHLIGHT_CLASS =
  "transition-[filter] duration-200 ease-out hover:brightness-110 motion-reduce:transition-none";

/** Fixed app header shell (feed + in-app pages). */
export const APP_CHROME_HEADER_CLASS = `fixed top-0 z-50 w-full ${APP_SHELL_HEADER_CHROME_CLASS}`;

/** Landing shell header — same glass as Connexion card. */
export const LANDING_SHELL_HEADER_CLASS = `fixed top-0 z-50 w-full ${APP_SHELL_HEADER_CHROME_CLASS}`;

/** App footer chrome (feed + in-app pages). */
export const APP_CHROME_FOOTER_CLASS = APP_SHELL_FOOTER_CHROME_CLASS;

/** Landing shell footer — same glass as Connexion card. */
export const LANDING_SHELL_FOOTER_CLASS = APP_SHELL_FOOTER_CHROME_CLASS;

/** Landing header auth — ghost link; glass hover (no purple accent fill). */
export const LANDING_HEADER_GHOST_BUTTON_CLASS = "rounded-full";

/** Landing header auth — outline pill on glass chrome. */
export const LANDING_HEADER_OUTLINE_BUTTON_CLASS =
  "min-w-[7.5rem] rounded-full px-4";

/** Landing header auth — active sign-up pill (matches Connexion card CTA). */
export const LANDING_HEADER_SUBMIT_BUTTON_CLASS =
  "min-w-[7.5rem] h-8 rounded-full px-4 text-sm font-semibold";

/** Header inner row — same alignment as `LandingPublicHeader`. */
export const APP_CHROME_HEADER_ROW_CLASS =
  `flex min-h-[4.25rem] w-full items-center justify-between gap-4 sm:min-h-[4.75rem] ${LANDING_EDGE_PADDING_CLASS}`;

/** Header brand mark — portrait SVG; height-led sizing keeps aspect ratio. */
export const APP_CHROME_BRAND_MARK_CLASS = "h-12 w-auto shrink-0 sm:h-14";

/** Header brand wordmark — gradient logotype beside mark. */
export const APP_CHROME_BRAND_WORDMARK_CLASS =
  "app-chrome-brand-wordmark gradient-text min-w-0 text-2xl font-bold tracking-tight sm:text-3xl";

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

/** Hero fills viewport between header and footer — vertically centered. */
export const LANDING_HERO_SECTION_CLASS =
  "relative flex min-h-0 flex-1 flex-col justify-center py-4 sm:py-6";

/** Landing body — hero stage (auth-grid + vertical center + chrome-aligned padding). */
export const LANDING_HERO_BODY_CLASS = `auth-grid ${LANDING_HERO_SECTION_CLASS} ${LANDING_HERO_PADDING_CLASS}`;

/** Hero grid wrapper — full-width stage between header and footer. */
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

/** Feature pills — horizontal row under description area. */
export const LANDING_HERO_PILLS_CLASS =
  "flex flex-row flex-wrap gap-2.5 sm:gap-3 lg:flex-nowrap lg:gap-3.5 lg:shrink-0";

/** Right column — centers the login slot in the grid cell (horizontal + vertical). */
export const LANDING_HERO_LOGIN_COLUMN_CLASS =
  "grid min-w-0 w-full items-center justify-items-center lg:min-h-full lg:justify-items-end";

/** Fixed-width slot so the card can center (avoid `w-full` on the card itself). */
export const LANDING_HERO_LOGIN_SLOT_CLASS =
  "w-[min(100%,28rem)] sm:w-[30rem] lg:w-[34rem] xl:w-[36rem]";

/** Hero title + subtitle — see `.landing-hero-hover-zoom` in globals.css. */
export const LANDING_HERO_HOVER_ZOOM_CLASS = "landing-hero-hover-zoom";

export const LANDING_HERO_HEADING_CLASS =
  `text-[clamp(2.5rem,4.8vw,5.25rem)] leading-[1.05] ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

export const LANDING_HERO_DESCRIPTION_CLASS =
  `landing-hero-description text-pretty text-xl leading-relaxed sm:text-2xl lg:text-[clamp(1.125rem,1.35vw,1.5rem)] ${LANDING_HERO_HOVER_ZOOM_CLASS}`;

/** Auth card width — fills its parent slot (`LANDING_HERO_LOGIN_SLOT_CLASS` on landing). */
export const LANDING_AUTH_CARD_WIDTH_CLASS = "w-full";

/** Login card — auto height (Google OAuth adds footer content). */
export const LANDING_LOGIN_CARD_WIDTH_CLASS = LANDING_AUTH_CARD_WIDTH_CLASS;

/** Login card inner layout. */
export const LANDING_LOGIN_CARD_LAYOUT_CLASS =
  "flex shrink-0 flex-col justify-center gap-5 rounded-[2rem] border-white/10 p-6 shadow-none sm:gap-6 sm:p-8 lg:gap-7 lg:p-10";

/** Register card — denser than login so the full form fits without inner scroll. */
export const REGISTER_LANDING_CARD_LAYOUT_CLASS =
  "flex shrink-0 flex-col justify-center gap-3 rounded-[2rem] border-white/10 p-5 shadow-none sm:gap-4 sm:p-6 lg:p-7";

/** Register page card width — compact generic signup form. */
export const REGISTER_LANDING_CARD_WIDTH_CLASS = "w-full max-w-lg";

/** Canonical glass surface — `.app-glass-card` in globals.css (feed search rail style). */
export const APP_GLASS_CARD_CLASS =
  "app-glass-card motion-reduce:transition-none";

/** Landing Connexion card — glass surface (see `.landing-auth-glass-surface` in globals.css). */
export const LANDING_AUTH_GLASS_CARD_CLASS =
  "landing-auth-glass-surface landing-auth-glass-card motion-reduce:transition-none";

/** @deprecated Use LANDING_AUTH_GLASS_CARD_CLASS on landing; APP_GLASS_CARD_CLASS elsewhere. */
export const LANDING_GLASS_CARD_CLASS = LANDING_AUTH_GLASS_CARD_CLASS;

/** @deprecated Use APP_GLASS_CARD_CLASS — kept for existing imports. */
export const FEED_STAGE_GLASS_CARD_CLASS = APP_GLASS_CARD_CLASS;

/** @deprecated Use APP_GLASS_CARD_CLASS — kept for existing imports. */
export const FEED_POST_GLASS_CARD_CLASS = APP_GLASS_CARD_CLASS;

/** Rail list rows — scaled closer to center post typography. */
export const FEED_RAIL_LIST_ITEM_CLASS =
  "w-full rounded-2xl bg-white/5 p-5 text-left transition-colors hover:bg-white/10 lg:p-6";

/** Login card — landing light glass (not feed `.app-glass-card`). */
export const LANDING_LOGIN_CARD_CLASS = LANDING_AUTH_GLASS_CARD_CLASS;

/** Glass pill fields — `.landing-glass-input` in globals.css (minimal white highlight on hover/focus). */
export const LANDING_GLASS_INPUT_CLASS =
  "landing-glass-input h-11 rounded-xl sm:h-12 focus-visible:ring-0";

/** Register fields — compact height to avoid card scroll on auth aux pages. */
export const REGISTER_LANDING_INPUT_CLASS =
  "landing-glass-input h-10 rounded-xl focus-visible:ring-0";

/** Landing auth primary CTA — glass pill (`.landing-glass-button`), aligned with inputs. */
export const LANDING_AUTH_SUBMIT_BUTTON_CLASS =
  "h-12 w-full rounded-2xl font-semibold";

/** Register CGU row — nudged right to align with input columns above. */
export const REGISTER_LANDING_CGU_ROW_CLASS =
  "mx-auto w-full max-w-md pl-4 sm:pl-5";

/** Auth landing field labels — slight inset for visual comfort above glass inputs. */
export const AUTH_LANDING_LABEL_INSET_CLASS = "pl-3 sm:pl-4";

/** Register submit — full-width glass CTA with readable disabled state. */
export const REGISTER_LANDING_SUBMIT_BUTTON_CLASS =
  "h-11 w-full rounded-2xl font-semibold disabled:opacity-100 disabled:border-white/15 disabled:bg-white/[0.03] disabled:text-muted-foreground/60";

/** Google / secondary auth CTA on landing — same glass surface as submit. */
export const LANDING_GLASS_BUTTON_CLASS = "landing-glass-button";

/** Collapsible feed thread inside unified post card — see globals.css `.feed-thread-panel`. */
export const FEED_POST_THREAD_PANEL_CLASS = "feed-thread-panel";

export const FEED_POST_THREAD_PANEL_OPEN_CLASS = "feed-thread-panel--open";

export const FEED_POST_THREAD_INNER_CLASS = "feed-thread-panel__inner";

export const FEED_COMMENT_ITEM_CLASS = "feed-comment-item";

export const FEED_COMMENT_ITEM_NEW_CLASS = "feed-comment-item--new";

export const FEED_REPLY_FOOTER_CLASS = "feed-reply-footer";
