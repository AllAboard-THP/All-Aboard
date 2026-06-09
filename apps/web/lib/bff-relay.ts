import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export function missingTokenResponse(): NextResponse {
  return NextResponse.json({ error: "missing_token" }, { status: 401 });
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
