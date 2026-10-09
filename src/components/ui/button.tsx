import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        // Reference primary CTA (session-4 live measurement): the Base44
        // theme button renders linear-gradient(to right, #2563EB, #4F46E5)
        // — blue-600 -> indigo-600 endpoints, sRGB interpolation, hover
        // darkens to #1D4ED8 -> #4338CA, radius 6px, text #FAFAFA, v3
        // `shadow` geometry. Authored via arbitrary values per trap 3:
        // Tailwind's gradient UTILITIES interpolate in oklab, which the
        // reference does not do here (its computed value has no "in oklab").
        // Chromium serializes the direction keyword as the equivalent 90deg.
        default:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#1D4ED8,#4338CA)] bg-[linear-gradient(to_right,#2563EB,#4F46E5)]",
        // Session 6 — the reference's shadcn default variant (bg-primary
        // where --primary = 0 0% 9%): renders #171717 with #FAFAFA text.
        // Measured on the taskmanager active toggle and the empty-state
        // CTAs (NOT the gradient recipe).
        dark: "bg-[#171717] text-primary-foreground shadow hover:bg-[#171717]/90",
        // Session 6 — per-page gradient CTAs (measured endpoints, sRGB;
        // resting state byte-equal, hover shades are a superset nicety —
        // the reference does not change its gradient on hover).
        green:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#15803D,#047857)] bg-[linear-gradient(to_right,#16A34A,#059669)]",
        cyan:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#1D4ED8,#0E7490)] bg-[linear-gradient(to_right,#2563EB,#0891B2)]",
        red:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#B91C1C,#C2410C)] bg-[linear-gradient(to_right,#DC2626,#EA580C)]",
        purple:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#7E22CE,#4338CA)] bg-[linear-gradient(to_right,#9333EA,#4F46E5)]",
        indigo:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#4338CA,#7E22CE)] bg-[linear-gradient(to_right,#4F46E5,#9333EA)]",
        pink:
          "text-primary-foreground shadow hover:bg-[linear-gradient(to_right,#7E22CE,#BE185D)] bg-[linear-gradient(to_right,#9333EA,#DB2777)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Reference outline (session-6 class capture): border border-input
        // bg-background shadow-sm hover:bg-accent hover:text-accent-foreground.
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6",
        icon: "h-9 w-9",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
