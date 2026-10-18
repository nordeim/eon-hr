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
        // Session 58 (R58-20): REF's checked fill is the DARK neutral
        // #171717 (its shadcn --primary, measured live on the
        // securitysettings checkboxes) — pinned literal, not the token
        // (--color-primary carries the Facebook blue for the nav). In
        // dark the fill stays #171717 with the white checkmark — REF's
        // zero-data surfaces never render a checkbox in dark, so the
        // readable pairing is the documented superset.
        "data-[state=checked]:bg-[#171717] data-[state=checked]:text-primary-foreground dark:data-[state=checked]:text-white",
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
