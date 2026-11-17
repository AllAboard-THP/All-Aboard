/**
 * Intuition MultiVault client for the certification publisher (ADR 0009 §1).
 * The only file that holds a signer. Testnet only: any other chain id throws.
 */
import {
  getMultiVaultAddressFromChainId,
  intuitionTestnet,
  MultiVaultAbi,
} from "@0xintuition/deployments";
import {
  multiVaultCreateAtoms,
  multiVaultCreateTriples,
} from "@0xintuition/protocol";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  stringToHex,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const INTUITION_TESTNET_CHAIN_ID = 13579;

export type TripleSpec = { subjectId: Hex; predicateId: Hex; objectId: Hex };

export type TxReceipt = { hash: Hex; blockNumber: bigint };

/** What the publisher needs from the chain; tests use an in-memory fake. */
export type IntuitionChain = {
  operatorAddress: Hex;
  isTermCreated(id: Hex): Promise<boolean>;
  /** Creates atoms from their exact strings, pays the atom cost, waits for the receipt. */
  createAtoms(data: string[]): Promise<TxReceipt>;
  /** Creates triples, pays the triple cost, waits for the receipt. */
  createTriples(triples: TripleSpec[]): Promise<TxReceipt>;
  /** Operator balance, in the network token (tTRUST on testnet). */
  balance(): Promise<string>;
};

export function createIntuitionChain(options: {
  privateKey: string;
  rpcUrl?: string | null;
  networkId?: string | null;
}): IntuitionChain {
  const chainId = options.networkId
    ? Number(options.networkId)
    : INTUITION_TESTNET_CHAIN_ID;
  if (chainId !== INTUITION_TESTNET_CHAIN_ID) {
    throw new Error(
      `Intuition publisher runs on testnet ${INTUITION_TESTNET_CHAIN_ID} only (ADR 0009); got ${options.networkId}`,
    );
  }
  const key = options.privateKey.trim();
  const account = privateKeyToAccount(
    (key.startsWith("0x") ? key : `0x${key}`) as Hex,
  );
  const transport = http(options.rpcUrl ?? undefined);
  const publicClient = createPublicClient({ chain: intuitionTestnet, transport });
  const walletClient = createWalletClient({
    chain: intuitionTestnet,
    transport,
    account,
  });
  const address = getMultiVaultAddressFromChainId(intuitionTestnet.id) as Hex;
  const config = { address, walletClient, publicClient };

  async function read<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return (await publicClient.readContract({
      address,
      abi: MultiVaultAbi,
      functionName,
      args,
    } as never)) as T;
  }

  async function confirm(hash: Hex, label: string): Promise<TxReceipt> {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`${label} transaction reverted: ${hash}`);
    }
    return { hash, blockNumber: receipt.blockNumber };
  }

  async function assertChain(): Promise<void> {
    const actual = await publicClient.getChainId();
    if (actual !== INTUITION_TESTNET_CHAIN_ID) {
      throw new Error(`RPC is on chain ${actual}, expected testnet ${INTUITION_TESTNET_CHAIN_ID}`);
    }
  }

  return {
    operatorAddress: account.address,
    isTermCreated: (id) => read<boolean>("isTermCreated", [id]),
    async createAtoms(data) {
      await assertChain();
      const cost = await read<bigint>("getAtomCost");
      const hash = await multiVaultCreateAtoms(config as never, {
        args: [data.map((item) => stringToHex(item)), data.map(() => cost)],
        value: cost * BigInt(data.length),
      } as never);
      return confirm(hash as Hex, "createAtoms");
    },
    async createTriples(triples) {
      await assertChain();
      const cost = await read<bigint>("getTripleCost");
      const hash = await multiVaultCreateTriples(config as never, {
        args: [
          triples.map((t) => t.subjectId),
          triples.map((t) => t.predicateId),
          triples.map((t) => t.objectId),
          triples.map(() => cost),
        ],
        value: cost * BigInt(triples.length),
      } as never);
      return confirm(hash as Hex, "createTriples");
    },
    async balance() {
      return formatEther(await publicClient.getBalance({ address: account.address }));
    },
  };
}
