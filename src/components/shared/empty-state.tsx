import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

/**
 * Reference empty-state recipe (session-6 live measurement, payroll
 * "No payroll records"):
 *
 *   div.p-12 text-center
 *   ├── icon 64×64 text-slate-300
 *   ├── h3 text-lg font-semibold text-slate-900 mb-2   (18px/600)
 *   ├── p  text-slate-500 mb-4                          (16px)
 *   └── action — the reference uses its shadcn default (dark #171717)
 *       button here, NOT the gradient CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-12 text-center", className)}>
      {/* Session 11 (R10 follow-up): the reference's icon carries mb-4 —
          re-measured on BOTH payroll and loans (icon bottom → h3 = 16px);
          the wrapper had no margin, shortening every empty state by 16px. */}
      <div className="mb-4 flex justify-center">
        {icon ? (
          <div className="[&_svg]:h-16 [&_svg]:w-16 [&_svg]:text-slate-300">{icon}</div>
        ) : (
          <Inbox className="h-16 w-16 text-slate-300" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description ? (
        <p className="text-slate-500 mb-4">{description}</p>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
