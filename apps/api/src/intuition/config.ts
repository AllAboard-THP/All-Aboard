export type IntuitionConfig = {
  /** RPC for the certification publisher; defaults to the testnet public RPC. */
  rpcUrl: string | null;
  /** Intuition Core write key (`ik_…`). Never a wallet private key. */
  apiKey: string | null;
  graphqlUrl: string | null;
  /** Chain id; only testnet `13579` is accepted (ADR 0009 §1). */
  networkId: string | null;
  /**
   * Operator wallet key that signs certification writes. Never logged, API only.
   * Unset: the certification publisher stays off and events wait in the outbox.
   */
  publisherPrivateKey: string | null;
  /** Web origin used in person atoms, e.g. `https://dev.allaboard.fr`. */
  profileOrigin: string | null;
  publisherEnabled: boolean;
  publisherPollMs: number;
};

export function loadIntuitionConfig(
  env: NodeJS.ProcessEnv = process.env,
): IntuitionConfig {
  const pollRaw = env.INTUITION_PUBLISHER_POLL_MS?.trim();
  const pollMs = pollRaw ? Number(pollRaw) : 5_000;
  return {
    rpcUrl: env.INTUITION_RPC_URL?.trim() || null,
    apiKey: env.INTUITION_API_KEY?.trim() || null,
    graphqlUrl: env.INTUITION_GRAPHQL_URL?.trim() || null,
    networkId: env.INTUITION_NETWORK_ID?.trim() || null,
    publisherPrivateKey: env.INTUITION_PUBLISHER_PRIVATE_KEY?.trim() || null,
    profileOrigin:
      env.INTUITION_PROFILE_ORIGIN?.trim() || env.WEB_APP_URL?.trim() || null,
    publisherEnabled: env.INTUITION_PUBLISHER_ENABLED !== "false",
    publisherPollMs: Number.isFinite(pollMs) && pollMs > 0 ? pollMs : 5_000,
  };
}
