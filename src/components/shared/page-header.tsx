import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page header block: section badge + title + subtitle on the left, actions
 * right.
 *
 * The reference app uses SIX measured header recipes across its module
 * pages (session-5 live audit, `docs/remediation-plan-session5.md` §3).
 * The badge text renders at `text-sm font-medium text-slate-700`
 * (14px/500/#334155) and the badge icon is per-module colored via
 * `iconClassName`.
 *
 * Layout recipes (badge / h1 / subtitle y-positions at 1440×900):
 *   raised-48   badge mt-8 mb-4 | h1 text-4xl md:text-5xl mb-3 | sub text-lg        → 64/116/176
 *   raised-36   badge mt-8 mb-4 | h1 text-4xl mb-3          | sub text-lg        → 64/116/168
 *   flat36      badge mb-4      | h1 text-4xl mb-3          | sub text-lg        → 32/84/136
 *   flat36-sm   badge mb-4      | h1 text-4xl mb-2          | sub text-slate-600 → 32/84/132
 *   flat48      badge mb-4      | h1 text-4xl md:text-5xl mb-3 | sub text-lg     → 32/84/144
 *   flat-tight  badge mb-3      | h1 text-4xl (no mb)       | sub text-slate-600 mt-1 → 32/80/124
 *
 * Badge-less pages (employees, dashboard, analytics, templates) render the
 * 30px `size="lg"` h1 at y=32 with a 16px slate-500 subtitle;
 * announcements uses `size="md"` (24px h1, 14px sub).
 */
const HEADER_LAYOUTS = {
  // Session 9 (R8-A companion): the raised recipes carry their 32px offset
  // on the ROW (`row: "mt-8"`), not on the badge — the reference's header
  // row starts at y=64 (140px tall) so its items-center lands the actions
  // on the h1 row (y=116). With mt-8 on the badge the clone's row grew to
  // 172px and centered the actions at y=100.
  "raised-48": {
    row: "mt-8",
    badge: "mb-4",
    h1: "text-4xl md:text-5xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "raised-36": {
    row: "mt-8",
    badge: "mb-4",
    h1: "text-4xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat36": {
    row: "",
    badge: "mb-4",
    h1: "text-4xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat36-sm": {
    row: "",
    badge: "mb-4",
    h1: "text-4xl mb-2",
    sub: "text-slate-600",
  },
  "flat48": {
    row: "",
    badge: "mb-4",
    h1: "text-4xl md:text-5xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat-tight": {
    row: "",
    badge: "mb-3",
    h1: "text-4xl",
    sub: "text-slate-600 mt-1",
  },
} as const;

export type HeaderLayout = keyof typeof HEADER_LAYOUTS;

export function PageHeader({
  section,
  sectionIcon,
  iconClassName = "text-blue-600",
  title,
  subtitle,
  actions,
  size = "lg",
  layout = "raised-48",
  titleClassName,
  className,
  mobileKicker = false,
  mobileKickerTitle,
  mobileHeader = "visible",
  centered = false,
}: {
  section?: string;
  sectionIcon?: React.ReactNode;
  /** Badge icon color — the reference colors these per module. */
  iconClassName?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Bare-page title size (no badge): "lg" = 30px h1 + 16px slate-500 sub;
   *  "md" = 24px h1 + 14px sub (announcements). */
  size?: "lg" | "md";
  /** Badge-page recipe — see HEADER_LAYOUTS. */
  layout?: HeaderLayout;
  /** Per-page h1 override (e.g. attendance's reference `leading-[2]` quirk). */
  titleClassName?: string;
  className?: string;
  /** Session 7 (R6-B): category-A routes render a mobile page-title kicker
   *  (the reference's `md:hidden sticky top-0 z-20 bg-white border-b
   *  border-slate-200 px-4 py-3` bar with an 18px/700 h1 — measured
   *  x=16/y=89/h=53 at 390×844) instead of the desktop header below md. */
  mobileKicker?: boolean;
  /** Kicker text override — /profile's kicker reads "Profile" while its
   *  desktop h1 is "Profile Settings" (reference measurement). */
  mobileKickerTitle?: string;
  /** "hidden" adds `hidden md:flex` to the desktop header block — the
   *  reference wraps its desktop header in a hidden md:flex div on the
   *  category-A routes (page actions are desktop-only there). */
  mobileHeader?: "visible" | "hidden";
  /** Session 9 (R8-B): training / evaluations / companywall / organogram
   *  wrap their header block in `text-center` on the reference — the
   *  badge (inline-flex), h1 and subtitle all center. */
  centered?: boolean;
}) {
  const hasBadge = Boolean(section);
  const recipe = HEADER_LAYOUTS[layout];
  return (
    <>
      {mobileKicker ? (
        // Session 9 (R8-G): the redeployed reference's kicker is no longer
        // effectively sticky — its `sticky top-0` sits inside a non-scrolling
        // wrapper stack (measured: window scrolls, kicker scrolls away,
        // y=-89 at scrollY=178). Static bar matches the rendered truth.
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-slate-900 truncate">{mobileKickerTitle ?? title}</h1>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          // Session 9 (R8-A): the reference centers the actions cluster in
          // the whole header block (items-center) — taskmanager's button
          // lands on the h1 row (y=116), employees' at y=46. Not items-start.
          // The raised recipes offset the ROW (recipe.row) so the centered
          // block is the reference's 140px header, not 172px.
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          // The raised offset belongs to BADGE pages only — the reference's
          // bare-page rows (employees, analytics, templates…) start at y=32.
          hasBadge && recipe.row,
          mobileHeader === "hidden" && "hidden md:flex",
          className
        )}
      >
      <div className={cn("min-w-0", centered && "text-center")}>
        {hasBadge ? (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm",
              recipe.badge
            )}
          >
            {sectionIcon ? (
              <span
                className={cn("inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4", iconClassName)}
                aria-hidden="true"
              >
                {sectionIcon}
              </span>
            ) : null}
            <span className="text-sm font-medium leading-5 text-slate-700">{section}</span>
          </div>
        ) : null}
        <h1
          className={cn(
            "font-bold text-slate-900",
            hasBadge ? recipe.h1 : size === "md" ? "text-2xl" : "text-3xl",
            titleClassName
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              hasBadge ? recipe.sub : "mt-1 text-slate-500",
              !hasBadge && size === "md" && "text-sm"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div> : null}
      </div>
    </>
  );
}
