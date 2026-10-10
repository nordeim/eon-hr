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
 *   ├── p  text-slate-500                              (16px)
 *   └── action — the reference uses its shadcn default (dark #171717)
 *       button here, NOT the gradient CTA.
 *
 * Session 12 (R11-B): the description P carries mb-4 ONLY when an action
 * follows it (expenses: `text-slate-500` bare; templates: `text-slate-500
 * mb-4` ahead of its CTA) — live-measured on both pages this session.
 *
 * Session 12 (R11-C): iconChip variant — templates renders a 64px slate-100
 * CIRCLE (`w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4`) holding a
 * 32px slate-400 icon instead of the bare 64px slate-300 icon.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  iconChip = false,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Render the icon inside the reference's 64px slate-100 circle chip. */
  iconChip?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("p-12 text-center", className)}>
      {/* Session 11 (R10 follow-up): the reference's icon carries mb-4 —
          re-measured on BOTH payroll and loans (icon bottom → h3 = 16px);
          the wrapper had no margin, shortening every empty state by 16px. */}
      <div className="mb-4 flex justify-center">
        {iconChip ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-slate-400">{icon}</div>
        ) : icon ? (
          <div className="[&_svg]:h-16 [&_svg]:w-16 [&_svg]:text-slate-300">{icon}</div>
        ) : (
          <Inbox className="h-16 w-16 text-slate-300" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description ? (
        <p className={cn("text-slate-500", action ? "mb-4" : undefined)}>{description}</p>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
