import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  reactStrictMode: false,
  // Hide the floating Next.js dev-tools button — it is a dev-mode-only
  // overlay that would otherwise appear in docs/screenshots/ captures and
  // does not exist in production (visual-parity hygiene).
  devIndicators: false,
  // Next 16's dev-origin protection silently blocks dev chunks for other
  // origins (unhydrated page, native form GET fallbacks) — allow localhost,
  // 127.0.0.1 and the sandbox preview host (docs/Tailwind-V4-Validation-
  // Report.md §trap log c).
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "preview-chat-5bfe59f5-c893-4b45-a3ea-ad5caa2ef1af.space-z.ai",
    "*.space-z.ai",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
