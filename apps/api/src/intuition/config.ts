export type IntuitionConfig = {
  rpcUrl: string | null;
  apiKey: string | null;
  graphqlUrl: string | null;
  networkId: string | null;
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
    publisherEnabled: env.INTUITION_PUBLISHER_ENABLED !== "false",
    publisherPollMs: Number.isFinite(pollMs) && pollMs > 0 ? pollMs : 5_000,
  };
}
