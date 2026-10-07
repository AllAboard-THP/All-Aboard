import { NextResponse } from "next/server";
import {
  getApiBaseUrl,
  parseMentorDashboardResponse,
} from "@/lib/api-server";
import { getAccessToken, missingTokenResponse } from "@/lib/bff-relay";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }

  const url = `${getApiBaseUrl()}/mentor/dashboard`;
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
      const data = parseMentorDashboardResponse(json);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "invalid shape" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
