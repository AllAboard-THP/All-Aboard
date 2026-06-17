import { NextResponse } from "next/server";
import {
  getApiBaseUrl,
  parseMessagesListResponse,
} from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayAuthenticatedFetch,
  upstreamQuerySuffix,
} from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }

  const { id } = await context.params;
  const url = `${getApiBaseUrl()}/conversations/${encodeURIComponent(id)}/messages${upstreamQuerySuffix(request)}`;
  try {
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "content-type":
            res.headers.get("content-type") ?? "application/json; charset=utf-8",
        },
      });
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 502 });
    }
    try {
      const data = parseMessagesListResponse(json);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "invalid shape" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/conversations/${encodeURIComponent(id)}/messages`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    },
  );
}
