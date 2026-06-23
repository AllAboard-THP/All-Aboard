import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api-server";
import {
  relayJsonResponse,
  relayJsonWithCookies,
  relayRedirectWithCookies,
} from "@/lib/bff-relay";

function isUpstreamUnreachable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as NodeJS.ErrnoException).code;
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    error.message.includes("fetch failed")
  );
}

export function upstreamUnavailableResponse(): NextResponse {
  return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
}

/** POST JSON to API with Set-Cookie relay; returns 503 when API process is down. */
export async function postJsonWithCookies(
  upstreamPath: string,
  body: string,
): Promise<NextResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${upstreamPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    return relayJsonWithCookies(res);
  } catch (error) {
    if (isUpstreamUnreachable(error)) {
      return upstreamUnavailableResponse();
    }
    throw error;
  }
}

/** POST JSON to API; returns 503 when API process is down. */
export async function postJson(
  upstreamPath: string,
  body: string,
): Promise<NextResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${upstreamPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    return relayJsonResponse(res);
  } catch (error) {
    if (isUpstreamUnreachable(error)) {
      return upstreamUnavailableResponse();
    }
    throw error;
  }
}

/** GET upstream with optional init; returns 503 when API process is down. */
export async function getUpstream(
  upstreamPath: string,
  init?: RequestInit,
): Promise<NextResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}${upstreamPath}`, init);
    return relayJsonResponse(res);
  } catch (error) {
    if (isUpstreamUnreachable(error)) {
      return upstreamUnavailableResponse();
    }
    throw error;
  }
}

/** Manual redirect relay (OAuth callback); returns 503 when API process is down. */
export async function getUpstreamRedirect(
  upstreamUrl: string,
): Promise<NextResponse> {
  try {
    const res = await fetch(upstreamUrl, { redirect: "manual" });
    return relayRedirectWithCookies(res);
  } catch (error) {
    if (isUpstreamUnreachable(error)) {
      return upstreamUnavailableResponse();
    }
    throw error;
  }
}
