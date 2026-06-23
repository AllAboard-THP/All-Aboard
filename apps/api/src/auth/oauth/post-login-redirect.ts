export function buildPostOAuthRedirectUrl(
  webAppUrl: string,
  cguAcceptedAt: Date | null | undefined,
): string {
  const base = webAppUrl.replace(/\/$/, "");
  const path = cguAcceptedAt ? "/feed" : "/onboarding";
  return `${base}${path}`;
}

export function buildOAuthErrorRedirectUrl(webAppUrl: string): string {
  const base = webAppUrl.replace(/\/$/, "");
  return `${base}/?auth_error=oauth_failed`;
}
