import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-server";

export async function POST(request: Request) {
  const body = await request.text();
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
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
