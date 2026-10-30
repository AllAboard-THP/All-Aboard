import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl, parseHelpRequestDetailResponse } from "@/lib/api-server";
import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const incoming = new URL(request.url);
  const filterByCertifications =
    incoming.searchParams.get("filterByCertifications") === "true";
  const qs = filterByCertifications ? "?filterByCertifications=true" : "";
  const url = `${getApiBaseUrl()}/help-requests/${encodeURIComponent(id)}${qs}`;

  const headers: HeadersInit = { cache: "no-store" };
  if (filterByCertifications) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "missing_token" }, { status: 401 });
    }
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    if (res.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!res.ok) {
      return new NextResponse(text, {
        status: res.status >= 500 ? 502 : res.status,
        headers: {
          "content-type":
            res.headers.get("content-type") ?? "application/json; charset=utf-8",
        },
      });
    }
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 502 });
    }
    try {
      const data = parseHelpRequestDetailResponse(json);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "invalid shape" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/help-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/help-requests/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
