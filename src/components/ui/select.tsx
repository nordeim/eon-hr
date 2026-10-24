"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

/* Session 90 (R90-B): the REF's RESPONSIVE SELECT — at <768px the desktop
   popper swaps for a bottom-sheet dialog (live-verified cross-side on the
   REF: 736/640 render the sheet, 768 renders the popper). The recipe was
   extracted verbatim from the live REF DOM: the bg-black/80 overlay, the
   rounded-t-[10px] sheet (fixed inset-x-0 bottom-0) with the 100px muted
   drag handle, the generic "Select an option" h2 (text-lg font-semibold
   leading-none tracking-tight, centered), and the option buttons (w-full
   flex items-center justify-between p-4 rounded-lg border min-h-[44px] —
   selected bg-blue-50 border-blue-200 text-blue-900 + the blue Check at
   the end; unselected bg-white border-slate-200 hover:bg-slate-50). The
   REF's mobile trigger is a PLAIN button (no role/aria-expanded/data-
   state/dir — live-verified). The desktop path is untouched: the sheet
   only renders below the md breakpoint, guarded for SSR/jsdom. */
const MOBILE_SELECT_BREAKPOINT = "(max-width: 767px)";

function useIsMobileSelect() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(MOBILE_SELECT_BREAKPOINT);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

type SelectSheetItem = { value: string; label: React.ReactNode; disabled?: boolean };

/* The sheet's option list is collected from the SelectItem children the
   page already declares for the desktop popper — one source of truth, no
   duplicate inventories. Descends through Content/Group wrappers. */
function collectSheetItems(nodes: React.ReactNode): SelectSheetItem[] {
  const items: SelectSheetItem[] = [];
  const walk = (children: React.ReactNode) => {
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === SelectItem) {
        const p = child.props as {
          value?: string;
          children?: React.ReactNode;
          disabled?: boolean;
        };
        if (typeof p.value === "string") {
          items.push({ value: p.value, label: p.children, disabled: p.disabled });
        }
        return;
      }
      walk((child.props as { children?: React.ReactNode }).children);
    });
  };
  walk(nodes);
  return items;
}

/* The mobile trigger opens the sheet instead of the Radix popper; the
   sheet selection flows back through the same onValueChange contract.
   At mobile NO Radix machinery renders at all — a Root without its
   Trigger defaults isFormControl=true and mounts the hidden native
   <select>, whose option texts pollute the layout's textContent (the
   R88-D lesson: the analyticsdashboard bar finder). The SelectValue is
   swapped for a plain span carrying the placeholder contract. */
