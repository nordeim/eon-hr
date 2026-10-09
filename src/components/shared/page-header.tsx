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
  "raised-48": {
    badge: "mb-4 mt-8",
    h1: "text-4xl md:text-5xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "raised-36": {
    badge: "mb-4 mt-8",
    h1: "text-4xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat36": {
    badge: "mb-4",
    h1: "text-4xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat36-sm": {
    badge: "mb-4",
    h1: "text-4xl mb-2",
    sub: "text-slate-600",
  },
  "flat48": {
    badge: "mb-4",
    h1: "text-4xl md:text-5xl mb-3",
    sub: "text-lg text-slate-600",
  },
  "flat-tight": {
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
}) {
  const hasBadge = Boolean(section);
  const recipe = HEADER_LAYOUTS[layout];
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
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
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
