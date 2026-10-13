/**
 * Design-token contract — pins the reference-measured values in
 * src/app/globals.css. If any token drifts, this test fails.
 *
 * Measured against the live reference app (session 2 audit):
 *   - active nav / primary buttons: rgb(24,119,242) = #1877F2
 *   - text links ("View all"): #2563EB
 *   - muted text: slate-500 #64748B
 *   - canvas: linear-gradient slate-50 -> blue-50 (sRGB pinned)
 *
 * Session 33 (parity round 32): the theme moved to the shadcn runtime-var
 * pattern — `:root` carries the light pins, `.dark` carries the reference's
 * extracted dark palette (live stylesheet verbatim), and `@theme inline`
 * maps `--color-*` to the runtime vars so the Moon toggle flips them.
 * The light pins moved from @theme to :root; this test slices accordingly
 * (lastIndexOf — the header comment also mentions "@theme inline").
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "src", "app", "globals.css"),
  "utf8"
);

const root = css.slice(css.indexOf(":root"), css.indexOf(".dark {"));
const dark = css.slice(css.indexOf(".dark {"), css.lastIndexOf("@theme inline"));
const theme = css.slice(css.lastIndexOf("@theme inline"), css.indexOf("@layer base"));

describe("globals.css token contract", () => {
  it("pins the reference primary #1877F2 — and it must NOT flip in dark", () => {
    expect(theme).toContain("--color-primary: #1877f2");
    expect(theme).toContain("--color-link: #2563eb");
    // REF authors its blue via custom classes that survive dark; the
    // clone's primary has no .dark override.
    expect(dark).not.toContain("--primary:");
  });

  it("keeps the reference link blue #2563EB as a separate token", () => {
    expect(theme).toContain("--color-link: #2563eb");
  });

  it("pins muted-foreground to reference slate-500 (light) and neutral-400 (dark)", () => {
    expect(root).toContain("--muted-foreground: #64748b");
    expect(dark).toContain("--muted-foreground: #a3a3a3");
  });

  it("pins sidebar border to reference slate-200", () => {
    expect(root).toContain("--sidebar-border: #e2e8f0");
  });

  it("pins the sidebar surface to reference #FAFAFA (session-3 measurement — the MOBILE DRAWER token)", () => {
    // Live-measured on the mobile drawer sheet: rgb(250,250,250) — NOT
    // white. (Session 33: REF's DESKTOP aside is authored bg-white —
    // see the app-shell recipe pin; this token serves the drawer and
    // flips to rgb(24,24,27) in dark, REF's --sidebar-background
    // 240 5.9% 10%.)
    expect(root).toContain("--sidebar: #fafafa");
    expect(dark).toContain("--sidebar: #18181b");
  });

  it("pins the sidebar focus ring to reference blue-500 (session 19, R18-C)", () => {
    // REF's --sidebar-ring token (217.2 91.2% 59.8%) renders
    // rgb(59,130,246) on focused sidebar links AND group buttons.
    expect(root).toContain("--sidebar-ring: #3b82f6");
  });

  it("pins the five Tailwind v4 engine traps (validation report)", () => {
    // trap 5: v3 shadow geometry
    expect(theme).toContain("--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)");
    // trap 1: full hsl() values (not bare triplets)
    expect(root).toMatch(/--destructive: hsl\(0 84\.2% 60\.2%\)/);
    // trap 1: no bare-triplet theme values anywhere
    expect(theme).not.toMatch(/--color-[a-z-]+: \d+ \d+ %/);
    expect(root).not.toMatch(/--[a-z-]+: \d+ \d+ %/);
    expect(dark).not.toMatch(/--[a-z-]+: \d+ \d+ %/);
  });

  it("renders the body flip via the runtime var + keeps the foreground apply", () => {
    // Session 33: the body base follows the runtime var — light #ffffff,
    // dark #0a0a0a (REF-measured rgb(10,10,10)).
    expect(css).toContain("background-color: var(--background)");
    expect(css).toContain("@apply text-foreground antialiased");
  });

  // ---- session-4 measurements (live reference, DOM-verified) ----
  it("pins primary-foreground to reference #FAFAFA light / #171717 dark (session 4 + session 33)", () => {
    // Light: text-primary-foreground on gradient CTA buttons renders
    // rgb(250,250,250). Dark: REF's .dark --primary-foreground 0 0% 9%
    // renders rgb(23,23,23) on the same CTAs (measured /employees,
    // /templates this round).
    expect(root).toContain("--primary-foreground: #fafafa");
    expect(dark).toContain("--primary-foreground: #171717");
  });

  it("pins border + input to reference neutral-200 #E5E5E5 light / #262626 dark (session 4 + session 33)", () => {
    expect(root).toContain("--border: #e5e5e5");
    expect(root).toContain("--input: #e5e5e5");
    expect(dark).toContain("--border: #262626");
    expect(dark).toContain("--input: #262626");
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
  it("pins the neutral foreground family to reference #0A0A0A light / #FAFAFA dark", () => {
    expect(root).toContain("--foreground: #0a0a0a");
    expect(root).toContain("--card-foreground: #0a0a0a");
    expect(root).toContain("--popover-foreground: #0a0a0a");
    expect(dark).toContain("--foreground: #fafafa");
    expect(dark).toContain("--card-foreground: #fafafa");
    expect(dark).toContain("--popover-foreground: #fafafa");
  });

  it("pins background/secondary/accent to the reference neutral scale (light + dark)", () => {
    // Reference light: --background 0 0% 100%, --secondary 0 0% 96.1%,
    // --accent 0 0% 96.1% (+ foregrounds 0 0% 9%). Dark (session 33,
    // extracted verbatim): 0 0% 3.9% / 0 0% 14.9% / + foregrounds 98%.
    expect(root).toContain("--background: #ffffff");
    expect(root).toContain("--secondary: #f5f5f5");
    expect(root).toContain("--secondary-foreground: #171717");
    expect(root).toContain("--accent: #f5f5f5");
    expect(root).toContain("--accent-foreground: #171717");
    expect(dark).toContain("--background: #0a0a0a");
    expect(dark).toContain("--secondary: #262626");
    expect(dark).toContain("--secondary-foreground: #fafafa");
    expect(dark).toContain("--accent: #262626");
    expect(dark).toContain("--accent-foreground: #fafafa");
  });

  it("pins ring to the reference neutral #0A0A0A light / #D4D4D4 dark (focus rings)", () => {
    expect(root).toContain("--ring: #0a0a0a");
    expect(dark).toContain("--ring: #d4d4d4");
  });

  it("pins destructive to the exact reference red — #EF4444 light / red-900 dark", () => {
    expect(root).toContain("--destructive: hsl(0 84.2% 60.2%)");
    expect(dark).toContain("--destructive: #7f1d1d");
  });

  it("pins neutral-900 #171717 for the dark button variant + neutral-400 #A3A3A3 (the dark tab color)", () => {
    expect(theme).toContain("--color-neutral-900: #171717");
    expect(theme).toContain("--color-neutral-950: #0a0a0a");
    // Session 33: REF's dark inactive-tab color (its --muted-foreground
    // dark token 0 0% 63.9%) — the tab list's dark:text-neutral-400.
    expect(theme).toContain("--color-neutral-400: #a3a3a3");
  });

  it("keeps muted-foreground at rendered-truth slate-500 (deliberate)", () => {
    // The reference's TOKEN is #737373 (neutral-400 in dark), but every
    // probed reference surface renders explicit slate classes instead;
    // the token value never visibly renders. The clone's 336
    // text-muted-foreground usages render the slate-500 the reference
    // actually shows. Session 16 (R15-A) caveat: TAB surfaces are the
    // exception — the tab pills pin neutral-500 (light) and flip to
    // neutral-400 in dark, matching the reference's token on both.
    expect(root).toContain("--muted-foreground: #64748b");
  });

  it("pins neutral-500 #737373 — the reference's visibly-rendered tab-inactive color (session 16, R15-A)", () => {
    expect(theme).toContain("--color-neutral-500: #737373");
  });

  it("pins zinc-700 #3F3F46 — the reference's footer Moon icon color (session 16, R15-B)", () => {
    expect(theme).toContain("--color-zinc-700: #3f3f46");
  });

  // ---- session-33: the runtime-var indirection layer ----
  it("maps every flipping color token through its runtime var (@theme inline indirection)", () => {
    for (const [color, runtime] of [
      ["background", "background"],
      ["foreground", "foreground"],
      ["card", "card"],
      ["card-foreground", "card-foreground"],
      ["popover", "popover"],
      ["popover-foreground", "popover-foreground"],
      ["primary-foreground", "primary-foreground"],
      ["secondary", "secondary"],
      ["secondary-foreground", "secondary-foreground"],
      ["muted", "muted"],
      ["muted-foreground", "muted-foreground"],
      ["accent", "accent"],
      ["accent-foreground", "accent-foreground"],
      ["destructive", "destructive"],
      ["destructive-foreground", "destructive-foreground"],
      ["border", "border"],
      ["input", "input"],
      ["ring", "ring"],
      ["sidebar", "sidebar"],
    ]) {
      expect(theme).toContain(`--color-${color}: var(--${runtime})`);
    }
  });
});
