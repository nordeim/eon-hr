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
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-card shadow-sm hover:bg-secondary hover:text-secondary-foreground",
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
