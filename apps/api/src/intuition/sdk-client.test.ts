import { describe, it, expect, vi } from "vitest";
import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import { intuitionMainnet, intuitionTestnet } from "@0xintuition/sdk";
import {
  createIntuitionWriteConfig,
  helpRequestExternalId,
  isIntuitionPublishConfigured,
  publishHelpRequestCreatedToIntuition,
  resolveIntuitionChain,
  type IntuitionSdkDeps,
} from "./sdk-client.js";
import type { IntuitionConfig } from "./config.js";

const payload: HelpRequestCreatedOutboxPayload = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "Need help with React hooks",
  authorId: "alice@dev.local",
  tags: ["react"],
};

const configuredConfig: IntuitionConfig = {
  rpcUrl: "https://testnet.rpc.intuition.systems/http",
  apiKey: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  graphqlUrl: null,
  networkId: "testnet",
  publisherEnabled: true,
  publisherPollMs: 5_000,
};

function mockAtom(termId: string) {
  return {
    uri: "mock",
    transactionHash: "0xabc" as const,
    state: { termId },
  };
}

function mockSdkDeps(): IntuitionSdkDeps {
  const createAtomFromString = vi.fn(async (_config, label: string) => {
    return mockAtom(`0x${label.length.toString(16).padStart(64, "0")}`);
  });
  const batchCreateTripleStatements = vi.fn(async () => ({
    transactionHash: "0xtriple" as const,
    state: [],
  }));
  return { createAtomFromString, batchCreateTripleStatements };
}

describe("helpRequestExternalId", () => {
  it("prefixes help request UUID", () => {
    expect(helpRequestExternalId(payload.id)).toBe(
      "help_request:00000000-0000-0000-0000-000000000001",
    );
  });
});

describe("isIntuitionPublishConfigured", () => {
  it("requires rpc url and api key", () => {
    expect(
      isIntuitionPublishConfigured({
        ...configuredConfig,
        rpcUrl: null,
      }),
    ).toBe(false);
    expect(
      isIntuitionPublishConfigured({
        ...configuredConfig,
        apiKey: null,
      }),
    ).toBe(false);
    expect(isIntuitionPublishConfigured(configuredConfig)).toBe(true);
  });
});

describe("resolveIntuitionChain", () => {
  it("maps known network ids", () => {
    expect(resolveIntuitionChain(null).id).toBe(intuitionTestnet.id);
    expect(resolveIntuitionChain("testnet").id).toBe(intuitionTestnet.id);
    expect(resolveIntuitionChain("13579").id).toBe(intuitionTestnet.id);
    expect(resolveIntuitionChain("mainnet").id).toBe(intuitionMainnet.id);
    expect(resolveIntuitionChain("1155").id).toBe(intuitionMainnet.id);
  });

  it("rejects unknown network ids", () => {
    expect(() => resolveIntuitionChain("unknown")).toThrow(
      "Unsupported INTUITION_NETWORK_ID",
    );
  });
});

describe("createIntuitionWriteConfig", () => {
  it("returns null when credentials are missing", () => {
    expect(
      createIntuitionWriteConfig({
        ...configuredConfig,
        apiKey: null,
      }),
    ).toBeNull();
  });

  it("builds viem clients when configured", () => {
    const writeConfig = createIntuitionWriteConfig(configuredConfig);
    expect(writeConfig).not.toBeNull();
    expect(writeConfig?.walletClient.account?.address).toMatch(/^0x/i);
  });
});

describe("publishHelpRequestCreatedToIntuition", () => {
  it("returns stub mode without credentials", async () => {
    const result = await publishHelpRequestCreatedToIntuition(payload, {
      ...configuredConfig,
      rpcUrl: null,
    });
    expect(result).toEqual({
      mode: "stub",
      externalId: helpRequestExternalId(payload.id),
    });
  });

  it("creates subject atom and triple batch when configured", async () => {
    const deps = mockSdkDeps();
    const result = await publishHelpRequestCreatedToIntuition(
      payload,
      configuredConfig,
      deps,
    );

    expect(result.mode).toBe("sdk");
    if (result.mode !== "sdk") return;

    expect(result.externalId).toBe(helpRequestExternalId(payload.id));
    expect(result.transactionHash).toBe("0xtriple");
    expect(result.tripleCount).toBe(3);
    expect(deps.createAtomFromString).toHaveBeenCalledTimes(7);
    expect(deps.batchCreateTripleStatements).toHaveBeenCalledOnce();
  });
});
