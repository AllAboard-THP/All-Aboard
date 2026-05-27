import path from "node:path";
import { fileURLToPath } from "node:url";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

const openapiYamlPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "openapi.yaml",
);

/** Swagger UI + spec statique — désactivé en prod publique (voir issue #49). */
export function isOpenApiDocsEnabled(): boolean {
  const override = process.env.OPENAPI_DOCS?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  return appEnv !== "production";
}

export async function registerOpenApiDocs(app: FastifyInstance): Promise<void> {
  if (!isOpenApiDocsEnabled()) return;

  await app.register(swagger, {
    mode: "static",
    specification: {
      path: openapiYamlPath,
      baseDir: path.dirname(openapiYamlPath),
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
}
