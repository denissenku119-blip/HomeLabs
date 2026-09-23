/**
 * Produces the static bundle the Capacitor Android app loads.
 *
 * `vite build` emits `dist/client` (static assets + prerendered index.html)
 * and `dist/server` (SSR/Nitro output, useless inside a WebView). Capacitor's
 * existing `webDir: 'dist'` therefore has to point at a flat static folder, so
 * this script promotes `dist/client/*` to `dist/` and drops the server output.
 */
import { rm, rename, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const staged = path.join(root, ".dist-mobile");

// Never let an interrupted previous mobile build contribute stale files.
await rm(staged, { recursive: true, force: true });

if (!existsSync(path.join(client, "index.html"))) {
  console.error(
    "[build:mobile] dist/client/index.html is missing. Run `npm run build` first — the SPA shell must be prerendered.",
  );
  process.exit(1);
}

await rename(client, staged);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of await readdir(staged)) {
  await rename(path.join(staged, entry), path.join(dist, entry));
}
await rm(staged, { recursive: true, force: true });

console.log("[build:mobile] dist/ now contains the static app bundle (index.html + assets).");
