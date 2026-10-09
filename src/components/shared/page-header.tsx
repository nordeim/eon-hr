import * as React from "react";
import { cn } from "@/lib/utils";

/** Page header block: kicker + title + subtitle on the left, actions right. */
export function PageHeader({
  section,
  title,
  subtitle,
  actions,
  className,
}: {
  section?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {section ? (
          <p className="text-sm font-medium text-muted-foreground">{section}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
