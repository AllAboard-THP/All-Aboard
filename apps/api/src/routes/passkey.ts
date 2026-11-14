import type { FastifyInstance } from "fastify";
import type {
  PasskeyCredentialListResponse,
  PasskeyLoginOptionsResponse,
  PasskeyLoginVerifyResponse,
  PasskeyRegisterOptionsResponse,
  PasskeyRegisterVerifyResponse,
} from "@allaboard/types";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { issueAuthToken } from "../auth/session.js";
import {
  createPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from "../auth/passkey/login.js";
import {
  createPasskeyRegistrationOptions,
  createPasskeyRegistrationOptionsForExistingUser,
  passkeyRegisterOptionsBodySchema,
  verifyPasskeyRegistration,
} from "../auth/passkey/register.js";
import {
  deletePasskeyForUser,
  listPasskeysForUser,
} from "../auth/passkey/credentials.js";
import type { AppDatabase } from "../db/client.js";
import {
  getJwtUser,
  resolveAuthenticatedUser,
} from "../lib/auth-helpers.js";

export function registerPasskeyRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post("/auth/passkey/register/options", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        await request.jwtVerify();
        const jwtUser = getJwtUser(request);
        const authUser = await resolveAuthenticatedUser(
          db,
          jwtUser.sub,
          jwtUser.role,
        );
        if (authUser) {
          const addResult = await createPasskeyRegistrationOptionsForExistingUser(
            db,
            authUser.id,
          );
          if (addResult === "user_not_found") {
            return reply.code(404).send({ error: "user_not_found" });
          }
          if (addResult === "database_unavailable") {
            return reply.code(503).send({ error: "database_unavailable" });
          }
          return { options: addResult } satisfies PasskeyRegisterOptionsResponse;
        }
      } catch {
        // Invalid or expired token — fall through to signup flow.
      }
    }

    const parsed = passkeyRegisterOptionsBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    const result = await createPasskeyRegistrationOptions(db, parsed.data);
    if (result === "invalid_body") {
      return reply.code(400).send({ error: "invalid_body" });
    }
    if (result === "email_taken") {
      return reply.code(409).send({ error: "email_taken" });
    }
    if (result === "cgu_required") {
      return reply.code(400).send({ error: "cgu_required" });
    }
    if (result === "database_unavailable") {
      return reply.code(503).send({ error: "database_unavailable" });
    }

    return { options: result } satisfies PasskeyRegisterOptionsResponse;
  });

  app.post("/auth/passkey/register/verify", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const body = request.body as RegistrationResponseJSON | undefined;
    if (!body?.id || !body.response) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    const result = await verifyPasskeyRegistration(db, body);
    if (result === "invalid_body") {
      return reply.code(400).send({ error: "invalid_body" });
    }
    if (result === "challenge_expired") {
      return reply.code(400).send({ error: "challenge_expired" });
    }
    if (result === "verification_failed") {
      return reply.code(400).send({ error: "verification_failed" });
    }
    if (result === "email_taken") {
      return reply.code(409).send({ error: "email_taken" });
    }
    if (result === "database_unavailable") {
      return reply.code(503).send({ error: "database_unavailable" });
    }

    await issueAuthToken(reply, result.userId, result.role);
    return {
      ok: true as const,
      verified: true as const,
      userId: result.userId,
      role: result.role,
    } satisfies PasskeyRegisterVerifyResponse;
  });

  app.post("/auth/passkey/login/options", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const options = await createPasskeyAuthenticationOptions(db);
    return { options } satisfies PasskeyLoginOptionsResponse;
  });

  app.post("/auth/passkey/login/verify", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const body = request.body as AuthenticationResponseJSON | undefined;
    if (!body?.id || !body.response) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    const result = await verifyPasskeyAuthentication(db, body);
    if (result === "invalid_body") {
      return reply.code(400).send({ error: "invalid_body" });
    }
    if (result === "challenge_expired") {
      return reply.code(400).send({ error: "challenge_expired" });
    }
    if (result === "verification_failed") {
      return reply.code(400).send({ error: "verification_failed" });
    }
    if (result === "credential_not_found") {
      return reply.code(401).send({ error: "invalid_credentials" });
    }
    if (result === "user_not_found") {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    await issueAuthToken(reply, result.userId, result.role);
    return {
      ok: true as const,
      verified: true as const,
      userId: result.userId,
      role: result.role,
    } satisfies PasskeyLoginVerifyResponse;
  });

  app.get(
    "/auth/passkey/credentials",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<PasskeyCredentialListResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const authUser = await resolveAuthenticatedUser(
        db,
        jwtUser.sub,
        jwtUser.role,
      );
      if (!authUser) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const passkeys = await listPasskeysForUser(db, authUser.id);
      return {
        items: passkeys.map((pk) => ({
          id: pk.id,
          credentialId: pk.credentialId,
          deviceType: pk.deviceType ?? undefined,
          backedUp: pk.backedUp,
          transports: pk.transports,
          createdAt: pk.createdAt.toISOString(),
          lastUsedAt: pk.lastUsedAt?.toISOString(),
        })),
      };
    },
  );

  app.delete(
    "/auth/passkey/credentials/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const authUser = await resolveAuthenticatedUser(
        db,
        jwtUser.sub,
        jwtUser.role,
      );
      if (!authUser) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const { id } = request.params as { id: string };
      const result = await deletePasskeyForUser(db, id, authUser.id);
      if (result === "not_found") {
        return reply.code(404).send({ error: "not_found" });
      }
      if (result === "forbidden") {
        return reply.code(403).send({ error: "forbidden" });
      }
      return reply.code(204).send();
    },
  );
}
