import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.OKNO_BUILD_DIR || ".next",
  serverExternalPackages: ["ffmpeg-static", "ffprobe-static"],
  outputFileTracingIncludes: {
    "/api/admin/upload": ["./node_modules/ffmpeg-static/ffmpeg", "./node_modules/ffprobe-static/bin/linux/x64/ffprobe"],
    "/api/configurator/customer-model/*": ["./public/configurator/models/*-customer-v1.glb*"],
  },
  outputFileTracingExcludes: {
    // Next trace matching uses contains=true: a bare "/" also matches every API.
    // The model endpoint reads approved GLBs from disk; other routes use CDN assets.
    "!**/api/configurator/customer-model/*": ["./public/**/*"],
    "/*": [
      "./.okno-content/**/*", "./.okno-secrets/**/*", "./.local-preview/**/*",
      "./.env*", "./.git/**/*",
      "./node_modules/ffprobe-static/bin/darwin/**/*",
      "./node_modules/ffprobe-static/bin/win32/**/*",
      "./node_modules/ffprobe-static/bin/linux/arm*/*",
      "./node_modules/ffprobe-static/bin/linux/ia32/*",
    ],
  },
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return ["forest-entry-scroll-window-finish.mp4", "forest-entry-scroll-window-smooth.mp4"].map(name => ({
      source: `/assets/landing-options/${name}`,
      destination: "/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4",
      permanent: true,
    }));
  },
  async headers() {
    // Fonts are renamed when they change, so a week-long cache is safe and spares phones a
    // revalidation round trip before Kento (font-display: block) can paint.
    const fontCache = { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] };
    return [fontCache, ...["/configurator/antigravity/assets/:path*", "/configurator/models/v2/:path*", "/page-images/:path*", "/thumbnail-images/:path*", "/project-images/:path*", "/hero-v2/nighttime-frames-:part-:hash.bin", "/assets/landing-options/forest-entry-scroll-window-smooth-b6de05527e75.mp4", "/assets/landing-options/forest-entry-frames-:hash.bin", "/assets/landing-options/hero-:version-mobile-:hash.bin", "/assets/landing-options/forest-entry-intro-:hash.mp4"].map(source => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }))];
  },
  images: {
    qualities: [60, 75, 90],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
  },
  experimental: {
    ...(process.env.OKNO_LOW_MEMORY_BUILD === "1" ? { cpus: 1 } : {}),
    // The CLI checker does not reliably capture --showConfig output from this
    // workspace path. The compiler API provides the same build-time type gate.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
