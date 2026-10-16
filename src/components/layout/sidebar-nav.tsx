"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Bell, Moon, Sun, Languages, LogOut, CircleUser, Briefcase } from "lucide-react";
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

/* Session 45 (R43-C3): REF's shadcn SidebarMenuButton base, verbatim —
   the full peer/menu-button string off its reloaded build. The rail
   members (the important-prefixed size/padding pair) compile under v4
   (verified against the installed 4.3.3 — the legacy leading-! form
   still generates the important rule) and the data-active family is
   dead code on REF too: it authors the literal false on every link
   (even the active one — the active styling rides the tail classes +
   the inline blue style), so the attribute-conditional members never
   match. The svg guard is a DIRECT-child selector — the leaf/subleaf
   icons sit at the top level (rendered 16px, authored 20px on REF) but
   the toggle's icon rides the interior wrapper (two levels deep, the
   guard misses it — the 20px authored size renders, REF-measured). */
const MENU_BUTTON_BASE =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden p-2 text-left outline-none ring-sidebar-ring focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0";

/* Session 45 (R43-C5/C6/C8): the three tails. The leaf/subleaf tails
   carry the sidebar-token hover pair; the toggle tail does NOT — the
   split is what keeps the toggle's blue hover alive (without it the
   zinc pair wins and the collapsed group hovers gray). The inactive
   branches keep the dead hand-authored hover member REF ships; the
   active branches swap it for the custom-primary-bg recipe + white
   text + the shadow, and the active branch ALSO carries the inline
   blue style (render-redundant with the unlayered class — an authored
   attribute we mirror). Top-level geometry: mb-1 + py-2.5; subleaf
   geometry: py-2, no bottom margin (the 4px pitch rides space-y-1). */
const LEAF_TAIL_INACTIVE =
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg mb-1 text-slate-600 hover:custom-accent-bg flex items-center gap-3 px-3 py-2.5";
const LEAF_TAIL_ACTIVE =
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg mb-1 custom-primary-bg text-white font-medium shadow-sm flex items-center gap-3 px-3 py-2.5";
const TOGGLE_TAIL =
  "h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 text-slate-600";
const SUBLEAF_TAIL_INACTIVE =
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg text-slate-600 hover:custom-accent-bg flex items-center gap-3 px-3 py-2";
const SUBLEAF_TAIL_ACTIVE =
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm hover:opacity-80 transition-all duration-200 rounded-lg custom-primary-bg text-white font-medium shadow-sm flex items-center gap-3 px-3 py-2";

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
  /* Session 45 (R43-C1/C2): REF's shadcn SidebarContent/SidebarGroup
     architecture, verbatim. The old element-based wrapper + the
     extra flex column are gone — the header/content/footer become
     direct children of the sidebar flex column, the content is the
     min-h-0 flex-1 scroller (the short-viewport contract: the footer
     stays pinned, the nav scrolls internally), and every wrapper
     carries its data-sidebar contract with the rail members. The
     group label's rail members (-mt-8 + opacity-0 + the margin/opacity
     transition) collapse it into the icon state; the label authors
     slate-500 (REF's literal, same render as the old muted token). */
  return (
    <>
      <SidebarHeader />
      <div data-sidebar="content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden p-3">
        <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
          <div
            data-sidebar="group-label"
            className="flex h-8 shrink-0 items-center rounded-md outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2"
          >
            Main Menu
          </div>
          <div data-sidebar="group-content" className="w-full text-sm">
            <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                item.children ? (
                  <CollapsibleNavItem key={item.label} item={item} pathname={pathname} onNavigate={onNavigate} />
                ) : (
                  <li key={item.label} data-sidebar="menu-item" className="group/menu-item relative">
                    <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>
      <SidebarFooter user={user} variant={variant} />
    </>
  );
}

