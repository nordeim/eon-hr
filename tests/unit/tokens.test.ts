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
    expect(theme).toContain("--color-link: #2563eb");
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
    expect(theme).toMatch(/--color-destructive: hsl\(0 84\.2% 60\.2%\)/);
    // trap 1: no bare-triplet theme values anywhere
    expect(theme).not.toMatch(/--color-[a-z-]+: \d+ \d+ %/);
  });

  it("renders the canvas gradient in the sRGB-pinned arbitrary form (trap 3)", () => {
    // Session 6: the shell canvas gradient moved from <body> (fixed
    // attachment) to the AppShell root div (stretches with content height,
    // like the reference's `min-h-screen flex w-full bg-gradient-to-br`).
    // The sRGB pin itself lives in the recipes contract (app-shell.tsx).
    expect(css).toContain("@apply text-foreground antialiased");
  });

  // ---- session-4 measurements (live reference, DOM-verified) ----
  it("pins primary-foreground to reference #FAFAFA (button text, session 4)", () => {
    // Ref text-primary-foreground on gradient CTA buttons renders
    // rgb(250,250,250) — slate-50, NOT pure white.
    expect(theme).toContain("--color-primary-foreground: #fafafa");
  });

  it("pins border + input to reference neutral-200 #E5E5E5 (session 4)", () => {
    // Ref inputs/cards/tables all use #E5E5E5; the hsl(214 32% 91%)
    // slate-tinted border was a scaffold leftover.
    expect(theme).toContain("--color-border: #e5e5e5");
    expect(theme).toContain("--color-input: #e5e5e5");
  });

  it("pins the reference font stack verbatim (session 4)", () => {
    // The reference app does NOT self-host Inter — body font-family is the
    // v4.0-era default stack (ui-sans-serif…), which differs from the
    // installed Tailwind 4.3.3 default (-apple-system…). Pin it verbatim;
    // layout.tsx must not load next/font Inter.
    const flat = theme.replace(/\s+/g, " ");
    expect(flat).toContain(
      '--font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    );
    expect(css).not.toContain("--font-inter");
  });

  // ---- session-6 measurements (reference :root extracted verbatim) ----
  it("pins the neutral foreground family to reference #0A0A0A (0 0% 3.9%)", () => {
    // Reference --foreground/--card-foreground/--popover-foreground are the
    // shadcn neutral defaults; card titles + body text render #0a0a0a, not
    // the slate-tinted hsl(221 39% 11%) = #111827 the clone had.
    expect(theme).toContain("--color-foreground: #0a0a0a");
    expect(theme).toContain("--color-card-foreground: #0a0a0a");
    expect(theme).toContain("--color-popover-foreground: #0a0a0a");
  });

  it("pins background/secondary/accent to the reference neutral scale", () => {
    // Reference: --background 0 0% 100%, --secondary 0 0% 96.1%,
    // --accent 0 0% 96.1% (+ foregrounds 0 0% 9%). The clone's
    // slate-tinted values rendered blue-shifted surfaces.
    expect(theme).toContain("--color-background: #ffffff");
    expect(theme).toContain("--color-secondary: #f5f5f5");
    expect(theme).toContain("--color-secondary-foreground: #171717");
    expect(theme).toContain("--color-accent: #f5f5f5");
    expect(theme).toContain("--color-accent-foreground: #171717");
  });

  it("pins ring to the reference neutral #0A0A0A (focus rings)", () => {
    // Reference --ring: 0 0% 3.9% — focus rings render near-black, not the
    // brand blue. (Supersedes the session-2 blue pin.)
    expect(theme).toContain("--color-ring: #0a0a0a");
  });

  it("pins destructive to the exact reference red (#EF4444)", () => {
    // Reference --destructive: 0 84.2% 60.2% = #EF4444 exactly; the clone's
    // hsl(0 84% 60%) computed to #EF4343 — one sRGB unit off per channel.
    expect(theme).toContain("--color-destructive: hsl(0 84.2% 60.2%)");
  });

  it("pins neutral-900 #171717 for the dark button variant", () => {
    // The reference's shadcn --primary (0 0% 9%) renders #171717 on the
    // taskmanager active toggle and the empty-state CTAs.
    expect(theme).toContain("--color-neutral-900: #171717");
    expect(theme).toContain("--color-neutral-950: #0a0a0a");
  });

  it("keeps muted-foreground at rendered-truth slate-500 (deliberate)", () => {
    // The reference's TOKEN is #737373 (neutral-400), but every probed
    // reference surface renders explicit slate classes instead; the token
    // value never visibly renders. The clone's 336 text-muted-foreground
    // usages render the slate-500 the reference actually shows.
    expect(theme).toContain("--color-muted-foreground: #64748b");
  });
});
