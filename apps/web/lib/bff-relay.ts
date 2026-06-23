import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-server";

/** Relaie le corps JSON et le status upstream (routes authentifiées ou publiques). */
export function relayJsonResponse(res: Response): NextResponse {
  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}

/** Relaie corps + en-têtes Set-Cookie (login, register, logout). */
export function relayJsonWithCookies(res: Response): NextResponse {
  const out = new NextResponse(res.body, { status: res.status });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    out.headers.append("Set-Cookie", c);
  }
  const ct = res.headers.get("content-type");
  if (ct) {
    out.headers.set("content-type", ct);
  }
  return out;
}

/** Relaie redirect upstream + Set-Cookie (OAuth callback). */
export function relayRedirectWithCookies(res: Response): NextResponse {
  const location = res.headers.get("location");
  const out = new NextResponse(null, {
    status: res.status === 200 ? 302 : res.status,
    headers: location ? { location } : undefined,
  });
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    out.headers.append("Set-Cookie", c);
  }
  return out;
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export function missingTokenResponse(): NextResponse {
  return NextResponse.json({ error: "missing_token" }, { status: 401 });
}

/** Forwards the incoming request query string to an upstream path. */
export function upstreamQuerySuffix(request: Request): string {
  const qs = new URL(request.url).searchParams.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

/** Authenticated relay — Bearer from `access_token` cookie. */
export async function relayAuthenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }
  const extra =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : ((init.headers as Record<string, string> | undefined) ?? {});
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...extra,
      authorization: `Bearer ${token}`,
    },
  });
  return relayJsonResponse(res);
}

/** Public GET relay with query string passthrough. */
export async function relayPublicGet(
  request: Request,
  upstreamPath: string,
): Promise<NextResponse> {
  const res = await fetch(
    `${getApiBaseUrl()}${upstreamPath}${upstreamQuerySuffix(request)}`,
    { cache: "no-store" },
  );
  return relayJsonResponse(res);
}

/** POST JSON relay (no auth). */
export async function relayPostJson(
  upstreamPath: string,
  body: string,
): Promise<NextResponse> {
  const res = await fetch(`${getApiBaseUrl()}${upstreamPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return relayJsonResponse(res);
}

/** POST JSON relay that forwards upstream Set-Cookie (auth verify). */
export async function relayPostJsonWithCookies(
  upstreamPath: string,
  body: string,
): Promise<NextResponse> {
  const res = await fetch(`${getApiBaseUrl()}${upstreamPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return relayJsonWithCookies(res);
}
