import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Reference stat-card recipes (session-6 live measurement for the standard
 * variant on payroll + analytics; session-10 sweep for the per-page
 * variants — docs/remediation-plan-session10.md §R9-D):
 *
 *   standard (payroll, advancedanalytics, expenses, surveys):
 *     Card > div.p-6 > [tile p-3 rounded-xl 48×48, 24px icon,
 *     text-3xl value, text-sm label] — 170px card, gap-6 md:grid-cols-4
 *   compact (recruitment, compliancedashboard, assetmanagement,
 *   attendancedashboard, surveyanalytics, analyticsdashboard):
 *     p-5, 40×40 tile, 20px icon, text-2xl value — 146px card
 *   compact-s (payrollmodule): compact with a 20px value — 142px card
 *   mini (shiftcalendar): p-4, no tile, text-2xl value — 82px card
 *   mini-centered (hrreports, notificationpreferences):
 *     p-4 text-center, no tile, text-3xl value — 86-90px card
 *   horizontal (documenttracker):
 *     p-4 flex items-center gap-3, 44×44 tile left — 80px card
 *   no-tile (performancemanagement, workflowautomation):
 *     p-6, text-3xl value, no tile — 110px card
 *   tile-right (analytics): p-6, 48px tile right-aligned — 138px card
 */
type StatCardVariant =
  | "standard"
  | "compact"
  | "compact-s"
  | "mini"
  | "mini-centered"
  | "horizontal"
  | "no-tile"
  | "tile-right";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  /** Icon tile classes — the reference colors tiles per stat:
   *  `bg-{color}-100 text-{color}-600` (measured: payroll =
   *  green/blue/purple/orange, analytics = blue/purple/green/orange). */
  tileClassName?: string;
  /** @deprecated use tileClassName — kept for call-site compatibility. */
  iconClassName?: string;
  valueClassName?: string;
  /** Reference variant (session-10 map) — default "standard". */
  variant?: StatCardVariant;
  className?: string;
}

const VARIANT_CONTENT: Record<StatCardVariant, string> = {
  standard: "p-6",
  compact: "p-5",
  "compact-s": "p-5",
  mini: "p-4",
  "mini-centered": "p-4 text-center",
  horizontal: "p-4 flex items-center gap-3",
  "no-tile": "p-6",
  "tile-right": "p-6",
};

const VARIANT_VALUE: Record<StatCardVariant, string> = {
  standard: "text-3xl font-bold text-slate-900 mb-1",
  compact: "text-2xl font-bold text-slate-900",
  "compact-s": "text-xl font-bold text-slate-900",
  // Session 11 (R10-J): the mini value carries no color — shiftcalendar
  // colors its four values per card (blue/violet/emerald/amber-600) via
  // valueClassName (twMerge lets the call site win).
  mini: "text-2xl font-bold",
  "mini-centered": "text-3xl font-bold text-slate-900",
  horizontal: "text-2xl font-bold text-slate-900",
  "no-tile": "text-3xl font-bold text-slate-900",
  "tile-right": "text-3xl font-bold text-slate-900",
};

/** Session 11 (R10-J): the reference's mini label is text-xs slate-500
 *  with mt-0.5 (measured on shiftcalendar — 16px line, 82px card), not
 *  the standard text-sm slate-600. */
const VARIANT_LABEL: Partial<Record<StatCardVariant, string>> = {
  mini: "text-xs text-slate-500 mt-0.5",
};

/** Variants that render the icon tile (the reference's mini, mini-centered
 *  and no-tile stat cards carry no icon tile at all). */
const TILED: readonly StatCardVariant[] = [
  "standard",
  "compact",
  "compact-s",
  "horizontal",
  "tile-right",
];

export function StatCard({
  label,
  value,
  hint,
  icon,
  tileClassName,
  iconClassName,
  valueClassName,
  variant = "standard",
  className,
}: StatCardProps) {
  const tile = tileClassName ?? iconClassName;
  const tiled = icon != null && TILED.includes(variant);

  // Tile geometry per variant: standard/tile-right = 48×48 (p-3 + 24px
  // icon), compact/compact-s = 40×40 (w-10 h-10 + 20px icon),
  // horizontal = 44×44 (w-11 h-11 + 24px icon).
  const tileClasses =
    variant === "compact" || variant === "compact-s"
      ? "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-5 [&_svg]:w-5"
      : variant === "horizontal"
        ? "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6"
        : "p-3 rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6";

  const tileElement = tiled ? (
    <div className={cn(tileClasses, "shrink-0", tile)}>{icon}</div>
  ) : null;

  const textBlock = (
    <>
      <p className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</p>
      <div className={cn("text-sm text-slate-600", VARIANT_LABEL[variant])}>{label}</div>
    </>
  );

  return (
    <Card className={cn("border-slate-200", className)}>
      <CardContent className={VARIANT_CONTENT[variant]}>
        {tileElement == null ? (
          textBlock
        ) : variant === "horizontal" ? (
          <>
            {tileElement}
            <div className="min-w-0">{textBlock}</div>
          </>
        ) : variant === "tile-right" ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              {textBlock}
              {tileElement}
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">{tileElement}</div>
            {textBlock}
          </>
        )}
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
