/**
 * Shared Dokploy API helpers for Pretorya migration phase 1 scripts.
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
export const PHASE1_ENV_PATH = path.join(
  REPO_ROOT,
  ".allaboard-migration",
  "phase1",
  "dokploy-api.env",
);

const REQUIRED_REPOS = [
  { owner: "AllAboard-THP", repo: "All-Aboard" },
  { owner: "AllAboard-THP", repo: "Projet-Final---All-aboard" },
];

export { REQUIRED_REPOS };

/** @param {Record<string, string>} envFile */
export function applyEnvFile(envFile) {
  for (const [key, value] of Object.entries(envFile)) {
    if (value && !process.env[key]) process.env[key] = value;
  }
}

export async function loadPhase1Env() {
  try {
    await access(PHASE1_ENV_PATH);
  } catch {
    return false;
  }
  const raw = await readFile(PHASE1_ENV_PATH, "utf8");
  /** @type {Record<string, string>} */
  const parsed = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    parsed[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  applyEnvFile(parsed);
  return true;
}

export function getDokployConfig() {
  const url = process.env.DOKPLOY_URL?.replace(/\/$/, "");
  const apiKey = process.env.DOKPLOY_API_KEY;
  if (!url || !apiKey) {
    throw new Error(
      "Missing DOKPLOY_URL and/or DOKPLOY_API_KEY. Copy scripts/migration/dokploy-api.env.example → .allaboard-migration/phase1/dokploy-api.env",
    );
  }
  return { url, apiKey };
}

/** @param {string} procedure @param {Record<string, string>} [query] @param {unknown} [body] */
export async function dokployRequest(procedure, query = {}, body = undefined) {
  const { url, apiKey } = getDokployConfig();
  const params = new URLSearchParams(query);
  const qs = params.toString();
  const target = `${url}/${procedure}${qs ? `?${qs}` : ""}`;
  const res = await fetch(target, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "x-api-key": apiKey,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const snippet =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : text.slice(0, 400);
    throw new Error(`${procedure} HTTP ${res.status}: ${snippet}`);
  }
  return data;
}
