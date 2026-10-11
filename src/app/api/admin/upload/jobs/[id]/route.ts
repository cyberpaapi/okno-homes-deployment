import { adminTokenConfigured, isAdminAuthorized } from "@/lib/siteContentStore";
import { cancelMediaJob, readMediaJob } from "@/lib/mediaPreparationJobs";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

function refuse(request: Request) {
  if (!adminTokenConfigured()) return Response.json({ error: "Admin token is not configured." }, { status: 503 });
  if (!isAdminAuthorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return null;
}

export async function GET(request: Request, { params }: Context) {
  const denied = refuse(request);
  if (denied) return denied;
  const job = readMediaJob((await params).id);
  return job ? Response.json(job, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Upload job not found. It may have expired after a server restart." }, { status: 404 });
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = refuse(request);
  if (denied) return denied;
  const job = cancelMediaJob((await params).id);
  return job ? Response.json(job, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Upload job not found. It may have expired after a server restart." }, { status: 404 });
}
