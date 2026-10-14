"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Session 36 (R35-D): the 404 sentence + the per-route title. REF renders
 * 'The page "{full pathname}" could not be found in this application.'
 * (16px slate-600 leading-relaxed, the route in a quoted 500-weight
 * slate-700 span — the path WITHOUT the leading slash) and titles the page
 * "{LastSegment} | Eon HR" (the LAST path segment, first-letter
 * capitalized — measured: /nonexistentroute123 → "Nonexistentroute123 |
 * Eon HR", /foo/bar → "Bar | Eon HR").
 *
 * The Next metadata API cannot see the unmatched path server-side, so the
 * title comes from this client island. Two Next/React mechanics conspire
 * here: (1) the root layout's default metadata <title> ("Eon HR") renders
 * FIRST in the head and the browser honors the first title tag, so the
 * island's hoisted <title> loses on order; (2) a raw document.title
 * mutation during hydration is re-asserted by Next's metadata controller.
 * The fix: render the island's <title> (React 19 hoists it into the head,
 * where it survives as part of the React tree) AND remove the layout's
 * default title tag after hydration settles — the browser then resolves
 * to the island's title.
 */
export function NotFoundCopy() {
  const pathname = usePathname() || "/";
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  const slug = last.charAt(0).toUpperCase() + last.slice(1);
  const title = slug ? `${slug} | Eon HR` : "Eon HR";

  React.useEffect(() => {
    // Next's metadata controller re-asserts the layout's default title as
    // hydration completes (after page effects) — delay the cleanup past
    // that window, then drop every competing title tag.
    const id = window.setTimeout(() => {
      for (const t of Array.from(document.querySelectorAll("head title"))) {
        if (t.textContent !== title) t.remove();
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [title]);

  return (
    <>
      <title>{title}</title>
      <p className="text-slate-600 leading-relaxed">
        The page{" "}
        <span className="font-medium text-slate-700">&quot;{pathname.replace(/^\//, "")}&quot;</span>{" "}
        could not be found in this application.
      </p>
    </>
  );
}
