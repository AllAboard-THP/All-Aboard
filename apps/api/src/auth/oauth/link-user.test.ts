import { describe, expect, it } from "vitest";
import { linkGoogleUser } from "./link-user.js";
import type { GoogleUserProfile } from "./google-client.js";

const profile: GoogleUserProfile = {
  sub: "google-sub-123",
  email: "newuser@example.com",
  emailVerified: true,
  name: "New User",
  picture: "https://example.com/avatar.png",
};

describe("linkGoogleUser", () => {
  it("returns email_not_verified when Google email is not verified", async () => {
    const db = {} as never;
    const result = await linkGoogleUser(db, {
      ...profile,
      emailVerified: false,
    });
    expect(result).toBe("email_not_verified");
  });
});
