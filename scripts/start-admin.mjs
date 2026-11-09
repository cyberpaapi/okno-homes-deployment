#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import { createServer, request as httpRequest } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import localPorts from "../config/local-ports.json" with { type: "json" };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const adminOrigin = `http://127.0.0.1:${localPorts.admin}`;
const websiteOrigin = `http://127.0.0.1:${localPorts.website}`;
const checkOnly = process.argv.includes("--check");
const production = process.argv.includes("--production");
const delay = milliseconds => new Promise(done => setTimeout(done, milliseconds));
const statusMatches = value => value?.site === "okno-final-showcase" && value.version === "2026-10-05" && value.configurators?.includes("tengo") && value.configurators?.includes("kray");

async function readJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2500), cache: "no-store" });
    return response.ok ? await response.json() : null;
  } catch { return null; }
}

async function websiteReady() {
  return statusMatches(await readJson(`${websiteOrigin}/api/site-status`));
}

async function adminReady() {
  const status = await readJson(`${adminOrigin}/__admin/status`);
  return status?.service === "okno-admin-gateway" && status.websitePort === localPorts.website && status.adminPort === localPorts.admin && status.ready === true;
}

async function portAvailable(port) {
  return new Promise((done, reject) => {
    const server = createServer();
    server.once("error", error => error.code === "EADDRINUSE" ? done(false) : reject(error));
    server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
  });
}

async function verify() {
  const [admin, publicPage, contentApi] = await Promise.all([
    fetch(`${adminOrigin}/admin`, { signal: AbortSignal.timeout(production ? 60000 : 180000) }),
    fetch(`${adminOrigin}/about`, { redirect: "manual", signal: AbortSignal.timeout(5000) }),
    fetch(`${adminOrigin}/api/admin/content`, { signal: AbortSignal.timeout(5000) }),
  ]);
  if (!admin.ok) throw new Error(`Admin route returned HTTP ${admin.status}.`);
  if (publicPage.status !== 404) throw new Error(`Public page isolation failed: /about returned HTTP ${publicPage.status}.`);
  if (![200, 401, 503].includes(contentApi.status)) throw new Error(`Admin API returned unexpected HTTP ${contentApi.status}.`);
  console.log(`OKNO admin: ${adminOrigin}/admin`);
  console.log(`Fixed admin port ${localPorts.admin}; website dependency stays on ${localPorts.website}.`);
  if (contentApi.status === 503) console.warn("Editing is disabled: the website process on 3134 has no OKNO_CMS_ADMIN_TOKEN. Restart that process with the configured shared key (at least 8 characters) to enable edits.");
}

