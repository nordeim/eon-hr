/**
 * The vendored REF filter glyph — the classic-triangle funnel.
 *
 * Session 87 (the tab-interior round): lucide 0.525 renamed this glyph to
 * Funnel with DIFFERENT path geometry (the rounded-spout form) —
 * pixel-proven maxdelta 221 at the 16px icon cell, ABOVE the AA floor.
 * The REF ships the CLASSIC triangle (`polygon 22 3 2 3 10 12.46 10 19
 * 14 21 14 12.46 22 3`), so the glyph is vendored verbatim with the
 * lucide class form (`lucide lucide-filter`) for DOM parity.
 *
 * Session 88 (R88-D3): extracted from payrollreports/page.tsx to the
 * shared layer — the reports page's "Report Filters" title carries the
 * same glyph (live-measured, the polygon points identical).
 */
export function RefFilterGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `lucide lucide-filter ${className}` : "lucide lucide-filter"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
