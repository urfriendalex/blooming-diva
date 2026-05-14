import { readdirSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function toPublicUrl(folder: string, file: string) {
  return `/${folder}/${file}`.replace(/\\/g, "/");
}

export function getImagesFromPublicFolder(folder: string) {
  const fullDir = path.join(PUBLIC_DIR, folder);

  return readdirSync(fullDir)
    .filter((file) => /\.(avif|jpe?g|png|webp|svg)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => toPublicUrl(folder, file));
}
