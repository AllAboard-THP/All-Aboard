export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  webAppUrl: string;
};

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const callbackUrl = process.env.OAUTH_GOOGLE_CALLBACK_URL?.trim();
  const webAppUrl = process.env.WEB_APP_URL?.trim();
  if (!clientId || !clientSecret || !callbackUrl || !webAppUrl) {
    return null;
  }
  return { clientId, clientSecret, callbackUrl, webAppUrl };
}

export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthConfig() !== null;
}
