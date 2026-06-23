/** Default post-auth redirect for email/password and OAuth (aligned with API). */
export const DEFAULT_EMAIL_POST_LOGIN_PATH = "/feed";

/** Canonical home for authenticated product navigation. */
export const APP_HOME_PATH = "/dashboard/demo";

/** Default post-auth redirect when no returnTo is provided (passkey login). */
export const DEFAULT_POST_LOGIN_PATH = APP_HOME_PATH;
