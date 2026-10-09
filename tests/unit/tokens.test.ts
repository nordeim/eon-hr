/**
 * Design-token contract — pins the reference-measured values in
 * src/app/globals.css. If any token drifts, this test fails.
 *
 * Measured against the live reference app (session 2 audit):
 *   - active nav / primary buttons: rgb(24,119,242) = #1877F2
 *   - text links ("View all"): #2563EB
 *   - muted text: slate-500 #64748B
 *   - canvas: linear-gradient slate-50 -> blue-50 (sRGB pinned)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "src", "app", "globals.css"),
  "utf8"
);

const theme = css.slice(css.indexOf("@theme inline"), css.indexOf("@layer base"));

describe("globals.css token contract", () => {
  it("pins the reference primary #1877F2", () => {
    expect(theme).toContain("--color-primary: #1877f2");
    expect(theme).toContain("--color-ring: #1877f2");
    expect(theme).toContain("--color-accent-foreground: #1877f2");
  });

  it("keeps the reference link blue #2563EB as a separate token", () => {
    expect(theme).toContain("--color-link: #2563eb");
  });

  it("pins muted-foreground to reference slate-500", () => {
    expect(theme).toContain("--color-muted-foreground: #64748b");
  });

  it("pins sidebar border to reference slate-200", () => {
    expect(theme).toContain("--color-sidebar-border: #e2e8f0");
  });

  it("pins the sidebar surface to reference #FAFAFA (session-3 measurement)", () => {
    // Live-measured on both the desktop aside and the mobile drawer sheet:
    // rgb(250,250,250) — NOT white.
    expect(theme).toContain("--color-sidebar: #fafafa");
  });

  it("pins the five Tailwind v4 engine traps (validation report)", () => {
    // trap 5: v3 shadow geometry
    expect(theme).toContain("--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)");
    // trap 1: full hsl() values (not bare triplets)
    expect(theme).toMatch(/--color-foreground: hsl\(221 39% 11%\)/);
    // trap 1: no bare-triplet theme values anywhere
    expect(theme).not.toMatch(/--color-[a-z-]+: \d+ \d+ %/);
  });

  it("renders the canvas gradient in the sRGB-pinned arbitrary form (trap 3)", () => {
    expect(css).toContain("linear-gradient(to bottom right, #f8fafc, #eff6ff)");
  });
});
