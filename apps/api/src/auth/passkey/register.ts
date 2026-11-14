import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { z } from "zod";
import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { displayNameFromUser } from "../../lib/user-mappers.js";
import { consumeChallenge, saveChallenge } from "./challenges.js";
import {
  insertPasskey,
  listPasskeysForUser,
} from "./credentials.js";
import {
  webauthnOrigins,
  webauthnRpId,
  webauthnRpName,
} from "./config.js";

export const passkeyRegisterOptionsBodySchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(256).optional(),
  acceptCgu: z.literal(true).optional(),
});

export type PasskeyRegisterOptionsBody = z.infer<
  typeof passkeyRegisterOptionsBodySchema
>;

export type PasskeyRegisterOptionsResult =
  | PublicKeyCredentialCreationOptionsJSON
  | "invalid_body"
  | "email_taken"
  | "cgu_required"
  | "database_unavailable";

export async function createPasskeyRegistrationOptions(
  db: AppDatabase,
  body: PasskeyRegisterOptionsBody,
): Promise<PasskeyRegisterOptionsResult> {
  const fullName = body.fullName.trim();
  const email = body.email?.trim().toLowerCase();

  if (email) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) return "email_taken";
  }

  if (body.acceptCgu !== true) {
    return "cgu_required";
  }

  const webauthnUserId = randomUUID();
  const options = await generateRegistrationOptions({
    rpName: webauthnRpName(),
    rpID: webauthnRpId(),
    userName: email ?? fullName,
    userDisplayName: fullName,
    userID: new TextEncoder().encode(webauthnUserId),
    attestationType: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  await saveChallenge(db, {
    challenge: options.challenge,
    type: "registration",
    userId: null,
    metadata: {
      fullName,
      email,
      acceptCgu: body.acceptCgu,
      webauthnUserId,
    },
  });

  return options;
}

export async function createPasskeyRegistrationOptionsForExistingUser(
  db: AppDatabase,
  userId: string,
): Promise<
  PublicKeyCredentialCreationOptionsJSON | "user_not_found" | "database_unavailable"
> {
  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = userRows[0];
  if (!user) return "user_not_found";

  const existingPasskeys = await listPasskeysForUser(db, userId);
  let webauthnUserId = existingPasskeys[0]?.webauthnUserId;
  if (!webauthnUserId) {
    webauthnUserId = randomUUID();
  }

  const displayName = displayNameFromUser(user);

  const options = await generateRegistrationOptions({
    rpName: webauthnRpName(),
    rpID: webauthnRpId(),
    userName: user.email,
    userDisplayName: displayName,
    userID: new TextEncoder().encode(webauthnUserId),
    attestationType: "none",
    excludeCredentials: existingPasskeys.map((pk) => ({
      id: pk.credentialId,
      transports: pk.transports,
    })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  await saveChallenge(db, {
    challenge: options.challenge,
    type: "registration",
    userId,
    metadata: {
      mode: "add",
      webauthnUserId,
    },
  });

  return options;
}

export type PasskeyRegisterVerifyResult =
  | { userId: string; role: UserRole; verified: true }
  | "invalid_body"
  | "verification_failed"
  | "challenge_expired"
  | "email_taken"
  | "database_unavailable";

export async function verifyPasskeyRegistration(
  db: AppDatabase,
  response: RegistrationResponseJSON,
): Promise<PasskeyRegisterVerifyResult> {
  let expectedChallenge: string;
  try {
    const clientData = JSON.parse(
      Buffer.from(response.response.clientDataJSON, "base64url").toString(
        "utf8",
      ),
    ) as { challenge?: string };
    if (!clientData.challenge) return "invalid_body";
    expectedChallenge = clientData.challenge;
  } catch {
    return "invalid_body";
  }

  const challengeRecord = await consumeChallenge(
    db,
    expectedChallenge,
    "registration",
  );
  if (!challengeRecord) return "challenge_expired";

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: webauthnOrigins(),
      expectedRPID: webauthnRpId(),
    });
  } catch {
    return "verification_failed";
  }

  if (!verification.verified || !verification.registrationInfo) {
    return "verification_failed";
  }

  if (
    challengeRecord.userId &&
    challengeRecord.metadata?.mode === "add"
  ) {
    const userRows = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, challengeRecord.userId))
      .limit(1);
    const user = userRows[0];
    if (!user) return "verification_failed";

    const { credential, credentialDeviceType, credentialBackedUp, aaguid } =
      verification.registrationInfo;

    await insertPasskey(db, {
      userId: user.id,
      credentialId: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      aaguid: aaguid ?? undefined,
      webauthnUserId: challengeRecord.metadata.webauthnUserId,
    });

    return { userId: user.id, role: user.role, verified: true };
  }

  const metadata = challengeRecord.metadata;
  if (!metadata?.fullName) return "verification_failed";

  const email =
    metadata.email?.trim().toLowerCase() ??
    `${metadata.webauthnUserId}@passkey.local`;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) return "email_taken";

  const now = new Date();
  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash: null,
      role: "student",
      fullName: metadata.fullName.trim(),
      cguAcceptedAt: metadata.acceptCgu ? now : null,
      updatedAt: now,
    })
    .returning({ id: users.id, role: users.role });

  const user = inserted[0];
  if (!user) return "database_unavailable";

  const { credential, credentialDeviceType, credentialBackedUp, aaguid } =
    verification.registrationInfo;

  await insertPasskey(db, {
    userId: user.id,
    credentialId: credential.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: credential.transports,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    aaguid: aaguid ?? undefined,
    webauthnUserId: metadata.webauthnUserId,
  });

  return { userId: user.id, role: user.role, verified: true };
}
