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
  // Session 51 (R51-A): the /Dashboard route-casing alias. REF's platform
  // serves routes case-insensitively — its canonical dashboard URL is the
  // CAPITAL /Dashboard (its own /organizationsetup + /dynamicdashboard
  // redirects land there) while its internal links use the lowercase
  // form. Next.js on a case-sensitive FS serves only /dashboard, so the
  // capital form 404'd. The rewrite serves the dashboard at /Dashboard
  // with the URL bar UNCHANGED (exactly like REF — not a redirect), the
  // content/metadata/auth-guard riding the real lowercase route. Scope:
  // the canonical form only — a re-export DIRECTORY (Dashboard/ beside
  // dashboard/) would collide on case-insensitive checkouts (macOS).
  async rewrites() {
    return [{ source: "/Dashboard", destination: "/dashboard" }];
  },
};

export default nextConfig;
