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
 *   horizontal-bare (requestreports — session 49, R48-C7):
 *     p-4 flex items-center gap-3, 40×40 rounded-LG tile (icon classes
 *     on the svg itself, w-5 h-5), the P text-2xl value + P text-xs
 *     slate-500 label inside a CLASSLESS div; the default bordered
 *     Card (no border-slate-200) — live-measured @1440×900.
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
  | "horizontal-bare"
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
  /** Session 48 (R47-D1): per-page tag overrides — REF's stat tags vary
   *  per page within a variant (the four analytics compacts render p/p
   *  where recruitment/compliance render div/div). */
  valueTag?: "p" | "div";
  labelTag?: "p" | "div";
  /** Session 48 (R47-D2c): the standard variant's tile-row class —
   *  advancedanalytics/payrollai/allleaverequests render the tile row
   *  WITHOUT the mb-3 (the value's mt-4 supplies the stack instead). */
  tileRowClassName?: string;
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
  // Session 49 (R48-C7): requestreports' horizontal-bare — same content
  // row contract, live-measured fresh this round.
  "horizontal-bare": "p-4 flex items-center gap-3",
  "value-in-tile": "p-4 flex items-center gap-3",
  "no-tile": "p-6",
  "tile-right": "p-6",
};

/** Session 47 (R46-C): REF renders its stat families with PER-PAGE
 *  element tags — the standard variant (live-measured on attendance's
 *  zero-state row) renders div values + div labels; the horizontal
 *  variant (documenttracker) renders p values + p labels.
 *  Session 48 (R47-D1): the tags vary PER PAGE within a variant too —
 *  the four analytics compacts render p/p + a slate-600 label while
 *  recruitment/compliance keep div/div + slate-500; the no-tile pages
 *  render label-TOP p + value-BELOW p; tile-right/mini/mini-centered/
 *  compact-s labels are p. The per-call-site valueTag/labelTag props
 *  override the variant defaults. */
const VARIANT_VALUE_TAG: Partial<Record<StatCardVariant, "p" | "div">> = {
  standard: "div",
  compact: "div",
};
const VARIANT_LABEL_TAG: Partial<Record<StatCardVariant, "p" | "div">> = {
  horizontal: "p",
  "horizontal-bare": "p",
  "no-tile": "p",
  "tile-right": "p",
  mini: "p",
  "mini-centered": "p",
  "compact-s": "p",
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
  // Session 49 (R48-C7): the horizontal-bare value (requestreports' P
  // text-2xl font-bold text-slate-900, live-measured).
  "horizontal-bare": "text-2xl font-bold text-slate-900",
  "value-in-tile": "text-lg font-bold text-slate-700",
  /* Session 48 (R47-D1b): the no-tile value carries mt-1 and renders
   * BELOW its label — REF's text stack (live-measured on
   * performancemanagement + workflowautomation at zero):
   * p.text-sm text-slate-600 (label, TOP) + p.text-3xl … mt-1 (value).
   * This CORRECTS the session-14 R13-I contract (value-first + mb-1) —
   * the session-14 reader mis-attributed the order (the r46 instrument
   * lesson: full-tree reads only). */
  "no-tile": "text-3xl font-bold text-slate-900 mt-1",
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
  // Session 49 (R48-C7): the horizontal-bare label (requestreports' P
  // text-xs text-slate-500).
  "horizontal-bare": "text-xs text-slate-500",
  /* Session 47 (R46-C3): the compact label is text-slate-500 (measured on
     recruitment's zero-state row: div.text-sm text-slate-500 — the
     standard family keeps slate-600). */
  compact: "text-slate-500",
};

/** Variants that render the icon tile (the reference's mini, mini-centered
 *  and no-tile stat cards carry no icon tile at all). */
