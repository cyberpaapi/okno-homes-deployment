import { readContent } from "@/lib/siteContentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { revision, published, publishedCollections } = await readContent();
  if (new URL(request.url).searchParams.get("since") === String(revision)) {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ revision, published, publishedCollections }, { headers: { "Cache-Control": "no-store" } });
}
