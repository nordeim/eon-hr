import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  // Reference cards (session-6 DOM dump): `rounded-xl border bg-card
  // text-card-foreground shadow` — no explicit border color (the
  // `* { border-border }` base layer supplies #E5E5E5, matching the
  // reference's --border 0 0% 89.8%). v3 default `shadow` geometry pinned
  // in @theme; shadow-sm would be one notch lighter.
  return (
    <div
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  // Reference card titles (session-6 measurement): fs 16 / fw 600 /
  // line-height 24 — the Base44 title div is `font-semibold tracking-tight
  // text-base` with text-base's default leading (24px), color #0A0A0A
  // inherited from --card-foreground. The scaffold's zero line-height
  // shrank every title row 8px (card height 222 vs 218 — the driver).
  // Session 47 (R46-D1): the TAG is the div too — the live census reads
  // 4 × div.font-semibold tracking-tight text-base on REF's dashboard and
  // zero tracking-tight h3s on any sampled page; the scaffold's h3 tag
  // was a semantic add REF never ships.
  return <div className={cn("font-semibold tracking-tight text-base", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
