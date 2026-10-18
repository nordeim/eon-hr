/**
 * The from_url resolver — the auth-boundary round-trip's security gate.
 *
 * Session 55 (R55-A): REF's guard and logout both carry the FULL ABSOLUTE
 * URL as the from_url param (`https://eon.base44.app/settings` — live-
 * measured in the r55 census). The clone's historic login handler only
 * honored path-form values (`from.startsWith("/")`), so REF-format params
 * silently fell back to the default target. This resolver accepts BOTH
 * forms — but ONLY same-origin absolute URLs:
 *
 *   - path-form: a leading `/` that is neither `//` (protocol-relative)
 *     nor `/\` (backslash-leading — browsers normalize `\` to `/` in
 *     some contexts) passes through as-is;
 *   - absolute form: parsed with `new URL`; if the origin matches the
 *     app's own origin, the pathname + search are extracted;
 *   - everything else (foreign origins, protocol-relative, malformed
 *     strings) resolves to null — the caller then falls back to the
 *     root, NEVER the attacker's target (the open-redirect guard).
 *
 * Pure string/URL logic only — no window access, so the unit layer can
 * pin the full table (tests/unit/login-redirect.test.ts).
 */
export function resolveFromUrl(from: string | null | undefined, origin: string): string | null {
  if (!from || typeof from !== "string") return null;

  // path-form: same-origin by construction, but guard the two escape
  // hatches that a leading slash otherwise admits
  if (from.startsWith("/")) {
    if (from.startsWith("//") || from.startsWith("/\\")) return null;
    return from;
  }

  // absolute form: only the app's own origin is honored
  try {
    const url = new URL(from);
    if (url.origin !== origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
