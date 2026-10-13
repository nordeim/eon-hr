"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Moon, Sun, Languages, LogOut, User, CircleUser, Briefcase } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
      {/* Session 23 (R22-A): no scrollbar styling — REF authors zero scrollbar
          rules (computed auto everywhere); the nav scrolls 872>690 on
          expanded-group pages with the browser-default scrollbar. */}
      <nav className="flex-1 overflow-y-auto px-5 pb-4 pt-5">
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
    <div className="flex items-center gap-3 border-b border-sidebar-border dark:border-slate-800 px-6 py-6">
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
        {/* Session 33 (R32-A): REF's brand title flips to white in dark
            (dark:text-white, live-measured rgb(255,255,255)); the sub
            keeps its muted token (flips to neutral-400). */}
        <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">EonHR</h2>
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
        // p-2/gap-2 with 20px icons. Session 20 (R19-A/B): hover = the
        // sidebar tokens — bg zinc-100 #F4F4F5 + text #18181B + opacity-80
        // (REF's hover:bg-sidebar-accent hover:text-sidebar-accent-foreground,
        // settled-measured; the #e4e6eb pin was stale).
        "flex h-8 items-center gap-3 rounded-lg px-3 py-2.5 text-sm mb-1 outline-none transition-all duration-200 hover:opacity-80",
        // Session 19 (R18-C): REF's sidebar focus ring is the SIDEBAR-RING
        // token #3B82F6 (blue-500, --sidebar-ring 217.2 91.2% 59.8% —
        // measured rgb(59,130,246) on leaf links AND group buttons), not
        // the dark global ring token.
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        /* Session 21 (R20-D): REF's active leaf carries the full pressed
           pair, but its unlayered custom-primary-bg keeps the blue under
           press. The clone's bg-primary is a v4 UTILITY — an active:bg
           variant would win specificity ((0,2,0) vs (0,1,0)) and wrongly
           gray the tile — so only the TEXT flip is mirrored (REF's
           measured pressed text = #18181B, bg stays #1877F2). */
        active
          ? "bg-primary font-medium text-white shadow-sm hover:text-[#18181b] active:text-[#18181b]"
          : "font-normal text-slate-600 hover:bg-[#f4f4f5] hover:text-[#18181b] active:bg-[#f4f4f5] active:text-[#18181b]"
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
  /* Session 25 (R24-A): REF's group toggles carry aria-controls in BOTH
     states (its older Radix sets it unconditionally — measured radix-:rh:
     etc. on every collapsed group). The clone's Radix only authors it when
     the content is mounted, so a stable useId is passed to BOTH sides;
     user props spread after Radix's own in the v1.1.x source, so the
     override holds collapsed AND matches the mounted content id open. */
  const contentId = React.useId();
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        aria-controls={contentId}
        className={cn(
          // Reference group-button recipe: p-2/gap-2 geometry with a 20px
          // leading icon (session-5: measured distinctly from leaf links),
          // hover bg-blue-50 + text-blue-700, mb-1 for the 40px pitch.
          // Session 22 (R21-A): REF's group buttons carry the SAME motion
          // recipe as every nav item (settled-measured ~269ms vs the old
          // color-only 150ms ~229ms) — transition-all over 200ms.
          "flex h-8 w-full items-center gap-2 rounded-lg px-2 py-2 text-sm mb-1 outline-none transition-all duration-200",
          // Session 19 (R18-C): REF's sidebar focus ring is the SIDEBAR-RING
        // token #3B82F6 (blue-500, --sidebar-ring 217.2 91.2% 59.8% —
        // measured rgb(59,130,246) on leaf links AND group buttons), not
        // the dark global ring token.
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          /* Session 21 (R20-A/E): pressed = the sidebar tokens — REF's
             pressed-pair utilities (sidebar-accent bg + foreground text)
             beat its blue hover in v3 rule order (measured settled under
             hold). The EXPANDED group hovers the same gray via
             data-[state=open]:hover: (a second hover recipe the r19 audit
             missed — it probed the group only collapsed). */
          "text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-[#f4f4f5] active:text-[#18181b] data-[state=open]:hover:bg-[#f4f4f5] data-[state=open]:hover:text-[#18181b]"
        )}
        aria-expanded={open}
      >
        <Icon className="h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          /* Session 22 (R21-D): REF's chevron carries NO motion classes
             (computed all 0s) — the rotation snaps instantly. The old
             200ms swing was a clone extra; removed for authored parity. */
          className={cn("h-4 w-4 shrink-0 text-slate-600", open && "rotate-90")}
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content id={contentId}>
        <ul className="mt-1 flex flex-col gap-1 pl-4">
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
                    // icons, 36px pitch. Session 20 (R19-A/B): hover = the
                    // sidebar tokens — zinc-100 bg + #18181B text + opacity.
                    "flex h-8 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 hover:opacity-80",
                    // Session 19 (R18-C): REF's sidebar focus ring is the SIDEBAR-RING
        // token #3B82F6 (blue-500, --sidebar-ring 217.2 91.2% 59.8% —
        // measured rgb(59,130,246) on leaf links AND group buttons), not
        // the dark global ring token.
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    active
                      ? "bg-primary font-medium text-white shadow-sm hover:text-[#18181b] active:text-[#18181b]"
                      : "font-normal text-slate-600 hover:bg-[#f4f4f5] hover:text-[#18181b] active:bg-[#f4f4f5] active:text-[#18181b]"
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
  /* Session 33 (R32-A): the Moon is a REAL theme toggle on REF — html.dark
     + localStorage darkMode="true" (the shadcn-neutral palette extracted
     from its live stylesheet now lives in globals.css). The boot script in
     layout.tsx applies the stored theme pre-paint; this state syncs
     post-hydration for the aria-label, and the ICON is class-driven
     (dark:hidden / hidden dark:block) so it can never desync from the
     applied theme. */
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    setDark(localStorage.getItem("darkMode") === "true");
  }, []);
  const onMoonClick = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("darkMode", String(next));
  };
  /* Session 33 (R32-B): REF's عربي flips the app to RTL mode — dir=rtl +
     localStorage app_lang="ar"; the whole layout mirrors (sidebar right,
     tabs mirrored) while the strings stay English (its i18n is not
     wired). The label flips to "EN" with an Arabic title
     ("التبديل إلى الإنجليزية", REF-measured). */
  const [lang, setLang] = React.useState<"EN" | "عربي">("عربي");
  React.useEffect(() => {
    setLang(localStorage.getItem("app_lang") === "ar" ? "EN" : "عربي");
  }, []);
  const onLangClick = () => {
    const next = lang === "EN" ? "عربي" : "EN";
    setLang(next);
    document.documentElement.dir = next === "EN" ? "rtl" : "ltr";
    localStorage.setItem("app_lang", next === "EN" ? "ar" : "en");
  };
  /* Session 25 (R24-B): the stable popover content id — REF's bell carries
     aria-controls even while closed (measured radix-:ro: with exp=false);
     Radix authors it only while open, so the same stable-id override as
     R24-A applies (user props spread after Radix's own). */
  const bellContentId = React.useId();

  // Session 12 (R11-A) — reference footer recipe (live-measured):
  //   div.flex.flex-col.gap-2.border-t.border-slate-200.dark:border-slate-800.p-4
  //     div.flex.items-center.gap-2.mb-2      (left-aligned cluster, NOT
  //     justify-between) with 36×36 ghost icon buttons (h-9 w-9) and the
  //     outlined h-8 عربي button (80×32, min-w-[64px]), then the 223×36
  //     user trigger below (gap-2 + mb-2 stack = 16px between rows).
  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        {/* Session 25 (R24-B): REF's bell is a Radix POPOVER trigger
            (aria-haspopup="dialog" + aria-expanded + aria-controls,
            measured live) opening a 384px notifications panel — the only
            measured surface where REF did more than the clone (the old
            clone bell was a dead button). Recipe DOM-measured: header
            px-4 py-3 border-b row with the h3, body max-h-[480px]
            overflow-y-auto with the faded-bell empty state. */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              aria-controls={bellContentId}
              /* Session 16 (R15-B): the reference's Bell renders slate-600
                 (rgb(71,85,105) measured) — not the muted-foreground token.
                 Session 20 (R19-C): the color lives on the SVG (REF's own
                 class beats the parent's hover color, so the icon STAYS
                 slate-600 under hover) and the button hovers accent +
                 accent-foreground. */
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" alignOffset={-16} id={bellContentId} className="w-96">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              {/* REF renders this empty cluster (the mark-all-read slot on
                  zero data) — kept for DOM parity. */}
              <div className="flex items-center gap-2" />
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              <div className="py-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" aria-hidden="true" />
                <p className="text-sm">No notifications yet</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onMoonClick}
          /* Session 16 (R15-B): the reference's Moon renders zinc-700
             (rgb(63,63,70) = #3F3F46 — pinned in the palette).
             Session 20 (R19-C2): ghost hover = accent + accent-foreground
             (icon inherits → #171717 under hover, REF-measured).
             Session 33 (R32-A): in dark REF's control renders zinc-100
             (rgb(244,244,245) — its sidebar-foreground token flips); the
             icon swaps Moon→Sun with the .dark class itself (class-driven,
             boot-script-safe). */
          className="flex h-9 w-9 select-none items-center justify-center rounded-md text-zinc-700 dark:text-zinc-100 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
          <Sun className="h-4 w-4 hidden dark:block" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onLangClick}
          title={lang === "عربي" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
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
          {/* Session 20 (R19-D): the reference renders the user name at
              slate-900 rgb(15,23,42) (DOM-verified class + computed color;
              the R15 zinc-700 reading measured the BUTTON's inherited
              color, not this span). */}
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          /* Session 22 (R21-B3): REF's dropdown animates in (computed
             "animation: enter 0.15s ease", fade + zoom — measured on the
             user menu). Same recipe as ui/dropdown-menu.tsx, which needed
             the globals.css @utility block to generate real CSS in v4. */
          className="z-50 min-w-[200px] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs text-muted-foreground">
            {user.role.replace(/\b\w/g, (c) => c.toUpperCase())}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              My Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/logout"
              className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
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
