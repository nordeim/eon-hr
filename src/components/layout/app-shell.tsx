"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Users, ListChecks, CalendarCheck, UserRound } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SidebarNav, type ShellUser } from "./sidebar-nav";
import { BOTTOM_NAV } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const BOTTOM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Staff: Users,
  Tasks: ListChecks,
  Attendance: CalendarCheck,
  Profile: UserRound,
};

/**
 * Application shell: fixed desktop sidebar + mobile drawer + bottom tab bar.
 *
 * Trap 4 note (docs/Tailwind-V4-Validation-Report.md): the mobile drawer's
 * Dashboard CTA does NOT carry an explicit mt-3 inside a space-y container —
 * v3's .space-y selector would override it while v4's :where() wrapper lets
 * it win, producing an 8px panel-height delta. The drawer uses flex gap
 * layout instead, which renders identically on both engines.
 */
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarNav user={user} />
      </aside>

      {/* Mobile drawer */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 lg:hidden"
            aria-hidden="true"
          />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col bg-sidebar shadow-xl outline-none transition-transform duration-200 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </DialogPrimitive.Close>
            <SidebarNav user={user} variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
          <button
            type="button"
            aria-label="Toggle Sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="EonHR home">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <rect width="20" height="14" x="2" y="6" rx="2" />
              </svg>
            </div>
            <span className="text-base font-bold text-foreground">EonHR</span>
          </Link>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Bottom navigation"
          className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {BOTTOM_NAV.map((tab) => {
            const Icon = BOTTOM_ICONS[tab.label] ?? Home;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
