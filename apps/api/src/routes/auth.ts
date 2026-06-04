import type { FastifyInstance } from "fastify";
import type {
  AuthMeResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
  UserRole,
} from "@allaboard/types";
import {
  authenticateWithDatabase,
  authenticateWithMvpFallback,
  isMvpPasswordFallbackEnabled,
  loginBodySchema,
  resolveLoginEmail,
} from "../auth/login.js";
import { registerBodySchema, registerUser } from "../auth/register.js";
import { clearAuthCookie, issueAuthToken } from "../auth/session.js";
import type { AppDatabase } from "../db/client.js";
import {
  getJwtUser,
  roleFromJwtClaims,
} from "../lib/auth-helpers.js";
import { rowToUserProfile } from "../lib/user-mappers.js";
import {
  loadCompetenceSubjects,
  loadUserByEmail,
} from "../services/user-profile.js";

export function registerAuthRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_body" });
    }
    const email = resolveLoginEmail(parsed.data);
    if (!email) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    let auth:
      | { userId: string; role: UserRole }
      | "invalid_credentials"
      | "login_not_configured";

    if (db) {
      auth = await authenticateWithDatabase(db, email, parsed.data.password);
      if (auth === "invalid_credentials" && isMvpPasswordFallbackEnabled()) {
        auth = authenticateWithMvpFallback(parsed.data);
      }
    } else if (isMvpPasswordFallbackEnabled()) {
      auth = authenticateWithMvpFallback(parsed.data);
    } else {
      return reply.code(503).send({ error: "login_not_configured" });
    }

    if (auth === "login_not_configured") {
      return reply.code(503).send({ error: "login_not_configured" });
    }
    if (auth === "invalid_credentials") {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    await issueAuthToken(reply, auth.userId, auth.role);
    return {
      ok: true as const,
      userId: auth.userId,
      role: auth.role,
    } satisfies LoginResponse;
  });

  app.post("/auth/register", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const parsed = registerBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    const result = await registerUser(db, parsed.data);
    if (result === "invalid_body") {
      return reply.code(400).send({ error: "invalid_body" });
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
      userId: result.userId,
      role: result.role,
    } satisfies RegisterResponse;
  });

  app.post("/auth/logout", async (_request, reply) => {
    clearAuthCookie(reply);
    return { ok: true as const } satisfies LogoutResponse;
  });

  app.get(
    "/auth/me",
    { preHandler: [app.authenticate] },
    async (request): Promise<AuthMeResponse> => {
      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);

      if (!db) {
        return {
          userId: jwtUser.sub,
          role,
        };
      }

      const row = await loadUserByEmail(db, jwtUser.sub);
      if (!row) {
        return { userId: jwtUser.sub, role };
      }

      const competenceSubjects = await loadCompetenceSubjects(db, row.id);
      const profile = rowToUserProfile(row, competenceSubjects);
      return {
        userId: jwtUser.sub,
        role: profile.role,
        displayName: profile.displayName,
        fullName: profile.fullName,
        headline: profile.headline,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        educationLevel: profile.educationLevel,
        cguAcceptedAt: profile.cguAcceptedAt,
        notifyOnComment: profile.notifyOnComment,
        notifyOnMessage: profile.notifyOnMessage,
        certificationTags: profile.certificationTags,
        competenceSubjects: profile.competenceSubjects,
      };
    },
  );
}
