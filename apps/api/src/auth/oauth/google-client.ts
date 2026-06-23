import type { GoogleOAuthConfig } from "./google-config.js";

/** Aligned with `@fastify/oauth2` `GOOGLE_CONFIGURATION`. */
const GOOGLE_AUTH_HOST = "https://accounts.google.com";
const GOOGLE_AUTH_PATH = "/o/oauth2/v2/auth";
const GOOGLE_TOKEN_HOST = "https://www.googleapis.com";
const GOOGLE_TOKEN_PATH = "/oauth2/v4/token";

const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleUserProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
};

export function buildGoogleAuthorizationUrl(
  config: GoogleOAuthConfig,
  state: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_HOST}${GOOGLE_AUTH_PATH}?${params.toString()}`;
}

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeGoogleAuthorizationCode(
  config: GoogleOAuthConfig,
  code: string,
  codeVerifier: string,
): Promise<{ accessToken: string } | "token_exchange_failed"> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: config.callbackUrl,
  });

  const res = await fetch(
    `${GOOGLE_TOKEN_HOST}${GOOGLE_TOKEN_PATH}`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok || !data.access_token) {
    return "token_exchange_failed";
  }
  return { accessToken: data.access_token };
}

type GoogleUserInfoResponse = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function fetchGoogleUserProfile(
  accessToken: string,
): Promise<GoogleUserProfile | "profile_fetch_failed"> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "profile_fetch_failed";

  const data = (await res.json()) as GoogleUserInfoResponse;
  if (
    typeof data.sub !== "string" ||
    typeof data.email !== "string" ||
    data.email_verified !== true
  ) {
    return "profile_fetch_failed";
  }

  return {
    sub: data.sub,
    email: data.email.trim().toLowerCase(),
    emailVerified: true,
    name: typeof data.name === "string" ? data.name : undefined,
    picture: typeof data.picture === "string" ? data.picture : undefined,
  };
}
