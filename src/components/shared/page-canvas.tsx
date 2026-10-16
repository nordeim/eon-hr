import * as React from "react";

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
 * The pair's third member on REF — the absolute-top deco strip (an
 * over-the-top negative-margin band holding the refresh-cw icon and a
 * 4-path svg) — is the platform's scroll widget: fully transparent at
 * rest, transformed away on scroll, zero visual footprint (documented
 * non-clone; see docs/remediation-plan-session47.md section A).
 */
export function PageCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="touch-pan-y">{children}</div>
    </div>
  );
}
