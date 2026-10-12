"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * The shadcn-style Popover primitive (session 25 / R24-B) — needed for the
 * notifications bell. REF's bell is a Radix Popover trigger measured live
 * (aria-haspopup="dialog" + aria-expanded + aria-controls, opening the
 * 384×175 "Notifications" panel). The animation classes mirror
 * ui/dropdown-menu.tsx (the globals.css @utility enter/exit block feeds
 * them under Tailwind v4 — the session-22 motion recipe).
 */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverClose({ className, ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close
      className={cn("rounded-sm opacity-70 transition-opacity hover:opacity-100", className)}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverAnchor };
