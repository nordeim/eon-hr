"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SidebarNav, type ShellUser } from "./sidebar-nav";
import { BOTTOM_NAV } from "@/lib/nav-config";

/**
 * Application shell: fixed desktop sidebar + mobile drawer + bottom tab bar.
 *
 * Geometry measured from the reference app (session-2 audit):
 *   - mobile drawer sheet: 288px wide, full height, overlay bg-black/80
 *   - mobile top bar: px-6 py-4 with brand + "Demo" subtitle
 *   - bottom tabs: flex-col items, 44px min height, no active highlight
 *     (the reference does not highlight the active bottom tab)
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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarNav user={user} />
      </aside>

      {/* Mobile drawer (reference: 288px sheet, dark 80% overlay, no X button) */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 lg:hidden"
            aria-hidden="true"
          />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[288px] max-w-[85vw] flex-col bg-sidebar shadow-lg outline-none transition-transform duration-300 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Main navigation</DialogPrimitive.Description>
            <SidebarNav user={user} variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (reference: pad 16px 24px, border-b slate-200,
            toggle button p-8 + 24px icon = 40px row → 73px total header) */}
        <header className="sticky top-0 z-10 border-b border-sidebar-border bg-white px-6 py-4 lg:hidden">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle Sidebar"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-slate-100"
            >
              <PanelLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-bold leading-tight text-foreground">EonHR</span>
              <span className="text-xs leading-tight text-muted-foreground">Demo</span>
            </div>
          </div>
        </header>

        {/* Reference content wrapper: p-4 md:p-8 with pb-20 md:pb-0 for the
            mobile bottom-bar clearance. */}
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-0">{children}</main>

        {/* Mobile bottom tab bar (reference: no active-state highlight,
            flex-col items with 44px min height) */}
        <nav
          aria-label="Bottom navigation"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <div className="flex items-center justify-around px-2 py-2">
            {BOTTOM_NAV.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="flex min-h-[44px] select-none flex-col items-center gap-1 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
