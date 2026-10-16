import assets from "@/data/configurator/signatureAssetManifest.json";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    site: "okno-final-showcase",
    version: "2026-10-05",
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    configurators: Object.keys(assets),
  }, { headers: { "Cache-Control": "no-store" } });
}
