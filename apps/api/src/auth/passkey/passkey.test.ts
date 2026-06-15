import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

const mockGenerateRegistrationOptions = vi.fn();
const mockVerifyRegistrationResponse = vi.fn();
const mockGenerateAuthenticationOptions = vi.fn();
const mockVerifyAuthenticationResponse = vi.fn();

vi.mock("@simplewebauthn/server", () => ({
  generateRegistrationOptions: (...args: unknown[]) =>
    mockGenerateRegistrationOptions(...args),
  verifyRegistrationResponse: (...args: unknown[]) =>
    mockVerifyRegistrationResponse(...args),
  generateAuthenticationOptions: (...args: unknown[]) =>
    mockGenerateAuthenticationOptions(...args),
  verifyAuthenticationResponse: (...args: unknown[]) =>
    mockVerifyAuthenticationResponse(...args),
}));

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../../app";
import { insertPasskey } from "./credentials";
import { users } from "../../db/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function clientDataJson(challenge: string): string {
  return Buffer.from(JSON.stringify({ challenge, type: "webauthn.create" })).toString(
    "base64url",
  );
}

function authClientDataJson(challenge: string): string {
  return Buffer.from(
    JSON.stringify({ challenge, type: "webauthn.get" }),
  ).toString("base64url");
}

describe.skipIf(!process.env.DATABASE_URL)("passkey auth", () => {
  let pool: pg.Pool;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.WEBAUTHN_RP_ID = "localhost";
    process.env.WEBAUTHN_RP_NAME = "All-Aboard Test";
    process.env.WEBAUTHN_ORIGINS = "http://localhost:3000";
    process.env.JWT_SECRET = "test-jwt-secret-min-32-characters!!";

    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "../../drizzle"),
    });
    app = await buildApp({ pool });
  });

  afterEach(async () => {
    await app.close();
    await pool.end();
  });

  it("POST /auth/passkey/register/options returns options when CGU accepted", async () => {
    mockGenerateRegistrationOptions.mockResolvedValue({
      challenge: "reg-challenge-abc",
      rp: { name: "All-Aboard Test", id: "localhost" },
      user: { id: "dXNlcg", name: "Test User", displayName: "Test User" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/auth/passkey/register/options",
      payload: {
        fullName: "Passkey User",
        email: `passkey-${Date.now()}@dev.local`,
        acceptCgu: true,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { options: { challenge: string } };
    expect(body.options.challenge).toBe("reg-challenge-abc");
    expect(mockGenerateRegistrationOptions).toHaveBeenCalledOnce();
  });

  it("POST /auth/passkey/register/options returns 400 without acceptCgu", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/passkey/register/options",
      payload: { fullName: "No CGU" },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload) as { error: string };
    expect(body.error).toBe("cgu_required");
  });

  it("POST /auth/passkey/register/verify creates user and issues JWT", async () => {
    const challenge = "verify-reg-challenge";
    mockGenerateRegistrationOptions.mockResolvedValue({
      challenge,
      rp: { name: "All-Aboard Test", id: "localhost" },
      user: { id: "dXNlcg", name: "Verify User", displayName: "Verify User" },
    });

    const email = `verified-${Date.now()}@dev.local`;
    const optionsRes = await app.inject({
      method: "POST",
      url: "/auth/passkey/register/options",
      payload: { fullName: "Verify User", email, acceptCgu: true },
    });
    expect(optionsRes.statusCode).toBe(200);

    mockVerifyRegistrationResponse.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: "cred-id-mock",
          publicKey: new Uint8Array([1, 2, 3]),
          counter: 0,
          transports: ["internal"],
        },
        credentialDeviceType: "singleDevice",
        credentialBackedUp: false,
        aaguid: "00000000-0000-0000-0000-000000000000",
      },
    });

    const registrationResponse = {
      id: "cred-id-mock",
      rawId: "cred-id-mock",
      type: "public-key",
      response: {
        clientDataJSON: clientDataJson(challenge),
        attestationObject: "mock-attestation",
      },
      clientExtensionResults: {},
    } satisfies RegistrationResponseJSON;

    const verifyRes = await app.inject({
      method: "POST",
      url: "/auth/passkey/register/verify",
      payload: registrationResponse,
    });

    expect(verifyRes.statusCode).toBe(200);
    const body = JSON.parse(verifyRes.payload) as {
      ok: boolean;
      userId: string;
      role: string;
    };
    expect(body.ok).toBe(true);
    expect(body.role).toBe("student");
    expect(body.userId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(verifyRes.headers["set-cookie"]).toBeDefined();
  });

  it("POST /auth/passkey/login/verify issues JWT for existing credential", async () => {
    const db = drizzle(pool);
    const email = `login-${Date.now()}@dev.local`;
    const inserted = await db
      .insert(users)
      .values({
        email,
        passwordHash: null,
        role: "student",
        fullName: "Login Passkey",
      })
      .returning({ id: users.id });
    const userId = inserted[0]!.id;

    await insertPasskey(db, {
      userId,
      credentialId: "login-cred-id",
      publicKey: new Uint8Array([9, 9, 9]),
      counter: 0,
      deviceType: "singleDevice",
      backedUp: false,
    });

    const challenge = "login-challenge-xyz";
    mockGenerateAuthenticationOptions.mockResolvedValue({
      challenge,
      rpId: "localhost",
      allowCredentials: [],
    });

    const optionsRes = await app.inject({
      method: "POST",
      url: "/auth/passkey/login/options",
    });
    expect(optionsRes.statusCode).toBe(200);

    mockVerifyAuthenticationResponse.mockResolvedValue({
      verified: true,
      authenticationInfo: {
        newCounter: 1,
      },
    });

    const authResponse = {
      id: "login-cred-id",
      rawId: "login-cred-id",
      type: "public-key",
      response: {
        clientDataJSON: authClientDataJson(challenge),
        authenticatorData: "mock-auth-data",
        signature: "mock-signature",
      },
      clientExtensionResults: {},
    } satisfies AuthenticationResponseJSON;

    const verifyRes = await app.inject({
      method: "POST",
      url: "/auth/passkey/login/verify",
      payload: authResponse,
    });

    expect(verifyRes.statusCode).toBe(200);
    const body = JSON.parse(verifyRes.payload) as { userId: string; role: string };
    expect(body.userId).toBe(userId);
    expect(body.role).toBe("student");
  });

  it("GET /auth/passkey/credentials lists passkeys for authenticated user", async () => {
    const db = drizzle(pool);
    const email = `creds-${Date.now()}@dev.local`;
    const inserted = await db
      .insert(users)
      .values({
        email,
        passwordHash: null,
        role: "student",
        fullName: "Cred List",
      })
      .returning({ id: users.id });
    const userId = inserted[0]!.id;

    await insertPasskey(db, {
      userId,
      credentialId: "listed-cred",
      publicKey: new Uint8Array([4, 4, 4]),
      counter: 2,
      deviceType: "multiDevice",
      backedUp: true,
      transports: ["internal"],
    });

    const token = app.jwt.sign({ sub: userId, role: "student" });
    const res = await app.inject({
      method: "GET",
      url: "/auth/passkey/credentials",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      items: Array<{ credentialId: string; backedUp: boolean }>;
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.credentialId).toBe("listed-cred");
    expect(body.items[0]?.backedUp).toBe(true);
  });
});
