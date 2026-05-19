#!/usr/bin/env node
/**
 * Next.js `output: "standalone"` n'inclut pas `.next/static` ni `public` dans le bundle.
 * Même copie que infra/docker/Dockerfile.web (lignes 27–29).
 */
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = join(webRoot, ".next/standalone");
const staticSrc = join(webRoot, ".next/static");
const publicSrc = join(webRoot, "public");
const staticDest = join(standaloneRoot, "apps/web/.next/static");
const publicDest = join(standaloneRoot, "apps/web/public");

if (!existsSync(standaloneRoot)) {
  console.error("prepare-standalone: run `next build` first (.next/standalone missing)");
  process.exit(1);
}
if (!existsSync(staticSrc)) {
  console.error("prepare-standalone: .next/static missing — run `next build` first");
  process.exit(1);
}

cpSync(staticSrc, staticDest, { recursive: true });
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

console.log("prepare-standalone: copied .next/static and public into standalone bundle");
