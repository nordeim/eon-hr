// The unknown-route title transform — a pure seam extracted at session 104
// (R104-B) from the not-found client island so the multi-word form is
// unit-pinnable. The r35 pin ("{LastSegment} | Eon HR", first-letter
// capitalized) was measured on SINGLE-WORD fixtures only; the live REF read
// at the 68th deploy state showed the multi-word form: the last segment's
// hyphens become spaces and EVERY word is capitalized
// ("definitely-not-a-real-route-r104" → "Definitely Not A Real Route R104").
// The single-word r35 pins survive verbatim under this transform.

/** Capitalizes one word: the first character uppercased, the rest verbatim. */
function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * The unknown-route slug for the page title: the LAST path segment with
 * every hyphen-separated word capitalized and joined by spaces. Empty
 * segments (unknown routes at the root, trailing slashes) yield "" — the
 * caller falls back to the plain app title.
 *
 * Examples (REF-measured, live at the 68th deploy state):
 *   "/nonexistentroute123"      → "Nonexistentroute123"   (the r35 pin, verbatim)
 *   "/foo/bar"                  → "Bar"                   (the r35 pin, verbatim)
 *   "/definitely-not-a-real-route-r104" → "Definitely Not A Real Route R104"
 */
export function unknownRouteSlug(pathname: string): string {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  if (!last) return "";
  return last
    .split("-")
    .filter(Boolean)
    .map(capitalizeWord)
    .join(" ");
}
