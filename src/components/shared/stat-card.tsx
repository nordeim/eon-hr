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
 *   value-in-tile (evaluations — session 12, R11-N):
 *     p-4 flex items-center gap-3, the VALUE inside a 40px slate-100
 *     tile (SPAN text-lg font-bold text-slate-700), label right — 74px
 *   no-tile (performancemanagement, workflowautomation):
 *     p-6, flex row — text-3xl value + text-sm label LEFT, 40×40 icon
 *     RIGHT — 108px card (session 14, R13-I live measurement)
 *   tile-right (analytics): p-6, 48px tile right-aligned — 138px card
 */
type StatCardVariant =
  | "standard"
  | "compact"
  | "compact-s"
  | "mini"
  | "mini-centered"
  | "horizontal"
  | "value-in-tile"
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
  /** Session 13 (R12-A/G): per-page label override (text-xs slate-500 on
   *  notificationpreferences; text-slate-500 on hrreports). */
  labelClassName?: string;
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
  // Session 12 (R11-D): the reference's horizontal card is border-0 with
  // shadow-sm (documenttracker, 80px) — live-measured.
  horizontal: "p-4 flex items-center gap-3",
  "value-in-tile": "p-4 flex items-center gap-3",
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
  "value-in-tile": "text-lg font-bold text-slate-700",
  // Session 14 (R13-I): no-tile value carries mb-1 — the reference's
  // text stack is 60px (36 + 4 + 20).
  "no-tile": "text-3xl font-bold text-slate-900 mb-1",
  // Session 13 (R12-E): the stacked tile-right value carries mt-2 (the
  // label sits above it — measured on /analytics, 138px tiles).
  "tile-right": "text-3xl font-bold text-slate-900 mt-2",
};

/** Session 11 (R10-J): the reference's mini label is text-xs slate-500
 *  with mt-0.5 (measured on shiftcalendar — 16px line, 82px card), not
 *  the standard text-sm slate-600.
 *  Session 12 (R11-D): the horizontal label is ALSO text-xs slate-500
 *  (measured on documenttracker — 16px line, 80px card; the 24px label
 *  made the card 86px). */
const VARIANT_LABEL: Partial<Record<StatCardVariant, string>> = {
  mini: "text-xs text-slate-500 mt-0.5",
  horizontal: "text-xs text-slate-500",
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
  /** Session 13 (R12-A/G): per-page label override — the reference's
   *  notificationpreferences tiles use text-xs slate-500 (16px line,
   *  86px tiles) while hrreports keeps text-sm slate-500 (20px, 90px). */
  labelClassName,
  variant = "standard",
  className,
}: StatCardProps) {
  const tile = tileClassName ?? iconClassName;
  const tiled = icon != null && TILED.includes(variant);

  // Tile geometry per variant: standard/tile-right = 48×48 (p-3 + 24px
  // icon), compact/compact-s = 40×40 (w-10 h-10 + 20px icon),
  // horizontal = 44×44 (w-11 h-11 + 20px icon — session 12 R11-D: the
  // icon is 20px w-5 h-5 with a per-color text class from the call site,
  // not 24px).
  const tileClasses =
    variant === "compact" || variant === "compact-s"
      ? "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-5 [&_svg]:w-5"
      : variant === "horizontal"
        ? "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-5 [&_svg]:w-5"
        : "p-3 rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6";

  const tileElement = tiled ? (
    <div className={cn(tileClasses, "shrink-0", tile)}>{icon}</div>
  ) : null;

  const textBlock = (
    <>
      <p className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</p>
      <div className={cn("text-sm text-slate-600", VARIANT_LABEL[variant], labelClassName)}>{label}</div>
    </>
  );

  return (
    <Card
      className={cn(
        // Session 12 (R11-D): the horizontal variant renders border-0 with
        // shadow-sm on the reference (documenttracker 80px cards).
        variant === "horizontal" ? "border-0 shadow-sm" : "border-slate-200",
        className
      )}
    >
      <CardContent className={VARIANT_CONTENT[variant]}>
        {variant === "value-in-tile" ? (
          /* Session 12 (R11-N): the reference's evaluations stat card —
             the VALUE sits inside the 40px slate-100 tile (SPAN text-lg
             font-bold text-slate-700), the label to its right. 74px card. */
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <span className="text-lg font-bold text-slate-700">{value}</span>
            </div>
            <span className="text-sm text-slate-600">{label}</span>
          </>
        ) : tileElement == null ? (
          variant === "no-tile" ? (
            /* Session 14 (R13-I): the reference's no-tile stat card is a
               flex row — the text stack (text-3xl value, text-sm label)
               on the LEFT, a bare 40×40 icon on the RIGHT. 108px card,
               measured on /performancemanagement and /workflowautomation. */
            <div className="flex items-center justify-between">
              <div>{textBlock}</div>
              {icon != null ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center [&_svg]:h-10 [&_svg]:w-10">
                  {icon}
                </div>
              ) : null}
            </div>
          ) : (
            textBlock
          )
        ) : variant === "horizontal" ? (
          <>
            {tileElement}
            <div className="min-w-0">{textBlock}</div>
          </>
        ) : variant === "tile-right" ? (
          /* Session 13 (R12-E): the reference's stacked stat tile — label
             (text-sm slate-500) on TOP, value (text-3xl bold mt-2) below,
             delta (text-xs slate-500 mt-2) under it; the 48×48 tile rides
             top-right. 138px card, measured on /analytics. */
          <div className="flex items-start justify-between">
            <div>
              <div className={cn("text-sm text-slate-500", labelClassName)}>{label}</div>
              <p className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</p>
              {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
            </div>
            {tileElement}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between">{tileElement}</div>
            {textBlock}
          </>
        )}
        {/* Session 13 (R12-E): tile-right renders its own hint inside the
            stacked branch (text-slate-500 mt-2) — skip the generic one. */}
        {hint && variant !== "tile-right" ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
