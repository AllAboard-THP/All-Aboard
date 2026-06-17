import { NextResponse } from "next/server";
import {
  getApiBaseUrl,
  parseResourcesListResponse,
} from "@/lib/api-server";
import { relayAuthenticatedFetch, upstreamQuerySuffix } from "@/lib/bff-relay";

export async function GET(request: Request) {
  const url = `${getApiBaseUrl()}/resources${upstreamQuerySuffix(request)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 502 });
    }
    try {
      const data = parseResourcesListResponse(json);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "invalid shape" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  return relayAuthenticatedFetch("/resources", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}
