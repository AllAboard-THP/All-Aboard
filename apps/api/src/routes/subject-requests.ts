import type { FastifyInstance } from "fastify";
import type { CreateSubjectRequestResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { subjectRequests } from "../db/schema.js";
import { getJwtUser } from "../lib/auth-helpers.js";
import { rowToSubjectRequest } from "../lib/mappers.js";
import { createSubjectRequestBodySchema } from "../lib/schemas.js";
import { loadUserByEmail } from "../services/user-profile.js";

export function registerSubjectRequestRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post(
    "/subject-requests",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateSubjectRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createSubjectRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const user = await loadUserByEmail(db, jwtUser.sub);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const [inserted] = await db
        .insert(subjectRequests)
        .values({
          userId: user.id,
          name: parsed.data.name.trim(),
          description: parsed.data.description?.trim() || null,
          status: "pending",
        })
        .returning();

      return reply.code(201).send({
        item: rowToSubjectRequest(inserted!),
      });
    },
  );
}
