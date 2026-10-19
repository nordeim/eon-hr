import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        /* Session 40 (R39-D): REF's app-side base silently migrated to
           the v4 shadcn family (live-measured on the loans dialog):
           bg-transparent + text-base md:text-sm + at-rest shadow-sm +
           ring-1 offset-0 focus. The round-19 ring-2/offset-2 solid-card recipe
           retired; the login page counters with its own overrides
           (the two-build split — REF's login kept the old family). */
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        /* Session 40 (R39-E): the same v4 migration — min-h-[60px] (was
           80), bg-transparent, text-base md:text-sm, shadow-sm, ring-1.
           Session 62 (R62-K): + resize-none — REF's textareas carry it
           (member-set measured 2/2: companywall + interviewassistant). */
        "flex min-h-[60px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input, Textarea };
