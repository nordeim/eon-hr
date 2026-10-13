"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The shadcn Alert primitive — parity round 33 (R33-G).
 *
 * REF's login error is the stock shadcn Alert with a page-level
 * variant: `bg-red-50/70 border-red-200 rounded-xl` (live-measured:
 * translucent rgba(254,242,242,.7) bg, 1px rgb(254,202,202) border,
 * 12px radius, p-4, text-foreground) wrapping an AlertDescription
 * carrying `text-red-700 text-sm` — NO icon rendered on REF's
 * zero-data surface (the svg slot classes stay for future use).
 */
const alertVariants = cva(
  "relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        error: "text-foreground bg-red-50/70 border-red-200 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