const existing = await adminReady();
if (existing) {
  console.log("Reusing the verified admin gateway; no second server was started.");
  await verify();
} else if (checkOnly) {
  throw new Error(`No verified admin gateway on fixed port ${localPorts.admin}. Run npm run admin.`);
} else {
  if (!await portAvailable(localPorts.admin)) throw new Error(`Port ${localPorts.admin} is occupied by an unverified service. Nothing was stopped or replaced.`);

  const logDirectory = resolve(root, ".local-preview");
  mkdirSync(logDirectory, { recursive: true });
  const logPath = resolve(logDirectory, `admin-${localPorts.admin}.log`);
  const log = createWriteStream(logPath, { flags: "a" });
  log.write(`\n[${new Date().toISOString()}] admin ${adminOrigin}\n`);
  let websiteLauncher;
  let stopping = false;

  function stop() {
    if (stopping) return;
    stopping = true;
    if (gateway.listening) gateway.close();
    websiteLauncher?.stdout?.unpipe(log);
    websiteLauncher?.stderr?.unpipe(log);
    if (websiteLauncher && !websiteLauncher.killed) websiteLauncher.kill("SIGTERM");
    log.end();
  }

  // Admin port is only a local gateway; a second Next.js server would compete for .next.
  const mediaPath = /\.(?:avif|gif|glb|ico|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf)$/i;
  function allowed(pathname) {
    return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/configurator/model-preparation.txt" ||
      pathname.startsWith("/_next/") || pathname.startsWith("/api/admin/") ||
      pathname.startsWith("/api/site-media/") || mediaPath.test(pathname);
  }

  const gateway = createServer(async (request, response) => {
    if (!request.url?.startsWith("/") || request.url.startsWith("//")) { response.writeHead(400).end(); return; }
    const pathname = new URL(request.url, adminOrigin).pathname;
    if (pathname === "/__admin/status") {
      const ready = await websiteReady();
      response.writeHead(ready ? 200 : 503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ service: "okno-admin-gateway", adminPort: localPorts.admin, websitePort: localPorts.website, ready }));
      return;
    }
    if (pathname === "/") { response.writeHead(307, { Location: "/admin", "Cache-Control": "no-store" }).end(); return; }
    if (!allowed(pathname)) { response.writeHead(404, { "Content-Type": "text/plain", "Cache-Control": "no-store" }).end("This port serves the admin only."); return; }
    const upstream = httpRequest({ hostname: "127.0.0.1", port: localPorts.website, path: request.url, method: request.method, headers: { ...request.headers, host: `127.0.0.1:${localPorts.website}` } }, upstreamResponse => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });
    upstream.on("error", error => {
      if (!response.headersSent) response.writeHead(502, { "Content-Type": "text/plain" });
      response.end(`Website dependency on port ${localPorts.website} is unavailable: ${error.code ?? "connection error"}`);
    });
    request.pipe(upstream);
  });

  gateway.on("upgrade", (request, socket, head) => {
    if (!request.url?.startsWith("/_next/")) { socket.destroy(); return; }
    const upstream = httpRequest({ hostname: "127.0.0.1", port: localPorts.website, path: request.url, method: request.method, headers: { ...request.headers, host: `127.0.0.1:${localPorts.website}` } });
    upstream.on("upgrade", (reply, upstreamSocket, upstreamHead) => {
      socket.write(`HTTP/1.1 ${reply.statusCode} ${reply.statusMessage}\r\n${Object.entries(reply.headers).map(([key, value]) => `${key}: ${value}`).join("\r\n")}\r\n\r\n`);
      if (upstreamHead.length) socket.write(upstreamHead);
      if (head.length) upstreamSocket.write(head);
      upstreamSocket.pipe(socket).pipe(upstreamSocket);
    });
    upstream.on("error", () => socket.destroy());
    upstream.on("response", () => socket.destroy());
    upstream.end();
  });

  async function ensureWebsite() {
    if (await websiteReady()) return;
    if (!await portAvailable(localPorts.website)) {
      // A separately owned website may be restarting. Give it time to identify itself.
      for (let attempt = 0; attempt < 10; attempt++) {
        await delay(1000);
        if (await websiteReady()) return;
      }
      throw new Error(`Port ${localPorts.website} is occupied by an unverified website. Nothing was stopped or replaced.`);
    }
    if (!websiteLauncher) {
      websiteLauncher = spawn(process.execPath, [resolve(root, "scripts/start-website.mjs"), ...(production ? ["--production"] : [])], { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
      websiteLauncher.stdout.pipe(log, { end: false });
      websiteLauncher.stderr.pipe(log, { end: false });
      websiteLauncher.on("error", error => log.write(`${error.message}\n`));
    }
    for (let attempt = 0; attempt < 90 && !await websiteReady(); attempt++) {
      if (websiteLauncher.exitCode !== null || websiteLauncher.signalCode) throw new Error(`Website dependency failed to start. Inspect ${logPath}.`);
      await delay(1000);
    }
    if (!await websiteReady()) throw new Error(`Website dependency did not become ready. Inspect ${logPath}.`);
  }

  try {
    await new Promise((done, reject) => {
      gateway.once("error", reject);
      gateway.listen(localPorts.admin, "127.0.0.1", done);
    });
    await ensureWebsite();
    try { await verify(); }
    catch (error) {
      if (await websiteReady()) throw error;
      await ensureWebsite();
      await verify();
    }
    console.log(`Logs: ${logPath}\nCtrl+C stops the admin gateway and only a website process started by this command.`);
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  } catch (error) {
    stop();
    throw error;
  }
}
