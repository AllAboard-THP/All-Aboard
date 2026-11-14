import { eq } from "drizzle-orm";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import type { AppDatabase } from "../../db/client.js";
import { webauthnCredentials } from "../../db/schema.js";

export type StoredPasskey = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  deviceType: string | null;
  backedUp: boolean;
  aaguid: string | null;
  webauthnUserId: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
};

function encodePublicKey(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function decodePublicKey(encoded: string): Uint8Array {
  return new Uint8Array(Buffer.from(encoded, "base64url"));
}

function rowToStoredPasskey(
  row: typeof webauthnCredentials.$inferSelect,
): StoredPasskey {
  return {
    id: row.id,
    userId: row.userId,
    credentialId: row.credentialId,
    publicKey: decodePublicKey(row.publicKey),
    counter: row.counter,
    transports: (row.transports ?? undefined) as
      | AuthenticatorTransportFuture[]
      | undefined,
    deviceType: row.deviceType,
    backedUp: row.backedUp,
    aaguid: row.aaguid,
    webauthnUserId: row.webauthnUserId,
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
  };
}

export async function listPasskeysForUser(
  db: AppDatabase,
  userId: string,
): Promise<StoredPasskey[]> {
  const rows = await db
    .select()
    .from(webauthnCredentials)
    .where(eq(webauthnCredentials.userId, userId));
  return rows.map(rowToStoredPasskey);
}

export async function findPasskeyByCredentialId(
  db: AppDatabase,
  credentialId: string,
): Promise<StoredPasskey | null> {
  const rows = await db
    .select()
    .from(webauthnCredentials)
    .where(eq(webauthnCredentials.credentialId, credentialId))
    .limit(1);
  const row = rows[0];
  return row ? rowToStoredPasskey(row) : null;
}

export async function insertPasskey(
  db: AppDatabase,
  params: {
    userId: string;
    credentialId: string;
    publicKey: Uint8Array;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
    deviceType: string;
    backedUp: boolean;
    aaguid?: string;
    webauthnUserId?: string;
  },
): Promise<StoredPasskey> {
  const inserted = await db
    .insert(webauthnCredentials)
    .values({
      userId: params.userId,
      credentialId: params.credentialId,
      publicKey: encodePublicKey(params.publicKey),
      counter: params.counter,
      transports: params.transports ?? null,
      deviceType: params.deviceType,
      backedUp: params.backedUp,
      aaguid: params.aaguid ?? null,
      webauthnUserId: params.webauthnUserId ?? null,
    })
    .returning();
  const row = inserted[0];
  if (!row) throw new Error("passkey_insert_failed");
  return rowToStoredPasskey(row);
}

export async function updatePasskeyCounter(
  db: AppDatabase,
  credentialDbId: string,
  counter: number,
): Promise<void> {
  await db
    .update(webauthnCredentials)
    .set({ counter, lastUsedAt: new Date() })
    .where(eq(webauthnCredentials.id, credentialDbId));
}

export async function deletePasskeyForUser(
  db: AppDatabase,
  passkeyId: string,
  userId: string,
): Promise<"deleted" | "not_found" | "forbidden"> {
  const rows = await db
    .select()
    .from(webauthnCredentials)
    .where(eq(webauthnCredentials.id, passkeyId))
    .limit(1);
  const row = rows[0];
  if (!row) return "not_found";
  if (row.userId !== userId) return "forbidden";

  await db
    .delete(webauthnCredentials)
    .where(eq(webauthnCredentials.id, passkeyId));
  return "deleted";
}
