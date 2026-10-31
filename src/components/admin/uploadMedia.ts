export type UploadedMedia = {
  url: string;
  detailUrl?: string;
  posterUrl?: string;
  warning?: string;
  prepared?: boolean;
};
export type UploadProgress = { name: string; stage: string; percent: number | null };

async function responseJson(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Upload request failed.");
  return body;
}

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Upload cancelled.", "AbortError")); return; }
    const timer = window.setTimeout(() => { signal.removeEventListener("abort", stop); resolve(); }, ms);
    function stop() { window.clearTimeout(timer); reject(new DOMException("Upload cancelled.", "AbortError")); }
    signal.addEventListener("abort", stop, { once: true });
  });
}

export async function uploadMedia(file: File, token: string, signal: AbortSignal, onProgress: (progress: UploadProgress) => void, profile?: "signature-orbit"): Promise<UploadedMedia> {
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const capability = await responseJson(await fetch("/api/admin/upload", { headers, signal, cache: "no-store" }));
  if (capability.mode === "blob") {
    const extension = ({ "model/gltf-binary": "glb", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>)[file.type];
    if (!extension || file.size === 0 || file.size > 100 * 1024 * 1024) throw new Error("Choose a supported image, video or GLB model of up to 100 MB.");
    const { upload } = await import("@vercel/blob/client");
    onProgress({ name: file.name, stage: "Uploading original", percent: 0 });
    const original = await upload(`uploads/${crypto.randomUUID()}.${extension}`, file, {
      access: "private", handleUploadUrl: "/api/admin/upload/blob", headers,
      multipart: true, abortSignal: signal,
      onUploadProgress: progress => onProgress({ name: file.name, stage: "Uploading original", percent: Math.round(progress.percentage) }),
    });
    onProgress({ name: file.name, stage: file.type.startsWith("video/") ? "Preparing film and poster" : file.type === "model/gltf-binary" ? "Checking 3D model" : "Checking image", percent: null });
    const result = await responseJson(await fetch("/api/admin/upload", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ pathname: original.pathname, profile }), signal, cache: "no-store" }));
    onProgress({ name: file.name, stage: "Ready to stage as a draft", percent: 100 });
    return result as UploadedMedia;
  }
  const form = new FormData();
  form.set("file", file);
  if (profile) form.set("profile", profile);
  let jobId = "";
  onProgress({ name: file.name, stage: "Uploading original", percent: null });
  try {
    const initial = await responseJson(await fetch("/api/admin/upload", { method: "POST", headers, body: form, signal, cache: "no-store" }));
    if (!initial.jobId) {
      onProgress({ name: file.name, stage: "Ready to stage as a draft", percent: 100 });
      return initial as UploadedMedia;
    }
    jobId = initial.jobId as string;
    onProgress({ name: file.name, stage: "Waiting for preparation", percent: 0 });
    while (true) {
      await pause(500, signal);
      const job = await responseJson(await fetch(`/api/admin/upload/jobs/${encodeURIComponent(jobId)}`, { headers, signal, cache: "no-store" }));
      onProgress({ name: file.name, stage: job.stage, percent: job.percent });
      if (job.status === "ready") {
        if (!job.result?.url) throw new Error("Video preparation finished without a usable film.");
        return { ...job.result, prepared: true, warning: job.result.width < 1280 ? "Source resolution is below desktop HD. Preview before publishing." : undefined };
      }
      if (job.status === "failed") throw new Error(job.error || "Video preparation failed.");
      if (job.status === "cancelled") throw new DOMException("Upload cancelled.", "AbortError");
    }
  } catch (error) {
    if (jobId && signal.aborted) {
      await fetch(`/api/admin/upload/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE", headers, cache: "no-store" }).catch(() => undefined);
    }
    throw error;
  }
}
