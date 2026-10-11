import { randomBytes, createHash } from "node:crypto";
import { mkdir, open } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: npm run admin:key -- [--output .okno-secrets/admin-key.env]\nWrites a new owner-only key file. Existing files are never overwritten. No secret is printed.");
  process.exit(0);
}
if (args.length && (args.length !== 2 || args[0] !== "--output" || !args[1])) {
  console.error("Use --output <file>, or --help."); process.exit(1);
}
const destination = path.resolve(args[1] || ".okno-secrets/admin-key.env");
const key = randomBytes(32).toString("base64url");
await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
try {
  const file = await open(destination, "wx", 0o600);
  try { await file.writeFile(`OKNO_CMS_ADMIN_TOKEN=${key}\n`); } finally { await file.close(); }
} catch (error) {
  console.error(error.code === "EEXIST" ? "Key file already exists. Choose a new --output path for rotation." : "Could not save key file.");
  process.exit(1);
}
console.log(`Admin key saved to ${destination}`);
console.log(`Fingerprint: ${createHash("sha256").update(key).digest("hex").slice(0, 12)}`);
console.log("Store the key in your password manager and the project's server-only OKNO_CMS_ADMIN_TOKEN environment variable. Never commit it.");
