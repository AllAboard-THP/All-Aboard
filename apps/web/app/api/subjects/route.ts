import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api-server";

/** BFF for subject catalogue (profile subject picker, explore). */
export async function GET() {
  const url = `${getApiBaseUrl()}/subjects`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
