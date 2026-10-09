import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page header block: kicker + title + subtitle on the left, actions right.
 *
 * Measured reference patterns (session-2 audit):
 *   - module pages (dominant): h1.text-4xl md:text-5xl font-bold
 *     text-slate-900 with a text-lg text-slate-600 subtitle
 *   - dashboard / employees: h1.text-3xl with a text-slate-500 subtitle
 *     (pass size="lg" for that variant)
 * The reference app itself uses inconsistent title sizes across pages
 * (24/30/36/48px); this component standardizes on the dominant patterns —
 * see docs/remediation-plan-session1.md §2-D.
 */
export function PageHeader({
  section,
  title,
  subtitle,
  actions,
  size = "xl",
  className,
}: {
  section?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  size?: "xl" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {section ? (
          <p className="text-sm font-medium text-slate-700">{section}</p>
        ) : null}
        <h1
          className={cn(
            "font-bold text-slate-900",
            size === "xl" ? "mb-3 text-4xl md:text-5xl" : "text-3xl"
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              size === "xl" ? "text-lg text-slate-600" : "mt-1 text-slate-500"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
