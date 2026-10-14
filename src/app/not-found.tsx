import { redirect } from "next/navigation";
import { Home } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { NotFoundCopy } from "./not-found-copy";

/**
 * Session 10 (R9-F) first rebuilt this as a centered 72px/300 "404" +
 * 24px/500 "Page Not Found" INSIDE the app shell. Session 36 (R35-D)
 * re-measured REF's full contract and completed it:
 *
 * - the "404" renders at slate-300 (rgb 203,213,225 — was slate-900) and
 *   "Page Not Found" at slate-800, riding a `space-y-2` block with a
 *   2px × 64px slate-200 divider bar between them;
 * - the sentence 'The page "{pathname}" could not be found in this
 *   application.' (16px slate-600 leading-relaxed, the route in a quoted
 *   500-weight slate-700 span — the full path, not just the last segment);
 * - a centered Go Home outline button (123×38, white bg, slate-200 border,
 *   rounded-lg, a 16px Home icon at mr-2 — the live pair caught the
 *   missing icon: the clone rendered 99px, REF 123px) in a `pt-6`
 *   wrapper;
 * - the per-route title "{LastSegment} | Eon HR" (the client island sets
 *   it — the metadata API cannot see unmatched paths);
 * - logged-out visitors are REDIRECTED to /login (REF's guard behavior —
 *   the round-10 "unmeasurable" assumption, now measurable).
 */
export default async function NotFound() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
      {/* Session 36 (R35-F11): REF's wrapper — min-h-screen (the full
          900px viewport, content centered at y=306) with p-6 and the
          slate-50 page background. The clone's old 70vh-min + 160px
          bottom-padding recipe had pushed the center up to y=226 — an
          80px offset the live pair caught (the census had the interior
          stack but not the wrapper's vertical recipe). */}
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <NotFoundCopy />
          </div>
          <div className="pt-6">
            {/* REF's Go Home: outline, white bg, slate-200 border,
                rounded-lg (8px), 14px/500 slate-700, a 16px Home icon at
                mr-2 (123×38 with it — the full hover + focus chain
                measured). A real link — the navigation superset. */}
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Go Home
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
