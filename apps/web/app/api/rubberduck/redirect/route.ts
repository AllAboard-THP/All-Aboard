import { NextResponse } from "next/server";

/** BFF — URL Rubberduck (service externe) ; jamais exposée via `NEXT_PUBLIC_`. */
export async function GET() {
  const raw = process.env.RUBBERDUCK_URL?.trim();
  const url = raw && raw.length > 0 ? raw : null;
  return NextResponse.json({ url });
}
