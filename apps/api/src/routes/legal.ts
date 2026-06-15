import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { AcceptLegalResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { users } from "../db/schema.js";
import { getJwtUser } from "../lib/auth-helpers.js";
import { loadUserFromJwtSub } from "../services/user-profile.js";

export function registerLegalRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post(
    "/legal/accept",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<AcceptLegalResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }

      const jwtUser = getJwtUser(request);
      const row = await loadUserFromJwtSub(db, jwtUser.sub);
      if (!row) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const now = new Date();
      await db
        .update(users)
        .set({ cguAcceptedAt: now, updatedAt: now })
        .where(eq(users.id, row.id));

      return { ok: true as const, cguAcceptedAt: now.toISOString() };
    },
  );
}
