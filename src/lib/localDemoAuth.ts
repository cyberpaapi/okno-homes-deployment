import "server-only";

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import localPorts from "../../config/local-ports.json";

type LocalDemoCredential = { purpose: "local-demo-only"; token: string; expiresAt: string };

function credentialPath() {
  return path.join(process.cwd(), ".okno-content", "demo-token.json");
}

export function readLocalDemoCredential(now = Date.now()): LocalDemoCredential | null {
  if (process.env.VERCEL === "1" || process.env.OKNO_CONTENT_BACKEND === "blob") return null;
  try {
    const file = credentialPath();
    if (process.platform !== "win32" && (statSync(file).mode & 0o077) !== 0) return null;
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const value = parsed as Record<string, unknown>;
    if (value.purpose !== "local-demo-only" || typeof value.token !== "string" || value.token.length < 24 || typeof value.expiresAt !== "string") return null;
    const expiry = Date.parse(value.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= now) return null;
    return value as LocalDemoCredential;
  } catch {
    return null;
  }
}

export function localDemoCredentialForRequest(request: Request, now = Date.now()) {
  try {
    const url = new URL(request.url);
    const fixedPorts = [String(localPorts.website), String(localPorts.admin)];
    const localName = (value: string) => value === "127.0.0.1" || value === "localhost";
    const forwardedHost = request.headers.get("host") ?? "";
    const fixedForwardedHost = fixedPorts.some(port => forwardedHost === `127.0.0.1:${port}` || forwardedHost === `localhost:${port}`);
    if (!localName(url.hostname) || !(fixedPorts.includes(url.port) || (!url.port && fixedForwardedHost))) return null;
    return readLocalDemoCredential(now);
  } catch {
    return null;
  }
}
