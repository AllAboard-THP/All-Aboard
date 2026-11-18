/**
 * In-process state of the certification publisher, shared with the HTTP
 * routes (`/health`, `/admin/certifications/publisher`). The publisher and the
 * Fastify app are started separately in `index.ts`, so they meet here.
 */
import type { CertificationPublisherStatus } from "@allaboard/types";

/** Under this many tTRUST, the operator wallet needs topping up (ADR 0009 §5). */
export const LOW_BALANCE_THRESHOLD = 1;

/** How often the publisher re-reads the operator balance. */
export const BALANCE_REFRESH_MS = 5 * 60 * 1000;

let status: CertificationPublisherStatus = {
  state: "off",
  reason: "not started",
};

export function getCertificationPublisherStatus(): CertificationPublisherStatus {
  return status;
}

export function setCertificationPublisherStatus(
  next: CertificationPublisherStatus,
): void {
  status = next;
}

export function isLowBalance(balance: string): boolean {
  return Number(balance) < LOW_BALANCE_THRESHOLD;
}
