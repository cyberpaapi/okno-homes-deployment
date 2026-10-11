import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.OKNO_BUILD_DIR || ".next",
  serverExternalPackages: ["ffmpeg-static", "ffprobe-static"],
  outputFileTracingIncludes: {
    "/api/admin/upload": ["./node_modules/ffmpeg-static/ffmpeg", "./node_modules/ffprobe-static/bin/linux/x64/ffprobe"],
    "/api/configurator/customer-model/*": ["./public/configurator/models/**/*"],
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
  images: {
    qualities: [75, 90],
  },
  experimental: {
    // The CLI checker does not reliably capture --showConfig output from this
    // workspace path. The compiler API provides the same build-time type gate.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
