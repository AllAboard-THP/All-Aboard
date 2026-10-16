import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { consumeChallenge, saveChallenge } from "./challenges.js";
import {
  findPasskeyByCredentialId,
  updatePasskeyCounter,
} from "./credentials.js";
import {
  webauthnOrigins,
  webauthnRpId,
} from "./config.js";

export async function createPasskeyAuthenticationOptions(
  db: AppDatabase,
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const options = await generateAuthenticationOptions({
    rpID: webauthnRpId(),
    allowCredentials: [],
    userVerification: "required",
  });

  await saveChallenge(db, {
    challenge: options.challenge,
    type: "authentication",
    userId: null,
  });

  return options;
}

export type PasskeyLoginVerifyResult =
  | { userId: string; role: UserRole; verified: true }
  | "invalid_body"
  | "verification_failed"
  | "challenge_expired"
  | "credential_not_found"
  | "user_not_found";

function parseChallengeFromAuthResponse(
  response: AuthenticationResponseJSON,
): string | null {
  try {
    const clientData = JSON.parse(
      Buffer.from(response.response.clientDataJSON, "base64url").toString(
        "utf8",
      ),
    ) as { challenge?: string };
    return clientData.challenge ?? null;
  } catch {
    return null;
  }
}

export async function verifyPasskeyAuthentication(
  db: AppDatabase,
  response: AuthenticationResponseJSON,
): Promise<PasskeyLoginVerifyResult> {
  const expectedChallenge = parseChallengeFromAuthResponse(response);
  if (!expectedChallenge) return "invalid_body";

  const challengeRecord = await consumeChallenge(
    db,
    expectedChallenge,
    "authentication",
  );
  if (!challengeRecord) return "challenge_expired";

  const passkey = await findPasskeyByCredentialId(db, response.id);
  if (!passkey) return "credential_not_found";

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: webauthnOrigins(),
      expectedRPID: webauthnRpId(),
      credential: {
        id: passkey.credentialId,
        publicKey: passkey.publicKey as Uint8Array<ArrayBuffer>,
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });
  } catch {
    return "verification_failed";
  }

  if (!verification.verified) return "verification_failed";

  await updatePasskeyCounter(
    db,
    passkey.id,
    verification.authenticationInfo.newCounter,
  );

  const userRows = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, passkey.userId))
    .limit(1);
  const user = userRows[0];
  if (!user) return "user_not_found";

  return { userId: user.id, role: user.role, verified: true };
}
