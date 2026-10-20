import * as React from "react";
import { RefreshCw } from "lucide-react";

/**
 * REF's page-level wrapper pair (session 47, R46-A): the app pages that
 * render inside the shell's scroll container wrap their content in
 * `relative overflow-hidden > touch-pan-y` — the platform's page-level
 * touch/clip container. Live-measured on seven pages as the scroller's
 * first child (dashboard, employees, payroll, taskmanager,
 * leavemanagement, expenses, loans) and nested INSIDE the gradient root
 * on attendance (REF's inverted arrangement — the only measured page
 * that nests).
 *
 * The pair's third member on REF — the absolute-top deco band (an
 * over-the-top negative-margin strip holding the refresh-cw icon) —
 * was documented non-clone at session 47 (zero visual footprint at
 * rest). Session 66 (R66-A): the margin/gap census surfaced its
 * computed signature (`-80,0,0,0` top margin — the largest REF-only
 * census family, live on all 8 PageCanvas routes + payrollreports) and
 * it is now cloned: the band is clipped by `overflow-hidden` at rest
 * (fully transparent furniture, exactly REF's structure — the inner
 * div keeps REF's inline `transform: none`).
 */
export function PageCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="touch-pan-y">
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 -mt-20" aria-hidden="true">
          <div style={{ transform: "none" }}>
            <RefreshCw className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
