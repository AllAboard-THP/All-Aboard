import type { CertificationProof } from "@allaboard/types";

/** Block explorer of the network the publisher writes to (ADR 0009: testnet only). */
const EXPLORER_BY_NETWORK: Record<CertificationProof["network"], string> = {
  "intuition-testnet": "https://testnet.explorer.intuition.systems",
};

/** Explorer link to the transaction that created the +1, when known. */
export function certificationProofUrl(proof: CertificationProof): string | null {
  if (!proof.txHash || !/^0x[0-9a-f]{64}$/i.test(proof.txHash)) return null;
  return `${EXPLORER_BY_NETWORK[proof.network]}/tx/${proof.txHash}`;
}
