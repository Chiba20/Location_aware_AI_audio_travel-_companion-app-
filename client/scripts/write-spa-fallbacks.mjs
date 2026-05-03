import { mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(root, "..");
const distRoot = join(clientRoot, "dist");
const source = join(distRoot, "index.html");

const routes = [
  "app",
  "cities",
  "journey",
  "premium",
  "feedback",
  "city/1",
  "city/2",
  "city/3",
  "city/kanchipuram",
  "city/madurai",
  "city/iit-madras",
];

await Promise.all(
  routes.map(async (route) => {
    const target = join(distRoot, route);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  })
);

console.log(`Created SPA fallback files for ${routes.length} routes.`);
