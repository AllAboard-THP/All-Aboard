import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import type {
  PasskeyLoginVerifyResponse,
  PasskeyRegisterOptionsBody,
  PasskeyRegisterVerifyResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function fetchPasskeyLoginOptions(): Promise<unknown> {
  const res = await fetch("/api/auth/passkey/login/options", {
    method: "POST",
    credentials: "include",
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  const data = JSON.parse(text) as { options: unknown };
  return data.options;
}

export async function registerPasskey(
  body: PasskeyRegisterOptionsBody,
): Promise<PasskeyRegisterVerifyResponse> {
  const optionsRes = await fetch("/api/auth/passkey/register/options", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const optionsText = await optionsRes.text();
  if (!optionsRes.ok) {
    throwFromApiResponse(optionsRes.status, optionsText);
  }
  const { options } = JSON.parse(optionsText) as { options: unknown };

  const registrationResponse = await startRegistration({
    optionsJSON: options as Parameters<
      typeof startRegistration
    >[0]["optionsJSON"],
  });

  const verifyRes = await fetch("/api/auth/passkey/register/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(registrationResponse),
  });
  const verifyText = await verifyRes.text();
  if (!verifyRes.ok) {
    throwFromApiResponse(verifyRes.status, verifyText);
  }
  return JSON.parse(verifyText) as PasskeyRegisterVerifyResponse;
}

export async function verifyPasskeyLoginResponse(
  authResponse: Awaited<ReturnType<typeof startAuthentication>>,
): Promise<PasskeyLoginVerifyResponse> {
  const verifyRes = await fetch("/api/auth/passkey/login/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(authResponse),
  });
  const verifyText = await verifyRes.text();
  if (!verifyRes.ok) {
    throwFromApiResponse(verifyRes.status, verifyText);
  }
  return JSON.parse(verifyText) as PasskeyLoginVerifyResponse;
}

export async function loginWithPasskey(
  options?: unknown,
): Promise<PasskeyLoginVerifyResponse> {
  const loginOptions = options ?? (await fetchPasskeyLoginOptions());

  const authResponse = await startAuthentication({
    optionsJSON: loginOptions as Parameters<
      typeof startAuthentication
    >[0]["optionsJSON"],
  });

  return verifyPasskeyLoginResponse(authResponse);
}
