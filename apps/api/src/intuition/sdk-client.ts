import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import {
  batchCreateTripleStatements,
  createAtomFromString,
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
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { IntuitionConfig } from "./config.js";

export type PublishHelpRequestResult =
  | {
      mode: "stub";
      externalId: string;
    }
  | {
      mode: "sdk";
      externalId: string;
      transactionHash: string;
      atomTermId: Hex;
      tripleCount: number;
    };

export type IntuitionSdkDeps = {
  createAtomFromString: typeof createAtomFromString;
  batchCreateTripleStatements: typeof batchCreateTripleStatements;
};

const defaultSdkDeps: IntuitionSdkDeps = {
  createAtomFromString,
  batchCreateTripleStatements,
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
  config: IntuitionConfig,
  deps: IntuitionSdkDeps = defaultSdkDeps,
): Promise<PublishHelpRequestResult> {
  const externalId = helpRequestExternalId(payload.id);

  const writeConfig = createIntuitionWriteConfig(config);
  if (!writeConfig) {
    return { mode: "stub", externalId };
  }

  const subject = await deps.createAtomFromString(writeConfig, externalId);
  const subjectTermId = subject.state.termId as Hex;

  const typePredicate = await deps.createAtomFromString(writeConfig, "rdf:type");
  const typeObject = await deps.createAtomFromString(writeConfig, "HelpRequest");
  const titlePredicate = await deps.createAtomFromString(writeConfig, "dc:title");
  const titleObject = await deps.createAtomFromString(
    writeConfig,
    payload.title,
  );
  const authorPredicate = await deps.createAtomFromString(
    writeConfig,
    "allaboard:authorId",
  );
  const authorObject = await deps.createAtomFromString(
    writeConfig,
    payload.authorId,
  );

  const tripleResult = await deps.batchCreateTripleStatements(writeConfig, [
    [subjectTermId, subjectTermId, subjectTermId],
    [
      typePredicate.state.termId as Hex,
      titlePredicate.state.termId as Hex,
      authorPredicate.state.termId as Hex,
    ],
    [
      typeObject.state.termId as Hex,
      titleObject.state.termId as Hex,
      authorObject.state.termId as Hex,
    ],
    [0n, 0n, 0n],
  ]);

  return {
    mode: "sdk",
    externalId,
    transactionHash: tripleResult.transactionHash,
    atomTermId: subjectTermId,
    tripleCount: 3,
  };
}
