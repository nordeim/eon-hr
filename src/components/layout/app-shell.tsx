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

  return (
    <div className="flex min-h-screen w-full bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <SidebarNav user={user} />
      </aside>

      {/* Mobile drawer (reference: 288px sheet, dark 80% overlay, no X button) */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 md:hidden"
            aria-hidden="true"
          />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[288px] max-w-[85vw] flex-col bg-sidebar shadow-lg outline-none transition-transform duration-300 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 md:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Main navigation</DialogPrimitive.Description>
            <SidebarNav user={user} variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (session-5 re-measurement): px-6 py-4 + a 40px
            content row — 28×28 toggle with a 16px PanelLeft icon, brand
            block = h1 "EonHR" 16px/700 slate-900 + p "Demo" text-xs
            text-slate-500 stacked (24+16 = 40px). items-center; header =
            16+40+16+1 = 73px. */}
        <header className="sticky top-0 z-10 border-b border-sidebar-border bg-white px-6 py-4 md:hidden">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle Sidebar"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-900 transition-colors hover:bg-slate-100"
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
            the earlier "no active highlight" note was a stale measurement). */}
        <nav
          aria-label="Bottom navigation"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
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
                    active ? "text-blue-600" : "text-slate-600 hover:text-foreground"
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
