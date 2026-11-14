import { describe, it, expect } from "vitest";
import { loadIntuitionConfig } from "./config.js";

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
});
