"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Moon, Sun, Languages, LogOut, User, CircleUser, Briefcase } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { NAV_ITEMS, type NavItem, type NavChild } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export interface ShellUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** The sidebar navigation tree — shared by desktop rail and mobile drawer. */
export function SidebarNav({
  user,
  onNavigate,
  variant = "desktop",
}: {
  user: ShellUser;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader />
      <nav className="flex-1 overflow-y-auto px-5 pb-4 pt-5 scrollbar-thin">
        <div className="flex h-8 shrink-0 items-center px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </div>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.children ? <CollapsibleNavItem item={item} pathname={pathname} onNavigate={onNavigate} /> : <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />}
            </li>
          ))}
        </ul>
      </nav>
      <SidebarFooter user={user} variant={variant} />
    </div>
  );
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
      {/* Brand mark — reference (live-measured session 3): 40×40 squircle,
          12px radius, gradient to-right-bottom #2563EB → #4F46E5 (sRGB —
          arbitrary value per Tailwind v4 trap 3, oklab interpolation would
          shift the midpoint), v3 shadow-lg geometry, white 24px stroke-2
          briefcase; rendered in CSS so parity needs no image asset.
          Session 5: row px-6 (tile x=24), h2 text-lg 18px/700 slate-900
          (#0f172a — NOT the gray-900 foreground token), sub text-xs. */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(to_right_bottom,#2563EB,#4F46E5)] shadow-lg">
        <Briefcase className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col">
        <h2 className="text-lg font-bold leading-tight text-slate-900">EonHR</h2>
        <span className="text-xs leading-tight text-muted-foreground">Demo</span>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = pathname === item.href;
  const Icon = item.icon;
  return (
    <Link
      href={item.href!}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Reference leaf-link recipe (session-5 live measurement): the
        // Base44 app renders leaf links at px-3 py-2.5 gap-3 with 16px
        // icons and mb-1 (40px list pitch) — while its GROUP buttons use
        // p-2/gap-2 with 20px icons. Hover = custom-accent-bg (#e4e6eb,
        // the reference :root --accent-color) plus opacity-80.
        "flex h-8 items-center gap-3 rounded-lg px-3 py-2.5 text-sm mb-1 outline-none transition-all duration-200 hover:opacity-80",
        "focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary font-medium text-white shadow-sm"
          : "font-normal text-slate-600 hover:bg-[#e4e6eb]"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-600")} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function CollapsibleNavItem({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const childActive = item.children?.some((c) => c.href === pathname) ?? false;
  const [open, setOpen] = React.useState(childActive);
  React.useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);
  const Icon = item.icon;
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className={cn(
          // Reference group-button recipe: p-2/gap-2 geometry with a 20px
          // leading icon (session-5: measured distinctly from leaf links),
          // hover bg-blue-50 + text-blue-700, mb-1 for the 40px pitch.
          "flex h-8 w-full items-center gap-2 rounded-lg px-2 py-2 text-sm mb-1 outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        )}
        aria-expanded={open}
      >
        <Icon className="h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 text-slate-600 transition-transform duration-200", open && "rotate-90")}
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ul className="mt-1 mb-1 flex flex-col gap-1 pl-4">
          {item.children?.map((child: NavChild) => {
            const active = pathname === child.href;
            const ChildIcon = child.icon;
            return (
              <li key={`${item.label}-${child.label}-${child.href}`}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    // Reference sub-item recipe (byte-verified session 4,
                    // re-verified session 5): h-8 px-3 py-2 gap-3, 16px
                    // icons, 36px pitch, hover accent + opacity-80.
                    "flex h-8 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 hover:opacity-80",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary font-medium text-white shadow-sm"
                      : "font-normal text-slate-600 hover:bg-[#e4e6eb]"
                  )}
                >
                  {ChildIcon ? (
                    <ChildIcon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-600")} aria-hidden="true" />
                  ) : (
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-white" : "bg-border")} aria-hidden="true" />
                  )}
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function SidebarFooter({ user, variant }: { user: ShellUser; variant: "desktop" | "mobile" }) {
  const [dark, setDark] = React.useState(false);
  // Reference default shows the Arabic target label ("عربي"); toggling flips
  // to "EN" — a display-only switch, exactly like the original app.
  const [lang, setLang] = React.useState<"EN" | "عربي">("عربي");

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Session 12 (R11-A) — reference footer recipe (live-measured):
  //   div.flex.flex-col.gap-2.border-t.border-slate-200.dark:border-slate-800.p-4
  //     div.flex.items-center.gap-2.mb-2      (left-aligned cluster, NOT
  //     justify-between) with 36×36 ghost icon buttons (h-9 w-9) and the
  //     outlined h-8 عربي button (80×32, min-w-[64px]), then the 223×36
  //     user trigger below (gap-2 + mb-2 stack = 16px between rows).
  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDark((d) => !d)}
          className="flex h-9 w-9 select-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => setLang((l) => (l === "EN" ? "عربي" : "EN"))}
          title={lang === "عربي" ? "Switch to Arabic" : "Switch to English"}
          className="flex h-8 min-w-[64px] items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-background px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-accent-foreground"
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          {lang}
        </button>
      </div>
      <UserMenu user={user} variant={variant} />
    </div>
  );
}

function UserMenu({ user, variant }: { user: ShellUser; variant: "desktop" | "mobile" }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          // Session 12 (R11-A): the reference renders the user trigger as a
          // full-width h-9 ghost button (223×36) — px-4 py-2, justify-start,
          // gap-3 — with a 36px gradient circle avatar (16px CircleUser) and
          // a flex-1 min-w-0 text-left column (name 20px, email 16px).
          "inline-flex items-center h-9 px-4 py-2 w-full justify-start gap-3 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-colors",
          "hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        {/* Reference avatar: gradient circle with a white CircleUser glyph
            (blue-500 -> indigo-500 endpoints, sRGB-pinned per trap 3). */}
        <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]">
          <CircleUser className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          {/* Session 6: reference renders the user name at slate-900
              (#0f172a — measured), not the neutral foreground token. */}
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 min-w-[200px] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs text-muted-foreground">
            {user.role.replace(/\b\w/g, (c) => c.toUpperCase())}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-secondary"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              My Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/logout"
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 outline-none transition-colors focus:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
