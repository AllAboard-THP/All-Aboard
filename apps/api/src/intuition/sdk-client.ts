import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import {
  getMultiVaultAddressFromChainId,
  intuitionMainnet,
  intuitionTestnet,
  type WriteConfig,
} from "@0xintuition/sdk";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { IntuitionConfig } from "./config.js";

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

export function isIntuitionPublishConfigured(
  config: IntuitionConfig,
): boolean {
  return Boolean(config.rpcUrl?.trim() && config.apiKey?.trim());
}

export function resolveIntuitionChain(networkId: string | null): Chain {
  if (!networkId) return intuitionTestnet;

  const normalized = networkId.trim().toLowerCase();
  if (normalized === "testnet" || normalized === "13579") {
    return intuitionTestnet;
  }
  if (normalized === "mainnet" || normalized === "1155") {
    return intuitionMainnet;
  }

  const parsed = Number(networkId);
  if (parsed === intuitionTestnet.id) return intuitionTestnet;
  if (parsed === intuitionMainnet.id) return intuitionMainnet;

  throw new Error(`Unsupported INTUITION_NETWORK_ID: ${networkId}`);
}

function normalizePrivateKey(apiKey: string): `0x${string}` {
  const trimmed = apiKey.trim();
  return (trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`) as `0x${string}`;
}

export function createIntuitionWriteConfig(
  config: IntuitionConfig,
): WriteConfig | null {
  if (!isIntuitionPublishConfigured(config)) return null;

  const chain = resolveIntuitionChain(config.networkId);
  const rpcUrl = config.rpcUrl!.trim();
  const account = privateKeyToAccount(normalizePrivateKey(config.apiKey!));
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ chain, transport, account });
  const address = getMultiVaultAddressFromChainId(chain.id);

  return { address, publicClient, walletClient };
}

export async function publishHelpRequestCreatedToIntuition(
  payload: HelpRequestCreatedOutboxPayload,
): Promise<PublishHelpRequestResult> {
  return { mode: "stub", externalId: helpRequestExternalId(payload.id) };
}
