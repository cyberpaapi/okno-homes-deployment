#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, createWriteStream, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import localPorts from "../config/local-ports.json" with { type: "json" };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const production = process.argv.includes("--production");
const checkOnly = process.argv.includes("--check");
const requestedPort = process.argv.find(argument => argument.startsWith("--port="))?.split("=")[1] || process.env.OKNO_PORT || String(localPorts.website);
const port = Number(requestedPort);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("OKNO_PORT must be an integer between 1024 and 65535.");
const origin = `http://127.0.0.1:${port}`;
const routes = ["/", "/hero-v1", "/hero-v2", "/models", "/models/signature", "/models/bespoke", "/projects", "/hospitality", "/process", "/sustainability", "/journal", "/about", "/enquiry", "/models/signature/forza/configure", "/models/signature/tengo/configure", "/models/signature/kray/configure", "/models/signature/tish/configure"];
const delay = milliseconds => new Promise(done => setTimeout(done, milliseconds));
// Cold Turbopack routes can spend more than a minute compiling on this checkout.
// Production routes should keep the tighter health-check deadline.
const routeTimeoutMs = production ? 60000 : 180000;

async function identity() {
  try {
    const response = await fetch(`${origin}/api/site-status`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    const result = await response.json();
    return result.site === "okno-final-showcase" && result.version === "2026-10-05" && result.configurators?.includes("tengo") && result.configurators?.includes("kray") ? result : null;
  } catch { return null; }
}
async function available() {
  return new Promise((done, reject) => {
    const server = createServer();
    server.once("error", error => error.code === "EADDRINUSE" ? done(false) : reject(error));
    server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
  });
}
async function verify() {
  const stylesheets = new Set();
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(routeTimeoutMs) });
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}`);
    const html = await response.text();
    for (const match of html.matchAll(/href="([^"]+\.css(?:\?[^"]*)?)"/g)) {
      stylesheets.add(new URL(match[1], origin).href);
    }
    console.log(`Ready ${route}`);
  }
  for (const url of stylesheets) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    await response.body?.cancel();
    if (!response.ok) throw new Error(`Stylesheet ${url} returned HTTP ${response.status}. Rebuild and restart the server on port ${port}.`);
  }
  console.log(`Ready ${stylesheets.size} stylesheet assets`);
  console.log(`\nOKNO website: ${origin}\nAll editorial pages and the published customer configurators run in this one application.`);
}

const existing = await identity();
if (existing) {
  console.log(`Reusing the verified ${existing.mode} Final Showcase server on ${port}. Its process is not owned by this command.`);
  await verify();
} else if (checkOnly) {
  throw new Error(`No verified Final Showcase server at ${origin}. Run npm run website.`);
} else {
  if (!await available()) throw new Error(`Port ${port} belongs to another or older server. It has not been stopped. Stop its owning terminal before restarting the Final Showcase on canonical port 3134. Override --port only when a second simultaneous server is intentionally required.`);
  if (!existsSync(resolve(root, "node_modules/next/dist/bin/next"))) throw new Error("Dependencies are missing. Run npm ci in the Final Showcase folder.");
  if (production && !existsSync(resolve(root, process.env.OKNO_BUILD_DIR || ".next", "BUILD_ID"))) throw new Error("Production build is missing in the selected build directory. Run npm run build with the same OKNO_BUILD_DIR, then npm run website:production.");
  const logDirectory = resolve(root, ".local-preview");
  mkdirSync(logDirectory, { recursive: true });
  const logPath = resolve(logDirectory, `website-${port}.log`);
  const log = createWriteStream(logPath, { flags: "a" });
  log.write(`\n[${new Date().toISOString()}] ${production ? "production" : "development"} ${origin}\n`);
  const child = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), production ? "start" : "dev", "-H", "127.0.0.1", "-p", String(port)], {
    // Keep Next in the launcher's terminal process group. Otherwise Ctrl+C on
    // `npm run website:production` can end npm while leaving a detached Next
    // listener occupying the fixed website port.
    cwd: root, stdio: ["ignore", "pipe", "pipe"], env: process.env,
  });
  child.stdout.pipe(process.stdout); child.stdout.pipe(log);
  child.stderr.pipe(process.stderr); child.stderr.pipe(log);
  let stopping = false;
  const signalOwned = signal => {
    if (!child.pid) return;
    try {
      child.kill(signal);
    } catch (error) { if (error.code !== "ESRCH") console.error(error.message); }
  };
  const stop = () => {
    if (stopping) return;
    stopping = true;
    signalOwned("SIGTERM");
    const timeout = setTimeout(() => signalOwned("SIGKILL"), 8000);
    timeout.unref();
  };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
  const finished = new Promise((done, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => { log.end(); done(stopping ? 0 : code ?? (signal ? 1 : 0)); });
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 90 && !stopping; attempt++) {
      if (await identity()) { ready = true; break; }
      if (child.exitCode !== null || child.signalCode) break;
      await delay(1000);
    }
    if (!ready) throw new Error(`Final Showcase did not become ready. Inspect ${logPath}`);
    await verify();
    console.log(`Logs: ${logPath}\nCtrl+C stops only the server started by this command.`);
    process.exitCode = await finished;
  } catch (error) {
    stop(); await finished; throw error;
  }
}
