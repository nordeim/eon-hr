"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Session 58 (R58-19): REF's checked track is the DARK neutral
        // (#171717, flips #fafafa in dark) — its shadcn --primary, NOT the
        // Base64 theme's Facebook blue. The clone's --color-primary carries
        // the Facebook blue for the active-nav custom classes, so the track
        // pins the literal values instead of the token.
        "data-[state=checked]:bg-[#171717] dark:data-[state=checked]:bg-[#fafafa] data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-card shadow-lg ring-0 transition-transform",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
