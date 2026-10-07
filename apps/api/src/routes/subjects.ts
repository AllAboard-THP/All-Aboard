import type { FastifyInstance } from "fastify";
import { asc, desc, eq } from "drizzle-orm";
import type { SubjectsResponse, SubjectDetailResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { subjects } from "../db/schema.js";
import { rowToSubject } from "../lib/mappers.js";

export function registerSubjectRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get("/subjects", async (_request, reply): Promise<SubjectsResponse | void> => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const rows = await db
      .select()
      .from(subjects)
      .orderBy(desc(subjects.postsCount), asc(subjects.name));
    return { items: rows.map(rowToSubject) };
  });

  app.get(
    "/subjects/:slug",
    async (request, reply): Promise<SubjectDetailResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { slug } = request.params as { slug: string };
      const rows = await db
        .select()
        .from(subjects)
        .where(eq(subjects.slug, slug.toLowerCase()))
        .limit(1);
      const row = rows[0];
      if (!row) {
        return reply.code(404).send({ error: "not_found" });
      }
      return { item: rowToSubject(row) };
    },
  );
}
