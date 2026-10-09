import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  /** Icon tile classes — the reference colors tiles per stat:
   *  `bg-{color}-100 text-{color}-600` (measured: payroll =
   *  green/blue/purple/orange, analytics = blue/purple/green/orange). */
  tileClassName?: string;
  /** @deprecated use tileClassName — kept for call-site compatibility. */
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

/**
 * Reference stat-card recipe (session-6 live measurement, payroll +
 * analytics):
 *
 *   Card: rounded-xl border bg-card text-card-foreground shadow
 *         border-slate-200
 *   └── div.p-6
 *       ├── div.flex items-start justify-between mb-3
 *       │   └── div.{color}-100 p-3 rounded-xl   (48×48 tile, 24px icon)
 *       ├── div.text-3xl font-bold text-slate-900 mb-1   (30px/700)
 *       └── div.text-sm text-slate-600                  (14px #475569)
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tileClassName,
  iconClassName,
  valueClassName,
  className,
}: StatCardProps) {
  const tile = tileClassName ?? iconClassName;
  return (
    <Card className={cn("border-slate-200", className)}>
      <CardContent className="p-6">
        {icon ? (
          <div className="flex items-start justify-between mb-3">
            <div
              className={cn(
                "p-3 rounded-xl bg-blue-100 text-blue-600 [&_svg]:h-6 [&_svg]:w-6",
                tile
              )}
            >
              {icon}
            </div>
          </div>
        ) : null}
        <p className={cn("text-3xl font-bold text-slate-900 mb-1", valueClassName)}>{value}</p>
        <div className="text-sm text-slate-600">{label}</div>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
