import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const output = process.argv[2] || ".next";
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
}
const traces = walk(resolve(output, "server/app")).filter(file => file.endsWith(".nft.json"));
if (!traces.length) throw new Error("No production function traces found.");
let largest = 0;
for (const trace of traces) {
  const files = JSON.parse(readFileSync(trace, "utf8")).files;
  const paths = files.map(file => resolve(dirname(trace), file));
  if (paths.some(file => /\/(?:\.okno-secrets|\.okno-content|\.local-preview|\.git)\//.test(file) || /\/\.env[^/]*$/.test(file))) throw new Error("Private local data found in a function trace.");
  const bytes = paths.reduce((total, file) => total + statSync(file).size, 0);
  if (bytes > 250 * 1024 * 1024) throw new Error("A function exceeds the 250 MiB uncompressed bundle ceiling.");
  largest = Math.max(largest, bytes);
  if (trace.includes("customer-model/")) {
    for (const asset of ["tengo-customer-v1.glb", "kray-customer-v1.glb"]) {
      if (!paths.some(file => file.endsWith(`/public/configurator/models/${asset}`)) || !paths.some(file => file.endsWith(`/public/configurator/models/${asset}.gz`))) throw new Error("Customer model endpoint is missing an approved model variant.");
    }
  }
  if (trace.endsWith("/api/admin/upload/route.js.nft.json")) {
    for (const binary of ["/ffmpeg-static/ffmpeg", "/ffprobe-static/bin/linux/x64/ffprobe"]) {
      if (!paths.some(file => file.endsWith(binary))) throw new Error("Cloud media preparation is missing a Linux binary.");
    }
  }
}
console.log(`${traces.length} function traces passed; largest ${(largest / 1024 / 1024).toFixed(1)} MiB; secrets excluded, media binaries and customer models retained.`);
