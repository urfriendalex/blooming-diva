import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "scripts/assets/cherry-blossom-apple.png");
const publicDir = join(root, "public");

const source = readFileSync(sourcePath);

const outputs = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

for (const [filename, size] of outputs) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(publicDir, filename));
}

const favicon16 = join(publicDir, "favicon-16x16.png");
const favicon32 = join(publicDir, "favicon-32x32.png");
const ico = await pngToIco([favicon16, favicon32]);
writeFileSync(join(publicDir, "favicon.ico"), ico);

console.log("sync-favicons: wrote transparent favicon fallbacks");
