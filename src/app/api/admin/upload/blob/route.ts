import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { adminTokenConfigured, isAdminAuthorized } from "@/lib/siteContentStore";
import { cloudStorageEnabled } from "@/lib/cloudStorage";
import { cloudUploadLimit, uploadFormats, validUploadPath } from "@/lib/cloudUpload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!cloudStorageEnabled()) return Response.json({ error: "Direct cloud uploads are disabled locally." }, { status: 404 });
  if (!adminTokenConfigured()) return Response.json({ error: "Admin key is not configured." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json() as HandleUploadBody;
    const response = await handleUpload({ request, body, onBeforeGenerateToken: async pathname => {
      if (!validUploadPath(pathname)) throw new Error("Invalid upload destination.");
      const extension = pathname.split(".").at(-1);
      const mime = [...uploadFormats].find(([, format]) => format === extension)?.[0];
      if (!mime) throw new Error("Unsupported media type.");
      return { allowedContentTypes: [mime], maximumSizeInBytes: cloudUploadLimit,
        validUntil: Date.now() + 5 * 60 * 1000, addRandomSuffix: false, allowOverwrite: false };
    } });
    return Response.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not authorize this upload. Reconnect and try again." }, { status: 400 });
  }
}