function SidebarHeader() {
  return (
    /* Session 40 (R39-J): REF's brand block structure — the outer
       flex-COLUMN (gap-2, border-b, p-6, explicit border-slate-200) >
       the flex items-center gap-3 row > [tile, text container]. The
       text container is REF's flex-1 min-w-0 BLOCK (stretches to
       155px; the clone's old shrink-wrapped flex-col measured 66px)
       with the h2 + a p sub (truncate, slate-500/400 — NOT the muted
       token). The tile keeps the sRGB-pinned arbitrary gradient (trap
       3 — REF's class-based from-blue-600 to-indigo-600 renders the
       same corner colors; the pinned form keeps the measured
       interpolation). */
    <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 p-6" data-sidebar="header">
      <div className="flex items-center gap-3">
        {/* Brand mark — reference (live-measured session 3): 40×40 squircle,
            12px radius, gradient to-right-bottom #2563EB → #4F46E5 (sRGB —
            arbitrary value per Tailwind v4 trap 3, oklab interpolation would
            shift the midpoint), v3 shadow-lg geometry, white 24px stroke-2
            briefcase; rendered in CSS so parity needs no image asset.
            Session 5: row px-6 (tile x=24), h2 text-lg 18px/700 slate-900
            (#0f172a — NOT the gray-900 foreground token), sub text-xs. */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(to_right_bottom,#2563EB,#4F46E5)] shadow-lg">
          <Briefcase className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Session 33 (R32-A): REF's brand title flips to white in dark
              (dark:text-white, live-measured rgb(255,255,255)); the sub
              flips to slate-400. Session 40: REF's member order + the p
              element with truncate. */}
          <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">EonHR</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Demo</p>
        </div>
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
  /* Session 45 (R43-C4): REF authors the full attribute contract on
     every nav surface — the shadcn size marker + the literal-false
     active flag (even on the active link; the base's conditional
     members never match — the active styling rides the tail classes +
     the inline blue style, mirroring REF's authored attributes). The
     icon carries no color class (inherits the link color — slate-600
     inactive, white active, REF-measured) and authors the 20px form;
     the base's direct-child svg guard renders it 16px. The label span
     carries the medium weight REF renders (500, live-measured — the
     old 400 was a 42-round survivor). */
  return (
    <Link
      href={item.href!}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      data-sidebar="menu-button"
      data-size="default"
      data-active="false"
      style={active ? { backgroundColor: "rgb(24, 119, 242)" } : undefined}
      className={cn(MENU_BUTTON_BASE, active ? LEAF_TAIL_ACTIVE : LEAF_TAIL_INACTIVE)}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="font-medium">{item.label}</span>
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
  /* Session 25 (R24-A): REF's group toggles carry the content id in BOTH
     states (its older Radix sets it unconditionally). The clone's Radix
     only authors it when the content is mounted, so a stable useId is
     passed to BOTH sides; user props spread after Radix's own in the
     v1.1.x source, so the override holds collapsed AND matches the
     mounted content id open. */
  const contentId = React.useId();
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        aria-controls={contentId}
        data-sidebar="menu-button"
        data-size="default"
        data-active="false"
        className={cn(MENU_BUTTON_BASE, TOGGLE_TAIL)}
        aria-expanded={open}
      >
        {/* Session 45 (R43-C6): REF's toggle interior — the justify-between
            wrapper (px-3 py-2.5, clipped by the button's overflow-hidden at
            the 32px height — the row centers) around the gap-3 icon+label
            row and the chevron. The icon rides the wrapper (two levels deep
            — the base's svg guard misses it, so the authored 20px renders,
            REF-measured). The chevron is a GLYPH SWAP: the down glyph when
            open, the right glyph when collapsed — no rotation (the old
            90-degree swing was a clone extra; REF's own icons never
            carried motion classes). */}
        <div className="flex items-center justify-between w-full px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">{item.label}</span>
          </div>
          {open ? (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
      </Collapsible.Trigger>
      {/* Session 45 (R43-C8): REF's submenu is the no-ul structure — the
          content element is the padded space-y-1 container with DIRECT
          li menu-item children (the 4px pitch rides space-y; the old
          element list with its top margin retired). The subleaves carry
          the same attribute contract as every other nav surface. */}
      <Collapsible.Content id={contentId} className="pl-4 space-y-1">
        {item.children?.map((child: NavChild) => {
          const active = pathname === child.href;
          const ChildIcon = child.icon;
          return (
            <li key={`${item.label}-${child.label}-${child.href}`} data-sidebar="menu-item" className="group/menu-item relative">
              <Link
                href={child.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                data-sidebar="menu-button"
                data-size="default"
                data-active="false"
                style={active ? { backgroundColor: "rgb(24, 119, 242)" } : undefined}
                className={cn(MENU_BUTTON_BASE, active ? SUBLEAF_TAIL_ACTIVE : SUBLEAF_TAIL_INACTIVE)}
              >
                {ChildIcon ? (
                  <ChildIcon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-white" : "bg-border")} aria-hidden="true" />
                )}
                <span className="text-sm">{child.label}</span>
              </Link>
            </li>
          );
        })}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function SidebarFooter({ user, variant }: { user: ShellUser; variant: "desktop" | "mobile" }) {
  /* Session 33 (R32-A): the Moon is a REAL theme toggle on REF — html.dark
     + localStorage darkMode="true" (the shadcn-neutral palette extracted
     from its live stylesheet now lives in globals.css). The boot script in
     layout.tsx applies the stored theme pre-paint; this state syncs
     post-hydration for the aria-label AND the icon — Session 43 (R41-B1):
     the icon is one state-driven conditional glyph (REF's own build
     renders a single moon-or-sun svg keyed on its theme state; the old
     two-glyph hidden-pair kept a hidden extra node). */
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
    <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 p-4" data-sidebar="footer">
      <div className="flex items-center gap-2 mb-2">
        {/* Session 25 (R24-B): REF's bell is a Radix POPOVER trigger
            (aria-haspopup="dialog" + aria-expanded + aria-controls,
            measured live) opening a 384px notifications panel — the only
            measured surface where REF did more than the clone (the old
            clone bell was a dead button). Recipe DOM-measured: header
            px-4 py-3 border-b row with the h3, body max-h-[480px]
            overflow-y-auto with the faded-bell empty state.
            Session 43 (R41-A1): the button adopts REF's full v4 Button
            base verbatim — the base's focus-visible ring-1 pair is the
            keyboard-focus contract (the hand-rolled string rendered the
            browser-default outline under Tab), the svg guard renders the
            authored w-5 h-5 at 16px, and the trailing `relative` is the
            unread-badge positioning context (no absolute child on zero
            data). The icon keeps its own slate-600 (survives hover). */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              aria-controls={bellContentId}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 relative"
            >
              <Bell className="w-5 h-5 text-slate-600" aria-hidden="true" />
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
          /* Session 43 (R41-A2/B1): REF's moon carries the v4 Button base
             + select-none with NO color classes anywhere — the icon color
             is INHERITED through the peer wrapper's text-sidebar-foreground
             (zinc-700 light / zinc-100 dark — the r41 token fix). The icon
             is ONE state-driven svg (REF's conditional moon/sun — its DOM
             carries a single glyph per theme; the r32 two-svg class pair
             rendered identically but kept a hidden extra node). */
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9 select-none"
        >
          {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={onLangClick}
          title={lang === "عربي" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          /* Session 43 (R41-A3): REF's authored string verbatim — the
             outline-variant button with whitespace-nowrap + the focus /
             disabled / svg-guard members (the clone's hand-rolled twin
             lacked them — the browser-default outline under Tab). */
          className="justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-1.5 font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 min-w-[64px]"
        >
          <Languages className="w-4 h-4" aria-hidden="true" />
          {lang}
        </button>
      </div>
      <UserMenu user={user} variant={variant} />
    </div>
  );
}

function UserMenu({ user, variant }: { user: ShellUser; variant: "desktop" | "mobile" }) {
  const router = useRouter();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        /* Session 43 (R41-A4): REF's authored string verbatim — the v4
           Button base with the disabled pair + the svg guards (the old
           hand-rolled string carried a stray outline-none and lacked
           the guards; the ring rendering was already correct). */
        className={
          "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-4 py-2 w-full justify-start gap-3 hover:bg-slate-100"
        }
      >
        {/* Reference avatar: gradient circle with a white CircleUser glyph
            (blue-500 -> indigo-500 endpoints, sRGB-pinned per trap 3).
            Session 43 (R41-A4): the glyph authors w-5 h-5 like REF — the
            trigger's base svg-guard renders it at 16px. */}
        <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[linear-gradient(to_bottom_right,#3b82f6,#6366f1)]">
          <CircleUser className="w-5 h-5 text-white" aria-hidden="true" />
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
        {/* Session 36 (R35-A): REF's user menu measured — 192×74 (TWO items,
            no Label/Separator: the "Admin" label row was invented),
            align=end (menu right-edge = the trigger's right-edge),
            sideOffset=4, w-48 (the 192px width is a FIXED class, not
            content-sized — re-measured after the initial implementation
            rendered 128px), rounded-md container (6px). Same enter
            animation as ui/dropdown-menu.tsx (round 22: enter 0.15s,
            fade + zoom). */}
        <DropdownMenu.Content
          side="top"
          align="end"
          sideOffset={4}
          className="z-50 min-w-[8rem] w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Session 43 (R41-C1): the items are PLAIN DropdownMenu.Item
              divs — REF's items render div role=menuitem and STRETCH the
              full 182px row; the asChild-wrapped a/button surfaced their
              own tags and the Logout button shrank to 96px (the keyboard
              highlight pill covered half the row). My Profile navigates
              via onSelect + router.push (REF's own item is a div-click
              navigation); Logout keeps the R35-A6 anti-prefetch contract
              — a full document navigation via location.href, NEVER a Next
              Link (a Link to the logout route gets PREFETCHED when the
              menu opens; the prefetch GET hits the route handler and
              clears the session cookie — the menu logged the user out on
              open). */}
          <DropdownMenu.Item
            onSelect={() => router.push("/profile")}
            /* Session 36 (R35-A): REF's item recipe — cursor-default +
               rounded-sm (the newer shadcn classes; measured on both
               REF items). 32px rows, 16px svgs, focus:bg-accent.
               The svg rides [&>svg]:size-4 + mr-2 ON TOP of the item's
               gap-2 → 16px icon-to-text (REF-measured 60→92). */
            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
          >
            <CircleUser className="w-4 h-4 mr-2" aria-hidden="true" />
            My Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => {
              // A FULL document navigation is intentional here: the
              // /logout route handler clears the session cookie, and
              // the hard load tears down every client-side cache and
              // React tree with it (a router.push would leave the
              // hydrated app state behind).
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/logout";
            }}
            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
          >
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
