"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SidebarNav, type ShellUser } from "./sidebar-nav";
import { BOTTOM_NAV } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

/**
 * Application shell: fixed desktop sidebar + mobile drawer + bottom tab bar.
 *
 * Geometry measured from the reference app (session-2 audit):
 *   - mobile drawer sheet: 288px wide, full height, 80% black overlay
 *   - mobile top bar: px-6 py-4 with brand + "Demo" subtitle
 *   - bottom tabs: flex-col items, 44px min height, no active highlight
 *     (the reference does not highlight the active bottom tab)
 *
 * Responsive boundary (session 7, R6-A): the reference switches between
 * mobile chrome and the desktop sidebar at md (768px) — its bottom bar
 * is md:hidden and its sidebar mounts from md up. Verified by viewport
 * sweep at 700/767/768/800/900/1024 on both apps.
 *
 * Trap 4 note (docs/Tailwind-V4-Validation-Report.md): the mobile drawer
 * content uses flex gap layout — no mt-* / mb-* children inside space-y
 * containers (v3's selector specificity would override them, v4's
 * :where() wrapper does not, producing an 8px panel-height delta).
 */
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Session 31 (R30-D): the swipe-to-close gesture — the mobile-menu
     superset. Touch handlers on the drawer panel: a horizontal-dominant,
     leftward drag live-translates the panel; past the threshold (96px, a
     third of the 288px panel) the release closes. tailwindcss-animate's
     exit keyframes define only the `to` state, so the close animation
     starts from the CURRENT inline transform — the panel continues from
     the finger, no snap-back. Below the threshold the panel springs back
     (300ms, the drawer's own curve). The vertical nav scroll is untouched
     (the dominant-axis guard) and the at-rest geometry is unchanged —
     the panel carries no transform until a gesture starts. */
  const drawerRef = React.useRef<HTMLDivElement | null>(null);
  const swipe = React.useRef({ startX: 0, startY: 0, active: false });
  const SWIPE_THRESHOLD = 96;

  /* Session 33 (R32-C): the swipe-to-open twin — a horizontal-dominant,
     rightward drag that STARTS within 32px of the left viewport edge
     (mobile, drawer closed) opens the drawer once the drag passes 24px;
     the panel then plays its own 500ms slide-in. Handlers live on the
     main column wrapper — the bottom nav and the drawer panel are
     siblings, untouched. The edge window keeps ordinary horizontal
     scrolls (carousels, tables) from summoning the drawer, and the
     dominant-axis guard keeps vertical page scrolls inert. At-rest
     DOM and desktop are unchanged (interaction-state only, the R30-D
     pattern; REF ships no open gesture — this is the documented
     mobile-menu superset). */
  const EDGE = 32;
  const OPEN_THRESHOLD = 24;
  const edgeSwipe = React.useRef({ startX: 0, startY: 0, armed: false, fired: false });

  const onMainTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || mobileOpen) return;
    const t = e.touches[0];
    edgeSwipe.current = { startX: t.clientX, startY: t.clientY, armed: t.clientX <= EDGE, fired: false };
  };
  const onMainTouchMove = (e: React.TouchEvent) => {
    const s = edgeSwipe.current;
    if (!s.armed || s.fired || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - s.startX;
    const dy = e.touches[0].clientY - s.startY;
    if (dx >= OPEN_THRESHOLD && dx > Math.abs(dy)) {
      s.fired = true;
      setMobileOpen(true);
    }
  };

  const onDrawerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    swipe.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, active: true };
  };
  const onDrawerTouchMove = (e: React.TouchEvent) => {
    if (!swipe.current.active || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - swipe.current.startX;
    const dy = e.touches[0].clientY - swipe.current.startY;
    if (dx >= 0 || Math.abs(dx) <= Math.abs(dy)) return; // leftward + horizontal-dominant only
    const el = drawerRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = `translateX(${Math.max(dx, -288)}px)`;
  };
  const onDrawerTouchEnd = (e: React.TouchEvent) => {
    if (!swipe.current.active) return;
    swipe.current.active = false;
    const el = drawerRef.current;
    if (!el) return;
    const dx = e.changedTouches[0].clientX - swipe.current.startX;
    if (dx < -SWIPE_THRESHOLD) {
      // keep the inline transform — the Radix exit animation continues
      // from it; only the transition style would fight the animation
      el.style.transition = "";
      setMobileOpen(false);
    } else {
      // spring back along the drawer's own curve
      el.style.transition = "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
      el.style.transform = "";
      window.setTimeout(() => {
        if (el.isConnected) el.style.transition = "";
      }, 320);
    }
  };

  return (
    /* Session 33 (R32-A): the dark canvas — REF's shell root swaps the
       slate-50 -> blue-50 gradient for slate-900 -> slate-800 in dark
       (sRGB-pinned per trap 3, live-measured
       rgb(15,23,42) -> rgb(30,41,59)). */
    <div className="flex min-h-screen w-full bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] dark:bg-[linear-gradient(to_right_bottom,#0f172a,#1e293b)]">
      {/* Desktop sidebar. Session 33 (R32-A/E): REF authors its aside with
          hardcoded classes — bg-white in LIGHT (a 31-round-invisible 5-unit
          find: every prior audit compared sidebar geometry or the MOBILE
          drawer, which is the --sidebar token #fafafa on both apps) and
          dark:bg-slate-900 + dark:border-slate-800 in dark. The mobile
          drawer below keeps the token (bg-sidebar), which flips. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex md:flex-col">
        <SidebarNav user={user} />
      </aside>

      {/* Mobile drawer (reference: 288px sheet, dark 80% overlay, no X button) */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          {/* Session 22 (R21-C): REF's drawer overlay fades ~150ms (vaul
              fadeIn/fadeOut) and the panel SLIDES — 500ms open /
              300ms close with cubic-bezier(0.32,0.72,0,1) (measured
              frame-sampled). The old transition-* classes could never
              fire: Radix mounts the Content fresh with data-state=open
              already set, and transitions need a state change on a live
              element — animations run from mount. Radix also waits for
              animationend before unmounting, so the close plays too. */}
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out md:hidden"
            aria-hidden="true"
          />
          <DialogPrimitive.Content
            ref={drawerRef}
            onTouchStart={onDrawerTouchStart}
            onTouchMove={onDrawerTouchMove}
            onTouchEnd={onDrawerTouchEnd}
            /* Session 31 (R30-A): REF's drawer panel ships a 1px right
               border in the DEFAULT border color #e5e5e5 (measured
               rgb(229,229,229) — the base layer's * { border-color },
               NOT the desktop sidebar's slate token). border-r picks it
               up; the panel stays 288px (border-box). */
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[288px] max-w-[85vw] flex-col border-r bg-sidebar shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:[animation-duration:500ms] data-[state=closed]:[animation-duration:300ms] [animation-timing-function:cubic-bezier(0.32,0.72,0,1)] md:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Main navigation</DialogPrimitive.Description>
            <SidebarNav user={user} variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Main column — carries the swipe-to-open edge listeners (R32-C):
          the handlers only arm inside the 32px left-edge window, so
          ordinary content scrolls never trigger. */}
      <div className="flex min-w-0 flex-1 flex-col" onTouchStart={onMainTouchStart} onTouchMove={onMainTouchMove}>
        {/* Mobile top bar (session-5 re-measurement): px-6 py-4 + a 40px
            content row — 28×28 toggle with a 16px PanelLeft icon, brand
            block = h1 "EonHR" 16px/700 slate-900 + p "Demo" text-xs
            text-slate-500 stacked (24+16 = 40px). items-center; header =
            16+40+16+1 = 73px. Session 33 (R32-A): the dark chrome — REF's
            mobile header flips to slate-900 bg + slate-800 border (dark:
            classes, live-measured); the brand h1/sub stay hardcoded. */}
        <header className="sticky top-0 z-10 border-b border-sidebar-border dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 md:hidden">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle Sidebar"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              /* Session 20 (R19-J): REF's hamburger inherits the foreground
                 (#0A0A0A, no color class) and hovers bg-slate-100 +
                 text-accent-foreground (#171717) — measured, replacing the
                 text-slate-900 rest color. */
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">EonHR</h1>
              <p className="text-xs text-slate-500">Demo</p>
            </div>
          </div>
        </header>

        {/* Reference main (session 6): bare flex column — `flex-1 flex
            flex-col pb-20 md:pb-0`. Page padding lives on each page's own
            root div (p-4 md:p-8, per-page gradient canvases — see the
            codemod + docs/remediation-plan-session6.md §S2). */}
        <main className="flex-1 flex flex-col pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom tab bar (session-5 re-measurement): labels are
            text-sm font-medium (14px/21px), 61px items, 78px bar — and the
            ACTIVE tab is highlighted text-blue-600 (#2563EB, icon + label;
            the earlier "no active highlight" note was a stale measurement).
            Session 33 (R32-A): the dark chrome — the bar flips to
            slate-900 + slate-800 border; the active tab flips to blue-400
            on a blue-900/20 pill; inactive tabs flip to slate-400 (all
            REF-measured in dark). */}
        <nav
          aria-label="Bottom navigation"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border dark:border-slate-800 bg-white dark:bg-slate-900 pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <div className="flex items-center justify-around px-2 py-2">
            {BOTTOM_NAV.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={cn(
                    "flex min-h-[44px] select-none flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  /* Session 20 (R19-K): REF's bottom tabs carry NO hover
                     classes — the inactive tab stays slate-600 (the clone's
                     old hover color flip was an unmeasured superset).
                     Session 21 (R20-B): the ACTIVE tab renders the
                     bg-blue-50 pill (rgb(239,246,255), pixel-verified on
                     REF's mobile dashboard — missed by prior rounds that
                     compared label color/geometry but never the tab's own
                     background). */
                    active ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium leading-normal">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
