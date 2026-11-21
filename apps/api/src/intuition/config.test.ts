import { describe, it, expect } from "vitest";
import { loadIntuitionConfig } from "./config.js";
import { createCertificationChain } from "./publisher.js";

describe("loadIntuitionConfig", () => {
  it("defaults publisher enabled with 5s poll", () => {
    const config = loadIntuitionConfig({});
    expect(config.publisherEnabled).toBe(true);
    expect(config.publisherPollMs).toBe(5_000);
    expect(config.rpcUrl).toBeNull();
  });

  it("disables publisher when INTUITION_PUBLISHER_ENABLED=false", () => {
    const config = loadIntuitionConfig({
      INTUITION_PUBLISHER_ENABLED: "false",
    });
    expect(config.publisherEnabled).toBe(false);
  });

  it("reads intuition endpoints from env", () => {
    const config = loadIntuitionConfig({
      INTUITION_RPC_URL: "https://rpc.example",
      INTUITION_GRAPHQL_URL: "https://gql.example",
      INTUITION_NETWORK_ID: "testnet",
      INTUITION_API_KEY: "secret",
    });
    expect(config.rpcUrl).toBe("https://rpc.example");
    expect(config.graphqlUrl).toBe("https://gql.example");
    expect(config.networkId).toBe("testnet");
    expect(config.apiKey).toBe("secret");
  });

  it("reads the publisher key and profile origin, falling back to WEB_APP_URL", () => {
    expect(loadIntuitionConfig({}).publisherPrivateKey).toBeNull();
    const config = loadIntuitionConfig({
      INTUITION_PUBLISHER_PRIVATE_KEY: " 0xabc ",
      WEB_APP_URL: "https://dev.allaboard.fr",
    });
    expect(config.publisherPrivateKey).toBe("0xabc");
    expect(config.profileOrigin).toBe("https://dev.allaboard.fr");
    expect(
      loadIntuitionConfig({
        INTUITION_PROFILE_ORIGIN: "https://allaboard.fr",
        WEB_APP_URL: "http://localhost:3000",
      }).profileOrigin,
    ).toBe("https://allaboard.fr");
  });

  it("keeps the certification publisher off without key or origin, and off the testnet", () => {
    const logs: string[] = [];
    const log = (message: string, meta?: Record<string, unknown>) => {
      logs.push(`${message} ${JSON.stringify(meta)}`);
    };
    const key = `0x${"11".repeat(32)}`;
    expect(createCertificationChain(loadIntuitionConfig({}), log)).toBeNull();
    expect(
      createCertificationChain(
        loadIntuitionConfig({ INTUITION_PUBLISHER_PRIVATE_KEY: key }),
        log,
      ),
    ).toBeNull();
    expect(
      createCertificationChain(
        loadIntuitionConfig({
          INTUITION_PUBLISHER_PRIVATE_KEY: key,
          INTUITION_PROFILE_ORIGIN: "https://dev.allaboard.fr",
          INTUITION_NETWORK_ID: "1155",
        }),
        log,
      ),
    ).toBeNull();
    const chain = createCertificationChain(
      loadIntuitionConfig({
        INTUITION_PUBLISHER_PRIVATE_KEY: key,
        INTUITION_PROFILE_ORIGIN: "https://dev.allaboard.fr",
      }),
      log,
    );
    expect(chain?.operatorAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    // The key never reaches the logs.
    expect(logs.join("\n")).not.toContain("11".repeat(32));
  });
});
