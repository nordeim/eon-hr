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
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </p>
        <ul className="flex flex-col gap-0.5">
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
    <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
      {/* Brand mark — reference (live-measured session 3): 40×40 squircle,
          12px radius, gradient to-right-bottom #2563EB → #4F46E5 (sRGB —
          arbitrary value per Tailwind v4 trap 3, oklab interpolation would
          shift the midpoint), v3 shadow-lg geometry, white 24px stroke-2
          briefcase; rendered in CSS so parity needs no image asset. */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(to_right_bottom,#2563EB,#4F46E5)] shadow-lg">
        <Briefcase className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-base font-bold leading-tight text-foreground">EonHR</span>
        <span className="text-[11px] leading-tight text-muted-foreground">Demo</span>
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
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-primary-foreground" : "text-slate-600")} aria-hidden="true" />
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
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "text-slate-600 hover:bg-slate-100 hover:text-foreground"
        )}
        aria-expanded={open}
      >
        <Icon className="h-4.5 w-4.5 shrink-0 text-slate-600" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 text-slate-600 transition-transform duration-200", open && "rotate-90")}
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ul className="mb-1 flex flex-col gap-0.5 pl-4">
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
                    "flex w-full items-center gap-2 rounded-lg p-2 text-sm outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary font-medium text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
                  )}
                >
                  {ChildIcon ? (
                    <ChildIcon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-slate-600")} aria-hidden="true" />
                  ) : (
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-primary-foreground" : "bg-border")} aria-hidden="true" />
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

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center justify-between gap-1 px-1 pb-2">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDark((d) => !d)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          {dark ? <Sun className="h-4.5 w-4.5" aria-hidden="true" /> : <Moon className="h-4.5 w-4.5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => setLang((l) => (l === "EN" ? "عربي" : "EN"))}
          className="flex h-8 items-center justify-center rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <Languages className="mr-1.5 h-4 w-4" aria-hidden="true" />
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
          "flex w-full items-center gap-3 rounded-md p-2 text-left outline-none transition-colors",
          "hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {/* Reference avatar: gradient circle with a white CircleUser glyph. */}
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]">
          <CircleUser className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
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