const TILED: readonly StatCardVariant[] = [
  "standard",
  "compact",
  "compact-s",
  "horizontal",
  "horizontal-bare",
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
  valueTag,
  labelTag,
  tileRowClassName,
  variant = "standard",
  className,
}: StatCardProps) {
  const tile = tileClassName ?? iconClassName;
  const tiled = icon != null && TILED.includes(variant);

  // Tile geometry per variant: standard/tile-right = 48×48 (h-12 w-12 with
  // a flex-CENTERED 24px icon — NOT p-3: session 17 R16-D measured REF's
  // tile padding at 0px, so its min-content is the bare svg and it
  // flex-shrinks 48→24 at constrained card widths), compact/compact-s =
  // 40×40 (w-10 h-10 + 20px icon), horizontal = 44×44 (w-11 h-11 + 20px
  // icon — session 12 R11-D: the icon is 20px w-5 h-5 with a per-color
  // text class from the call site, not 24px).
  /* Session 48 (R47-D1): REF's tiles carry GEOMETRY + BG only — the icon
   * size + color ride the svg's own classes (w-5 h-5 text-{c}-600 on the
   * compacts, w-6 h-6 on the 48px tiles — live-measured on recruitment,
   * attendancedashboard, surveyanalytics, analyticsdashboard,
   * assetmanagement, compliance, payrollmodule, analytics,
   * advancedanalytics). The compact tile carries mb-3 DIRECTLY (no flex
   * wrapper). The horizontal tile keeps the r46-measured guard form
   * (documenttracker's own contract). */
  const tileClasses =
    variant === "compact" || variant === "compact-s"
      ? "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-100"
      : variant === "horizontal"
        ? "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-5 [&_svg]:w-5"
        : variant === "horizontal-bare"
          ? /* Session 49 (R48-C7): requestreports' tile — 40×40 rounded-LG
             * with BG only; the icon size + color ride the svg's own
             * classes (w-5 h-5 text-{c}-600, NO guard — live-measured). */
            "w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100"
          : "w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100";

  const tileElement = tiled ? (
    /* Session 17 (R16-D): NO shrink-0 — the reference's tile flex-shrinks
     * at constrained card widths (analytics @768: 94px cards squeeze the
     * tile to 24px); a shrink-0 tile stays 48px and overflows the page
     * (docW 797 vs REF 768). Shrink only engages under constraint —
     * unconstrained viewports render the pinned 48/40/44px geometry. */
    <div className={cn(tileClasses, tile)}>{icon}</div>
  ) : null;

  const ValueTag = valueTag ?? VARIANT_VALUE_TAG[variant] ?? "p";
  const LabelTag = labelTag ?? VARIANT_LABEL_TAG[variant] ?? "div";
  /* Session 48 (R47-D1b): the no-tile text stack is label-TOP /
   * value-BELOW (REF's measured order) — the shared textBlock renders
   * value-first, so no-tile builds its own pair. */
  const textBlock = (
    <>
      {variant === "no-tile" ? (
        <>
          <LabelTag className={cn("text-sm text-slate-600", labelClassName)}>{label}</LabelTag>
          <ValueTag className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</ValueTag>
        </>
      ) : (
        <>
          <ValueTag className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</ValueTag>
          <LabelTag className={cn("text-sm text-slate-600", VARIANT_LABEL[variant], labelClassName)}>{label}</LabelTag>
        </>
      )}
    </>
  );

  return (
    <Card
      className={cn(
        // Session 12 (R11-D): the horizontal variant renders border-0 with
        // shadow-sm on the reference (documenttracker 80px cards).
        // Session 48 (R47-D1b): the no-tile card drops border-slate-200
        // (REF performancemanagement: rounded-xl border bg-card
        // text-card-foreground shadow); value-in-tile KEEPS it (REF
        // evaluations card measured this round).
        // Session 49 (R48-C7): the horizontal-bare card is the DEFAULT
        // bordered form too (REF requestreports). Session 49 (R48-C5):
        // the mini-centered card is bare as well (REF hrreports +
        // notificationpreferences, measured this round).
        variant === "horizontal"
          ? "border-0 shadow-sm"
          : variant === "no-tile" || variant === "horizontal-bare" || variant === "mini-centered"
            ? ""
            : "border-slate-200",
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
            /* Session 48 (R47-D1b): the reference's no-tile stat card is a
               flex row — the text stack (label p TOP, value p mt-1 BELOW)
               on the LEFT, a BARE 40×40 icon on the RIGHT (classes on the
               svg itself, e.g. lucide-target w-10 h-10 text-blue-500 — no
               wrapper div). Live-measured at zero on
               /performancemanagement + /workflowautomation; this CORRECTS
               the session-14 R13-I contract (the session-14 reader
               mis-attributed the order — full-tree reads only). */
            <div className="flex items-center justify-between">
              <div>{textBlock}</div>
              {icon != null ? icon : null}
            </div>
          ) : (
            textBlock
          )
        ) : variant === "horizontal" ? (
          <>
            {tileElement}
            <div className="min-w-0">{textBlock}</div>
          </>
        ) : variant === "horizontal-bare" ? (
          /* Session 49 (R48-C7): the text pair rides a CLASSLESS div (REF
           * requestreports: DIV{} > P text-2xl + P text-xs — not the
           * min-w-0 block the documenttracker form carries). */
          <>
            {tileElement}
            <div>{textBlock}</div>
          </>
        ) : variant === "tile-right" ? (
          /* Session 13 (R12-E): the reference's stacked stat tile — label
             (text-sm slate-500) on TOP, value (text-3xl bold mt-2) below,
             delta (text-xs slate-500 mt-2) under it; the 48×48 tile rides
             top-right. 138px card, measured on /analytics.
             Session 48 (R47-D1c): the label + value are P on REF. */
          <div className="flex items-start justify-between">
            <div>
              <LabelTag className={cn("text-sm text-slate-500", labelClassName)}>{label}</LabelTag>
              <ValueTag className={cn(VARIANT_VALUE[variant], valueClassName)}>{value}</ValueTag>
              {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
            </div>
            {tileElement}
          </div>
        ) : (
          <>
            {variant === "compact" || variant === "compact-s" ? (
              /* Session 48 (R47-D1): the compact family renders the tile
                 DIRECTLY — mb-3 on the tile itself, no flex wrapper (REF
                 live-measured: w-10 h-10 … mb-3). */
              tileElement
            ) : (
              <div className={cn("mb-3 flex items-start justify-between", tileRowClassName)}>{tileElement}</div>
            )}
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
