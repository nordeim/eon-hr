"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        // Session 49 (R48-C2/G3): the FIRST live-measured REF checkbox
        // (securitysettings' feature rows, @1440×900 this round) — the
        // OLD shadcn base: border-PRIMARY + shadow + ring-1 (not the
        // newer border-input/shadow-sm/ring-2 form); the checked-border
        // member + the pointer member are retired (REF carries neither).
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        // Session 33 (R32-A): the checked checkmark keeps white text in
        // dark (the primary-foreground token would flip to #171717 on the
        // unchanged blue — REF's zero-data surfaces never render a
        // checkbox in dark, so this is the documented readability
        // superset; light rendering is untouched).
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
