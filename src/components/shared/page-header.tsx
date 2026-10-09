import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page header block: section badge + title + subtitle on the left, actions
 * right.
 *
 * Measured reference patterns (session-4 audit, live DOM):
 *   - badge pages (dominant): a white pill badge ABOVE the h1 —
 *     inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full
 *     shadow-sm, 16px/400 #0A0A0A text + 16px blue-600 module icon,
 *     badge at y=64 (main pt-8 + badge mt-8), h1 text-5xl 48px at y=116,
 *     subtitle text-lg slate-600.
 *   - badge-less pages (employees, dashboard, analytics, templates, …):
 *     h1 is the first child at y=32; employees/dashboard use size="lg"
 *     (30px h1 + slate-500 subtitle), others 24–48px.
 * The reference app itself is inconsistent across pages; this component
 * implements the two dominant patterns — see
 * docs/remediation-plan-session4.md §E.
 */
export function PageHeader({
  section,
  sectionIcon,
  title,
  subtitle,
  actions,
  size = "xl",
  className,
}: {
  section?: string;
  sectionIcon?: React.ReactNode;
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
          <div className="mb-4 mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            {sectionIcon ? (
              <span className="inline-flex shrink-0 text-blue-600 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
                {sectionIcon}
              </span>
            ) : null}
            <span className="text-base font-normal leading-5 text-[#0a0a0a]">{section}</span>
          </div>
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
