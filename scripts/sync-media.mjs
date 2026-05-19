/**
 * Import reference images from the sorted project folder and emit web-ready JPEGs.
 *
 * Default source: ~/Downloads/projects-files/blooming diva
 * Override: MEDIA_SOURCE_ROOT=/path/to/source pnpm media:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT =
  process.env.MEDIA_SOURCE_ROOT ??
  path.join(process.env.HOME ?? "", "Downloads/projects-files/blooming diva");

/** Longest edge cap — matches the existing landing media set. */
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1800;
const JPEG_QUALITY = 82;

const GROUPS = [
  { sourceDir: "style ref", targetDir: "public/media/style", prefix: "style" },
  { sourceDir: "photo ref", targetDir: "public/media/photo", prefix: "photo" },
  { sourceDir: "makeup ref", targetDir: "public/media/makeup", prefix: "makeup" },
  {
    sourceDir: "overall day insp ",
    targetDir: "public/media/marquee",
    prefix: "marquee",
  },
];

const IMAGE_RE = /\.(avif|jpe?g|png|webp|heic)$/i;

function listSourceImages(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => !file.startsWith(".") && IMAGE_RE.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function clearTargetImages(dir) {
  for (const file of fs.readdirSync(dir)) {
    if (IMAGE_RE.test(file)) {
      fs.unlinkSync(path.join(dir, file));
    }
  }
}

async function optimizeToJpeg(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
    .toFile(outputPath);
}

async function syncGroup({ sourceDir, targetDir, prefix }) {
  const srcPath = path.join(SOURCE_ROOT, sourceDir);
  const destPath = path.join(REPO_ROOT, targetDir);

  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source folder not found: ${srcPath}`);
  }

  fs.mkdirSync(destPath, { recursive: true });
  clearTargetImages(destPath);

  const files = listSourceImages(srcPath);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const outName = `${prefix}-${String(index + 1).padStart(2, "0")}.jpg`;
    const inputPath = path.join(srcPath, file);
    const outputPath = path.join(destPath, outName);

    await optimizeToJpeg(inputPath, outputPath);
    const { size } = fs.statSync(outputPath);
    console.log(`  ${outName}  ←  ${file}  (${Math.round(size / 1024)} KB)`);
  }

  return files.length;
}

async function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`Source root not found: ${SOURCE_ROOT}`);
    process.exit(1);
  }

  console.log(`Source: ${SOURCE_ROOT}`);
  console.log(`Target: ${path.join(REPO_ROOT, "public/media")}\n`);

  let total = 0;

  for (const group of GROUPS) {
    console.log(`${group.targetDir}/`);
    const count = await syncGroup(group);
    total += count;
    console.log(`  → ${count} image(s)\n`);
  }

  console.log(`Done — ${total} optimized JPEGs in public/media.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
