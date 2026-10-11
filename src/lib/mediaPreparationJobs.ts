import "server-only";

import { randomUUID } from "node:crypto";
import { prepareVideo, type PreparedVideo } from "./mediaPreparation";

export type MediaJobStatus = "queued" | "running" | "ready" | "failed" | "cancelled";
export type MediaJobSnapshot = {
  id: string;
  status: MediaJobStatus;
  stage: string;
  percent: number;
  result?: PreparedVideo;
  error?: string;
};
type MediaJob = MediaJobSnapshot & {
  createdAt: number;
  controller: AbortController;
  bytes?: Buffer;
  extension: "mp4" | "webm";
  signatureOrbit: boolean;
};
type JobState = { jobs: Map<string, MediaJob>; active: string | null };

const key = Symbol.for("okno.mediaPreparationJobs");
const globalJobs = globalThis as typeof globalThis & { [key]?: JobState };
const state = globalJobs[key] ??= { jobs: new Map(), active: null };
const MAX_PENDING = 2;
const RETENTION_MS = 60 * 60 * 1000;

function snapshot(job: MediaJob): MediaJobSnapshot {
  return {
    id: job.id, status: job.status, stage: job.stage, percent: job.percent,
    ...(job.result ? { result: job.result } : {}),
    ...(job.error ? { error: job.error } : {}),
  };
}

function cleanup() {
  const now = Date.now();
  for (const [id, job] of state.jobs) {
    if (["ready", "failed", "cancelled"].includes(job.status) && now - job.createdAt > RETENTION_MS) state.jobs.delete(id);
  }
}

function runNext() {
  if (state.active) return;
  const job = [...state.jobs.values()].find(item => item.status === "queued");
  if (!job) return;
  state.active = job.id;
  job.status = "running";
  job.stage = "Checking video";
  const bytes = job.bytes!;
  job.bytes = undefined;
  void prepareVideo(bytes, job.extension, job.signatureOrbit, {
    signal: job.controller.signal,
    onProgress: progress => {
      if (job.status !== "running") return;
      job.percent = Math.max(job.percent, Math.min(100, progress.percent));
      job.stage = progress.stage;
    },
  }).then(result => {
    if (job.status === "cancelled") return;
    job.result = result;
    job.status = "ready";
    job.stage = "Ready to stage as a draft";
    job.percent = 100;
  }).catch(error => {
    if (job.status === "cancelled" || job.controller.signal.aborted) {
      job.status = "cancelled";
      job.stage = "Cancelled";
      return;
    }
    job.status = "failed";
    job.stage = "Preparation failed";
    job.error = error instanceof Error ? error.message : "Video preparation failed.";
  }).finally(() => {
    state.active = null;
    runNext();
  });
}

export function enqueueVideo(bytes: Buffer, extension: "mp4" | "webm", signatureOrbit: boolean): MediaJobSnapshot {
  cleanup();
  const pending = [...state.jobs.values()].filter(job => job.status === "queued" || job.status === "running");
  if (pending.length >= MAX_PENDING) throw new Error("Video preparation is busy. Wait for a current upload or cancel it before adding another.");
  const job: MediaJob = {
    id: randomUUID(), status: "queued", stage: "Waiting for preparation", percent: 0,
    createdAt: Date.now(), controller: new AbortController(), bytes, extension, signatureOrbit,
  };
  state.jobs.set(job.id, job);
  queueMicrotask(runNext);
  return snapshot(job);
}

export function readMediaJob(id: string): MediaJobSnapshot | null {
  cleanup();
  const job = state.jobs.get(id);
  return job ? snapshot(job) : null;
}

export function cancelMediaJob(id: string): MediaJobSnapshot | null {
  const job = state.jobs.get(id);
  if (!job) return null;
  if (job.status === "queued" || job.status === "running") {
    job.status = "cancelled";
    job.stage = "Cancelled";
    job.bytes = undefined;
    job.controller.abort();
  }
  return snapshot(job);
}
