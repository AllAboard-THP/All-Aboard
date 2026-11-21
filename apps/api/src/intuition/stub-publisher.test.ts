import { describe, it, expect } from "vitest";
import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import {
  helpRequestExternalId,
  publishHelpRequestCreatedToIntuition,
} from "./stub-publisher.js";

const payload: HelpRequestCreatedOutboxPayload = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "Need help with React hooks",
  authorId: "alice@dev.local",
  tags: ["react"],
};

describe("helpRequestExternalId", () => {
  it("prefixes help request UUID", () => {
    expect(helpRequestExternalId(payload.id)).toBe(
      "help_request:00000000-0000-0000-0000-000000000001",
    );
  });
});

describe("publishHelpRequestCreatedToIntuition", () => {
  it("never writes help requests on-chain", async () => {
    const result = await publishHelpRequestCreatedToIntuition(payload);
    expect(result).toEqual({
      mode: "stub",
      externalId: helpRequestExternalId(payload.id),
    });
  });
});
