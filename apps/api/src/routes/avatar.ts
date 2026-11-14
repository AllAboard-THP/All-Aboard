import fs from "node:fs/promises";
import type { FastifyInstance } from "fastify";
import type { DeleteAvatarResponse, UploadAvatarResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { getJwtUser } from "../lib/auth-helpers.js";
import {
  avatarFilePath,
  buildAvatarPublicUrl,
  deleteAvatarFileIfExists,
  ensureAvatarStorageDir,
  isManagedAvatarUrl,
  resolveAvatarPublicBaseUrl,
} from "../lib/avatar-storage.js";
import { uploadAvatarBodySchema } from "../lib/schemas.js";
import {
  AVATAR_MAX_BYTES,
  processAvatarImage,
  validateAvatarMimeType,
} from "../services/avatar-upload.js";
import { loadUserByEmail } from "../services/user-profile.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export function registerAvatarRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post(
    "/users/me/avatar",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<UploadAvatarResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }

      const parsed = uploadAvatarBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const row = await loadUserByEmail(db, jwtUser.sub);
      if (!row) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const mimeError = validateAvatarMimeType(parsed.data.mimeType);
      if (mimeError) {
        return reply.code(400).send({ error: mimeError });
      }

      let inputBuffer: Buffer;
      try {
        inputBuffer = Buffer.from(parsed.data.imageBase64, "base64");
      } catch {
        return reply.code(400).send({ error: "invalid_image" });
      }

      if (inputBuffer.length === 0 || inputBuffer.length > AVATAR_MAX_BYTES) {
        return reply.code(400).send({ error: "file_too_large" });
      }

      let outputBuffer: Buffer;
      try {
        outputBuffer = await processAvatarImage(inputBuffer);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "invalid_image";
        if (message === "image_too_small") {
          return reply.code(400).send({ error: "image_too_small" });
        }
        return reply.code(400).send({ error: "invalid_image" });
      }

      await ensureAvatarStorageDir();
      const publicBase = resolveAvatarPublicBaseUrl(request);
      if (isManagedAvatarUrl(row.avatarUrl, publicBase)) {
        await deleteAvatarFileIfExists(row.id);
      }

      await fs.writeFile(avatarFilePath(row.id), outputBuffer);

      const updatedAt = new Date();
      const avatarUrl = buildAvatarPublicUrl(publicBase, row.id, updatedAt);

      await db
        .update(users)
        .set({ avatarUrl, updatedAt })
        .where(eq(users.id, row.id));

      return { avatarUrl };
    },
  );

  app.delete(
    "/users/me/avatar",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<DeleteAvatarResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }

      const jwtUser = getJwtUser(request);
      const row = await loadUserByEmail(db, jwtUser.sub);
      if (!row) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const publicBase = resolveAvatarPublicBaseUrl(request);
      if (isManagedAvatarUrl(row.avatarUrl, publicBase)) {
        await deleteAvatarFileIfExists(row.id);
      }

      const updatedAt = new Date();
      await db
        .update(users)
        .set({ avatarUrl: null, updatedAt })
        .where(eq(users.id, row.id));

      return { ok: true as const };
    },
  );
}
