#!/usr/bin/env node
/**
 * Write canonical hero rasters under packages/ui/src/assets/.
 *
 * - Source >= target width: preserve native detail (no upscale), fit to 3840×2560.
 * - Source < target width: Lanczos upscale (fallback) — script warns; prefer editorial illustration sources.
 *
 * Usage:
 *   node scripts/branding/export-hero-raster-4k.mjs \
 *     --source /path/to/draft.png \
 *     --basename concept-landing-hero
 */

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const DEFAULT_WIDTH = 3840;
const DEFAULT_HEIGHT = 2560;
const DEFAULT_OUT_DIR = resolve(REPO_ROOT, "packages/ui/src/assets");
const NATIVE_4K_MIN_WIDTH = 3840;

function parseArgs(argv) {
  const args = {
    source: null,
    basename: null,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    outDir: DEFAULT_OUT_DIR,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    switch (key) {
      case "--source":
        args.source = value;
        i += 1;
        break;
      case "--basename":
        args.basename = value;
        i += 1;
        break;
      case "--width":
        args.width = Number(value);
        i += 1;
        break;
      case "--height":
        args.height = Number(value);
        i += 1;
        break;
      case "--out-dir":
        args.outDir = resolve(REPO_ROOT, value);
        i += 1;
        break;
      case "--help":
      case "-h":
        console.log(`Usage: node scripts/branding/export-hero-raster-4k.mjs --source <draft.png> --basename <name>

Native 4K: source width >= ${NATIVE_4K_MIN_WIDTH}px (no upscale).
Fallback: smaller sources are Lanczos-upscaled to ${DEFAULT_WIDTH}×${DEFAULT_HEIGHT}.`);
        process.exit(0);
      default:
        console.error(`Unknown argument: ${key}`);
        process.exit(1);
    }
  }

  if (!args.source || !args.basename) {
    console.error("Required: --source <draft.png> --basename <asset-name>");
    process.exit(1);
  }

  return args;
}

function md5Prefix(filePath) {
  const buf = readFileSync(filePath);
  return createHash("md5").update(buf).digest("hex").slice(0, 8);
}

function buildPipeline(sourcePath, inputWidth, inputHeight, targetWidth, targetHeight) {
  const isNative4K = inputWidth >= NATIVE_4K_MIN_WIDTH;

  if (isNative4K) {
    console.log(`Native 4K source (${inputWidth}×${inputHeight}) — no upscale.`);
    return {
      pipeline: sharp(sourcePath).resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "centre",
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      }),
      mode: "native",
    };
  }

  console.warn(
    `WARN: Source ${inputWidth}×${inputHeight} is below native 4K (${NATIVE_4K_MIN_WIDTH}px wide).`,
  );
  console.warn("WARN: Applying Lanczos upscale — use editorial illustration or a true 4K source when possible.");

  return {
    pipeline: sharp(sourcePath).resize(targetWidth, targetHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    }),
    mode: "upscale-fallback",
  };
}

async function main() {
  const { source, basename, width, height, outDir } = parseArgs(process.argv);
  const sourcePath = resolve(source);

  if (!existsSync(sourcePath)) {
    console.error(`Source not found: ${sourcePath}`);
    process.exit(1);
  }

  const pngDest = resolve(outDir, `${basename}.png`);
  const webpDest = resolve(outDir, `${basename}.webp`);

  const inputMeta = await sharp(sourcePath).metadata();
  const inputWidth = inputMeta.width ?? 0;
  const inputHeight = inputMeta.height ?? 0;
  console.log(`Input: ${sourcePath} (${inputWidth}×${inputHeight})`);

  const { pipeline, mode } = buildPipeline(
    sourcePath,
    inputWidth,
    inputHeight,
    width,
    height,
  );

  await pipeline
    .clone()
    .png({ compressionLevel: 2, palette: false, adaptiveFiltering: true })
    .toFile(pngDest);

  await pipeline.clone().webp({ quality: 94, effort: 6 }).toFile(webpDest);

  const outMeta = await sharp(pngDest).metadata();
  const revision = md5Prefix(pngDest);

  console.log(`Mode: ${mode}`);
  console.log(`Exported: ${pngDest} (${outMeta.width}×${outMeta.height})`);
  console.log(`Exported: ${webpDest}`);
  console.log(`Cache revision hint: ${revision}`);
  console.log(`Bump LANDING_CONCEPT_BG_REVISION or FEED_CONCEPT_BG_REVISION to "${revision}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
