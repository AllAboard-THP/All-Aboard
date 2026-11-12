import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";

/**
 * Help requests stay in Postgres: they are never written on-chain.
 * Web3 scope is certifications only (Docs/product/certifications.md).
 */
export type PublishHelpRequestResult = {
  mode: "stub";
  externalId: string;
};

export function helpRequestExternalId(helpRequestId: string): string {
  return `help_request:${helpRequestId}`;
}

export async function publishHelpRequestCreatedToIntuition(
  payload: HelpRequestCreatedOutboxPayload,
): Promise<PublishHelpRequestResult> {
  return { mode: "stub", externalId: helpRequestExternalId(payload.id) };
}
