"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // Session 16 (R15-A): the inactive trigger color is the reference's
        // muted-foreground TOKEN #737373 (neutral-500) — measured
        // rgb(115,115,115) on every reference pill. NOT the clone's
        // muted-foreground token (slate-500): tab surfaces are the one
        // place the reference's token visibly renders.
        // Session 33 (R32-A): REF's token flips to #a3a3a3 (0 0% 63.9%)
        // in dark — measured rgb(163,163,163) on every dark pill.
        "inline-flex h-9 items-center justify-center rounded-lg bg-secondary p-1 text-neutral-500 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        // Session 19 (R18-G): REF's tab trigger renders ring-2 + ring-
        // offset-2 (4px total, measured on /settings Company).
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        // Session 23 (R22-B): mb-0! kills the v4 trailing space-y margin.
        // v4's space-y-* emits margin-block-end on :not(:last-child) — the
        // ACTIVE content followed only by display:none Radix siblings kept
        // mb-24, leaving 24px dead space below tab cards (measured /settings
        // docH 943 vs REF 919). REF's v3 space-y (margin-top on * + *)
        // never trails. The pill→card gap survives via the pill's own mb-24.
        "mt-2 mb-0! focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
