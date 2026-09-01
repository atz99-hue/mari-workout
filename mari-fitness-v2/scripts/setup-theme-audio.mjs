import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "..", "assets", "audio", "mari_fitness_theme.mp3");
const source = process.argv[2];

if (!source) {
  console.error("Usage: node scripts/setup-theme-audio.mjs <path-to-source.mp3>");
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`Source not found: ${source}`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`Copied theme audio to ${target}`);
