import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  subtitleClassName,
  actionsClassName,
  className,
  mobileKicker = false,
  mobileKickerTitle,
  mobileKickerBack = false,
  mobileKickerSubtitle,
  mobileKickerSubtitleClassName,
  mobileHeader = "visible",
  centered = false,
  actionsStart = false,
  rowBreakpoint = "sm",
  bare = false,
  alwaysRow = false,
  heroClassName,
  actionsBare = false,
  actionsNowrap = false,
  actionsUnwrapped = false,
}: {
  section?: string;
  sectionIcon?: React.ReactNode;
  /** Badge icon color — the reference colors these per module. */
  iconClassName?: string;
  title: string;
  subtitle?: string;
  /** Session 13 (R12-D): per-page subtitle override — hrreports' subtitle
   *  sits flush under the h1 (no mt-1; 52px title block), unlike the other
   *  md-size pages (nprefs/staffrequests/workflowconfig keep mt-1). */
  subtitleClassName?: string;
  actions?: React.ReactNode;
  /** Session 13 (R12-D): per-page actions-cluster override — hrreports'
   *  cluster is `flex gap-2` (REF-measured 284px), not the default gap-3. */
  actionsClassName?: string;
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
  /** Session 18 (R17-B): REF's /profile kicker is a distinct variant — a
   *  leading 36×36 ghost ArrowLeft (w-5 h-5) at (32,105) navigating back
   *  to the dashboard + a text-xs slate-500 subtitle line (row 44px,
   *  kicker 69px, vs the standard 53px h1-only recipe the other seven
   *  kickers use). Measured at 390×844; the other kickers carry neither
   *  the button nor the subtitle (byte-identical sweep, this round). */
  mobileKickerBack?: boolean;
  mobileKickerSubtitle?: string;
  /** Session 61 (R61-O): REF's kicker subtitles vary per page — the
   *  profile's "Manage your account" renders slate-400 (live-measured
   *  via the hidden-kicker read) while the rest sit at slate-500; the
   *  escape hatch lets a call site override (twMerge). */
  mobileKickerSubtitleClassName?: string;
  /** Session 18 (R17-A): REF's default-family header rows switch
   *  flex-col → flex-row at md (768) — `flex flex-col md:flex-row
   *  justify-between items-start md:items-center gap-4` (measured on
   *  payrollmodule, documenttracker, recruitmentkanban, assetmanagement,
   *  attendance, recruitment, shiftcalendar, staffrequests,
   *  attendancedashboard in the first 640–767 band sweep). REF is
   *  per-page inconsistent: templates/workflowconfigpage and the
   *  actionsStart family are UNPREFIXED always-rows — those keep the sm
   *  default (row at 640–767, column below = the fitting superset). */
  rowBreakpoint?: "sm" | "md";
  /** "hidden" adds `hidden md:flex` to the desktop header block — the
   *  reference wraps its desktop header in a hidden md:flex div on the
   *  category-A routes (page actions are desktop-only there). */
  mobileHeader?: "visible" | "hidden";
  /** Session 9 (R8-B): training / evaluations / companywall / organogram
   *  wrap their header block in `text-center` on the reference — the
   *  badge (inline-flex), h1 and subtitle all center. */
  centered?: boolean;
  /** Session 11 (R10-E): the reference has TWO action-alignment patterns —
   *  items-center (actions land on the h1 row: taskmanager y=116,
   *  employees y=46) and items-start (actions ride the BADGE row: y=32
   *  flat recipes, y=64 raised — offboarding, compliancedashboard,
   *  allleaverequests, workflowautomation, loans, advancedanalytics).
   *  Measured row classes: `flex justify-between items-start`. */
  actionsStart?: boolean;
  /** Session 49 (R48-A2): the BARE family — REF renders the hero block
   *  as a DIRECT child of the content wrapper with NO hero row at all
   *  (organogram/companywall/evaluations/training/hrassistant →
   *  DIV[text-center]; reports/interviewassistant/securitysettings/
   *  communications/settings/profile/analytics/notificationpreferences/
   *  announcements → classless DIV; hrassistantchat → DIV[mb-6] via
   *  heroClassName). Measured on REF @1440×900 this round. */
  bare?: boolean;
  /** Session 49 (R48-A3): the always-row families — REF renders the
   *  UNPREFIXED always-row (`flex justify-between items-start` on
   *  offboarding/compliance/performance/workflowautomation/
   *  allleaverequests/payrollai/assets/advancedanalytics;
   *  `flex items-center justify-between` on hrreports/requestreports,
   *  templates `…mb-8`, workflowconfigpage `…mb-6` via className).
   *  No responsive collapse, no recipe.row offset. */
  alwaysRow?: boolean;
  /** Session 49 (R48-A2): per-page hero-block class override for the
   *  bare family (hrassistantchat's `mb-6` block). */
  heroClassName?: string;
  /** Session 49 (R48-A5): hrreports/requestreports' cluster is the BARE
   *  `flex gap-2` — no flex-wrap, no items-center, no gap-3. */
  actionsBare?: boolean;
  /** Session 81 (R81-C): the BARE UNWRAPPED `flex gap-3` cluster — the r81
   *  cluster census (34 pages read on BOTH sides @1024) measured the REF
   *  per-page inconsistent: payrollmodule + attendancedashboard wrap
   *  (`flex items-center gap-3 flex-wrap` — the default matches those),
   *  staffrequests rides gap-2, and FIVE pages (payroll, taskmanager,
   *  documenttracker, attendance, assetmanagement) ride the bare
   *  unwrapped `flex gap-3`. The wrap default on those five collapsed
   *  their header rows at tablet width where the REF's rows keep their
   *  natural min-content and the page overflows (the REF-authored
   *  overflow class — payroll ref scrollW 861 vs the wrapped 768). */
  actionsNowrap?: boolean;
  /** Session 49 (R48-A5): REF renders SINGLE actions DIRECTLY in the
   *  row (leavemanagement, assets, payrollreports' WhatsApp) — no
   *  wrapper div at all. */
  actionsUnwrapped?: boolean;
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
        // Session 47 (R46-A5): the CLASS re-adopted verbatim — the live
        // census reads REF's current kicker as `md:hidden sticky top-0
        // z-20 bg-white dark:bg-slate-900 border-b border-slate-200
        // dark:border-slate-800 px-4 py-3 safe-area-top` (the sticky stays
        // inert inside the r39 scroller stack; the dark: pair + the
        // safe-area-top member are the r39 shell families).
        <div className="md:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-top">
          <div className="flex items-center gap-3">
            {mobileKickerBack ? (
              // Session 18 (R17-B): REF's back button — ghost h-9 w-9 with
              // the 20px ArrowLeft (w-5 h-5, NOT the 16px default). REF
              // navigates to /Dashboard (its casing quirk); the clone links
              // to the casing-fixed /dashboard (documented deviation) and
              // carries an aria-label REF lacks (a11y superset).
              // Session 49 (R48-C3): REF's kicker back button carries
              // select-none too (measured on payrollreports' kicker).
              <Button variant="ghost" className="h-9 w-9 select-none" asChild>
                <Link href="/dashboard" aria-label="Back to dashboard">
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
            <div className="min-w-0 flex-1">
              {/* Session 48 (R47-A1): REF's kicker h1 carries the dark pair
                (measured on every REF kicker — text-lg font-bold
                text-slate-900 dark:text-white truncate). */}
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{mobileKickerTitle ?? title}</h1>
              {mobileKickerSubtitle ? <p className={cn("text-xs text-slate-500 truncate", mobileKickerSubtitleClassName)}>{mobileKickerSubtitle}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
      {bare ? (
        // Session 49 (R48-A2): the bare family — the hero block as a
        // DIRECT child of the content wrapper, no row at all. REF renders
        // the block classless (or text-center on the centered pages,
        // mb-6 on hrassistantchat via heroClassName). Pages that keep a
        // header-level action (announcements' non-zero New Announcement)
        // render it as the block's trailing sibling — the zero-state
        // parity surface is untouched (actions absent at zero).
        <div className={cn(centered && "text-center", heroClassName) || undefined}>
          <HeroBlock
            hasBadge={hasBadge}
            recipe={recipe}
            size={size}
            section={section}
            sectionIcon={sectionIcon}
            iconClassName={iconClassName}
            centered={centered}
            title={title}
            titleClassName={titleClassName}
            subtitle={subtitle}
            subtitleClassName={subtitleClassName}
          />
          {actions ? (
            actionsUnwrapped ? (
              actions
            ) : (
              <div
                className={cn(
                  actionsBare ? "flex gap-2" : "flex flex-wrap items-center gap-3",
                  actionsClassName
                )}
              >
                {actions}
              </div>
            )
          ) : null}
        </div>
      ) : (
      <div
        className={cn(
          // Session 9 (R8-A): the reference centers the actions cluster in
          // the whole header block (items-center) — taskmanager's button
          // lands on the h1 row (y=116), employees' at y=46. Not items-start.
          // The raised recipes offset the ROW (recipe.row) so the centered
          // block is the reference's 140px header, not 172px.
          // Session 11 (R10-E): items-start pages ride the badge row instead
          // (offboarding/compliance/allleaverequests/workflowautomation/
          // loans/advancedanalytics — measured `justify-between items-start`).
          // Session 18 (R17-A): the row breakpoint is templated — REF's
          // default family switches at md, the always-row pages keep sm.
          // Session 48 (R47-C1): REF's md-family rows carry the UNPREFIXED
          // members too — `flex flex-col md:flex-row justify-between
          // items-start md:items-center gap-4`. The base members apply to
          // mobile's flex-col cross-axis (render-neutral there) and the
          // justify-between on the column main-axis is inert at auto
          // heights — exactly REF's own member set.
          // Session 49 (R48-A3): the alwaysRow families render the
          // UNPREFIXED always-row — `flex justify-between items-start`
          // (the always-start eight) or `flex items-center justify-between`
          // (hrreports/requestreports + the mb-variants via className).
          // No recipe.row: every measured alwaysRow page rides a flat
          // recipe (the raised mt-8 never appears on the always-rows).
          alwaysRow
            ? cn(
                "flex justify-between",
                actionsStart ? "items-start" : "items-center"
              )
            : cn(
                "flex flex-col gap-4",
                rowBreakpoint === "md" && "justify-between items-start",
                `${rowBreakpoint}:flex-row`,
                rowBreakpoint === "sm" && `${rowBreakpoint}:justify-between`,
                actionsStart
                  ? `${rowBreakpoint}:items-start`
                  : `${rowBreakpoint}:items-center`
              ),
          // The raised offset belongs to BADGE pages only — the reference's
          // bare-page rows (employees, analytics, templates…) start at y=32.
          !alwaysRow && hasBadge && recipe.row,
          mobileHeader === "hidden" && "hidden md:flex",
          className
        )}
      >
      {/* Session 49 (R48-A1): the hero block INSIDE the row — classless
          (or text-center), exactly REF's row > DIV[] > badge/h1/p
          nesting. The r47 form wrapped it in min-w-0 (+ flex-1 when
          centered) — retired this round. */}
      <div className={centered ? "text-center" : undefined}>
        <HeroBlock
          hasBadge={hasBadge}
          recipe={recipe}
          size={size}
          section={section}
          sectionIcon={sectionIcon}
          iconClassName={iconClassName}
          centered={centered}
          title={title}
          titleClassName={titleClassName}
          subtitle={subtitle}
          subtitleClassName={subtitleClassName}
        />
      </div>
      {/* Session 16 (R15-C): NO shrink-0 on the cluster — a shrink-0 flex
          child keeps its 911px natural width inside the wrapping header row
          and overflows the page at mid viewports (attendance docW 1199 at
          1100) instead of letting the cluster's own flex-wrap wrap its
          buttons. Shrinking only engages under constraint, so pages whose
          cluster fits its row render identically.
          Session 49 (R48-A5): REF's own clusters are the bare `flex gap-2`
          (hrreports/requestreports) or NOTHING — single actions render
          directly in the row (leavemanagement, assets, payrollreports).
          Session 81 (R81-C): the per-page map completed — the wrap family
          stays the default (payrollmodule + attendancedashboard measured
          wrapping on the REF), with actionsBare (gap-2),
          actionsUnwrapped, and actionsNowrap (the bare gap-3) as the
          measured per-page variants. */}
      {actions ? (
        actionsUnwrapped ? (
          actions
        ) : (
          <div
            className={cn(
              actionsBare ? "flex gap-2" : actionsNowrap ? "flex gap-3" : "flex flex-wrap items-center gap-3",
              actionsClassName
            )}
          >
            {actions}
          </div>
        )
      ) : null}
      </div>
      )}
    </>
  );
}

/** Session 49 (R48-A1): the hero block — REF renders it CLASSLESS on
 *  every measured page (the clone's min-w-0 + flex-1 wrapper was a
 *  universal divergence, retired this round). The centered variant
 *  carries `text-center` ONLY — every measured centered page is
 *  row-less, so the r9 fill-the-row rationale never applies. */
function HeroBlock({
  hasBadge,
  recipe,
  size,
  section,
  sectionIcon,
  iconClassName,
  centered,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
}: {
  hasBadge: boolean;
  recipe: (typeof HEADER_LAYOUTS)[HeaderLayout];
  size: "lg" | "md";
  section?: string;
  sectionIcon?: React.ReactNode;
  iconClassName: string;
  centered: boolean;
  title: string;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
}) {
  return (
    <>
      {/* Session 10 (R9-A): centered headers center the badge/h1/sub —
          the block-level text-center carries down (inline-flex badge,
          h1, p all center). */}
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
            !hasBadge && size === "md" && "text-sm",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </>
  );
}
