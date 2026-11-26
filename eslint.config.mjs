import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next*/**",
    ".vercel/**",
    ".okno-secrets/**",
    ".okno-content/**",
    ".local-preview/**",
    "tmp/**",
    "artifacts/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party browser bundle copied verbatim for the static globe fallback.
    "public/assets/vendor/**",
    // Supplied Three.js/BufferGeometryUtils/OrbitControls/GLTFLoader bundle.
    // Its MIT header and release-baseline bytes remain unchanged.
    "public/configurator/antigravity/engine.js",
  ]),
  {
    files: ["public/configurator/antigravity/app.js"],
    rules: {
      // Preserve the owner-supplied legacy viewer without deleting its dormant
      // pricing/image/material helpers. All other names and rules stay checked.
      "@typescript-eslint/no-unused-vars": ["warn", {
        varsIgnorePattern: "^(animateTotalPriceTo|computePricingSummary|addedCost|selCost|loadImageAsync|refBambooMat|refWoodMat)$",
        argsIgnorePattern: "^_z$",
        reportUsedIgnorePattern: true,
      }],
    },
  },
]);

export default eslintConfig;
