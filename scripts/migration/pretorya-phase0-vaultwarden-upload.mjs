#!/usr/bin/env node
/**
 * Upload .allaboard-migration/phase0 into Bitwarden/Vaultwarden secure notes.
 * Requires: bw CLI logged in, BW_SESSION set (bw unlock).
 *
 * Vaultwarden on vaultwarden.fr: attachments disabled; max note ~10k chars —
 * large files (manifest.json) are split into parts.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../.allaboard-migration/phase0");
const FOLDER_NAME = "All-Aboard migration";
const MAX = 6000;

if (!process.env.BW_SESSION) {
  console.error("Set BW_SESSION after: bw unlock");
  process.exit(1);
}

const bwEnv = { ...process.env };

function bw(args, input) {
  if (input !== undefined) {
    return execSync(`bw ${args}`, { input, encoding: "utf8", env: bwEnv }).trim();
  }
  return execSync(`bw ${args}`, { encoding: "utf8", env: bwEnv }).trim();
}

function ensureFolder() {
  const folders = JSON.parse(bw("list folders"));
  const hit = folders.find((f) => f.name === FOLDER_NAME);
  if (hit) return hit.id;
  const enc = bw("encode", JSON.stringify({ name: FOLDER_NAME }));
  return JSON.parse(bw(`create folder ${enc}`)).id;
}

function createNote(folderId, name, notes) {
  if (notes.length > 9800) {
    throw new Error(`Note too long (${notes.length}): ${name}`);
  }
  const enc = bw(
    "encode",
    JSON.stringify({
      type: 2,
      name,
      folderId,
      notes,
      secureNote: { type: 0 },
    }),
  );
  return JSON.parse(bw(`create item ${enc}`)).id;
}

function walkFiles(dir, base = "") {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const abs = path.join(dir, ent.name);
    const rel = base ? `${base}/${ent.name}` : ent.name;
    if (ent.isDirectory()) out.push(...walkFiles(abs, rel));
    else out.push(rel);
  }
  return out;
}

function main() {
  bw("sync");
  const folderId = ensureFolder();
  const existing = new Set(
    JSON.parse(bw('list items --search "Phase0 |"')).map((i) =>
      i.name.replace(/^Phase0 \| /, "").replace(/ \(part \d+\)$/, ""),
    ),
  );

  let added = 0;
  for (const rel of walkFiles(ROOT)) {
    if (existing.has(rel)) continue;
    const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const header = `All-Aboard Phase0 migration file: ${rel}\nRestore: .allaboard-migration/phase0/${rel}\n\n`;
    const full = header + content;
    if (full.length <= MAX) {
      createNote(folderId, `Phase0 | ${rel}`, full);
      added++;
    } else {
      let part = 1;
      for (let i = 0; i < full.length; i += MAX) {
        const chunk =
          `All-Aboard Phase0 | ${rel} | part ${part}\nConcatenate parts in order.\n\n` +
          full.slice(i, i + MAX);
        createNote(folderId, `Phase0 | ${rel} (part ${part})`, chunk);
        part++;
        added++;
      }
    }
  }

  const all = JSON.parse(bw('list items --search "Phase0 |"'));
  const indexBody =
    "All-Aboard Pretorya Phase0 — index.\n\n" +
    all
      .map((i) => i.name.replace(/^Phase0 \| /, ""))
      .sort()
      .map((n) => `- ${n}`)
      .join("\n");
  const oldIndex = all.find((i) => i.name.startsWith("Phase0 | INDEX"));
  if (oldIndex) bw(`delete item ${oldIndex.id}`);
  createNote(folderId, "Phase0 | INDEX (2026-09-24)", indexBody.slice(0, 9800));

  console.log(`Vault upload complete. Added ${added} note(s). Folder: ${FOLDER_NAME}`);
}

main();
