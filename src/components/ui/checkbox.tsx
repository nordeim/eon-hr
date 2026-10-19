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
        // Session 62 (R62-B): the border member moves to the literal
        // pair — REF's checkbox border rides ITS --primary token which
        // FLIPS (#171717 light / #fafafa dark, both live-measured), but
        // the clone's --primary is the documented nav-blue repurposing
        // (#1877f2 both themes) — border-primary rendered the blue in
        // BOTH themes (a both-theme divergence the r62 border census
        // caught; no prior fill/text census could see it).
        "peer h-4 w-4 shrink-0 rounded-sm border border-[#171717] dark:border-[#fafafa] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        // Session 58 (R58-20) + session 60 (R60-A): REF's checked fill is
        // its shadcn --primary resolving #171717 in light (measured live,
        // r58) and #fafafa in dark (measured live on the securitysettings
        // checkboxes, r60) — the pinned literal pair, not the token
        // (--color-primary carries the Facebook blue for the nav). The
        // check color rides the primary-foreground token: white in light,
        // #171717 in dark (REF's dark check measured rgb(23,23,23)) — the
        // r58 dark:text-white guess (built on "REF never renders a
        // checkbox in dark", disproven by the r60 census) is retired.
        "data-[state=checked]:bg-[#171717] dark:data-[state=checked]:bg-[#fafafa] data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {/* Session 60 (R60-A): REF authors the Check at h-4 w-4 (16px,
            both themes — live-measured; the r48 h-3 w-3 was never
            re-measured until the r60 census). */}
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