const SelectMobileContext = React.createContext<{
  openSheet: () => void;
  selected: string | undefined;
} | null>(null);

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const isMobile = useIsMobileSelect();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetValue, setSheetValue] = React.useState<string | undefined>(defaultValue);

  React.useEffect(() => {
    if (!sheetOpen || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  if (!isMobile) {
    return (
      <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} {...props}>
        {children}
      </SelectPrimitive.Root>
    );
  }

  const selected = value ?? sheetValue;
  const items = collectSheetItems(children);
  const selectedLabel = items.find((i) => i.value === selected)?.label;

  /* No Radix at mobile: the SelectValue becomes a plain span (its
     placeholder prop carried over — the R37-E trigger placeholder-color
     contract keys off the button's data-placeholder), and the
     SelectContent/SelectGroup wrappers drop out of the tree. The
     SelectValue lives NESTED inside SelectTrigger — the replacement
     recurses into the trigger's children. */
  const deepReplace = (nodes: React.ReactNode): React.ReactNode =>
    React.Children.map(nodes, (child) => {
      if (!React.isValidElement(child)) return child;
      if (child.type === SelectContent || child.type === SelectGroup) return null;
      if (child.type === SelectValue) {
        const p = child.props as { placeholder?: string; children?: React.ReactNode };
        /* the page-authored interior (e.g. the companywall Users glyph —
           the R88-G3 contract) rides the SelectValue children and tracks
           the page's own state: keep the children, drop the wrapper; the
           bare-placeholder pattern renders the selected label instead */
        if (p.children !== undefined) return p.children;
        return (
          <span style={{ pointerEvents: "none" }}>
            {selected !== undefined ? selectedLabel : (p.placeholder ?? "")}
          </span>
        );
      }
      if (child.type === SelectTrigger) {
        return React.cloneElement(
          child as React.ReactElement<{ children?: React.ReactNode }>,
          { children: deepReplace((child.props as { children?: React.ReactNode }).children) },
        );
      }
      return child;
    });
  const mobileChildren = deepReplace(children);

  return (
    <SelectMobileContext.Provider value={{ openSheet: () => setSheetOpen(true), selected }}>
      {mobileChildren}
      {sheetOpen
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-50 bg-black/80"
                onClick={() => setSheetOpen(false)}
                aria-hidden="true"
              />
              <div className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background">
                <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
                <div className="grid gap-1.5 p-4 text-center sm:text-left">
                  <h2 className="text-lg font-semibold leading-none tracking-tight">Select an option</h2>
                </div>
                <div className="p-4 pb-8 space-y-2 max-h-[60vh] overflow-y-auto">
                  {items.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        setSheetValue(item.value);
                        setSheetOpen(false);
                        onValueChange?.(item.value);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-colors min-h-[44px] disabled:pointer-events-none disabled:opacity-50",
                        item.value === selected
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-white border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <span className="text-left">{item.label}</span>
                      {item.value === selected ? <Check className="h-4 w-4 text-blue-600" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </SelectMobileContext.Provider>
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  /* Session 90 (R90-B): at mobile the trigger is the REF's PLAIN button —
     no role/aria-expanded/data-state (live-verified on the REF at 390px) —
     that opens the bottom sheet. Identical visual classes. */
  const mobile = React.useContext(SelectMobileContext);
  if (mobile) {
    return (
      <button
        type="button"
        className={cn(
          "flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
          "data-[placeholder]:text-neutral-500 dark:data-[placeholder]:text-neutral-400",
          "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        {...props}
        onClick={(e) => {
          (props as { onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void }).onClick?.(e);
          if (!e.defaultPrevented) mobile.openSheet();
        }}
        /* the R37-E placeholder-color contract keys off data-placeholder
           (Radix sets it on its own trigger; the plain button carries it) */
        data-placeholder={mobile.selected === undefined ? "" : undefined}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
        /* Session 38 (R37-E): REF renders the PLACEHOLDER state (Radix's
           data-placeholder attribute, already set on every trigger) in
           neutral-500 — rgb(115,115,115) live-measured on the loans
           "Select employee" + the assets "Not assigned" (valued triggers
           stay dark: "Standard Loan" = rgb(10,10,10)). NOT the
           muted-foreground token (slate-500 #64748b — a different REF
           gray). Dark mode flips to #a3a3a3 (neutral-400, live-measured). */
        "data-[placeholder]:text-neutral-500 dark:data-[placeholder]:text-neutral-400",
        /* Session 40 (R39-F): the v4 migration — shadow-sm +
           ring-offset-background + the focus: prefix (REF's trigger
           recipe, live-measured on the loans dialog). */
        "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
      /* Session 90 (R90-A, revised): NO dir strip at desktop — the live
         REF's DESKTOP RTL trigger carries Radix's dir="ltr" stamp (the
         stock form: the chevron stays at the trigger's right even while
         the page is RTL — live-measured at 1440 RTL: dirAttr "ltr",
         computed ltr, chevron rightGap 13). The MIRRORED form (no dir,
         chevron at the start side) is the REF's MOBILE-only form — the
         plain-button branch above renders it (no Radix, no stamp). */
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton(props: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
        /* Session 36 (R35-B): rounded-md — REF-measured 6px on the
           compliance All Types select (the clone's rounded-lg was 8px). */
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          /* Session 22 (R21-B2): REF's select content animates in (computed
             "animation: enter 0.15s ease", fade + zoom — measured on the
             attendance All-Departments select). Same recipe as the dropdown
             family; the globals.css @utility block generates the CSS in v4. */
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        /* Session 36 (R35-B): REF's option recipe — cursor-default +
           rounded-sm (measured on the compliance select options). */
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
        "focus:bg-secondary focus:text-secondary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
