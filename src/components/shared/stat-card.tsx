import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function StatCard({ label, value, hint, icon, iconClassName, valueClassName, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-normal text-muted-foreground">{label}</p>
          {icon ? (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground",
                "[&_svg]:h-4 [&_svg]:w-4",
                iconClassName
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
        <p className={cn("mt-2 text-2xl font-bold text-foreground", valueClassName)}>{value}</p>
        {hint ? <p className="mt-1 text-xs font-normal text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
