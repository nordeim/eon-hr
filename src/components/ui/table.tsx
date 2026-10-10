import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // Session 12 (R11-V): reference table wrapper — a bare overflow-x-auto
    // div (no relative/scrollbar-thin) around table.w-full.text-sm.
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot className={cn("border-t bg-secondary/50 font-medium", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b transition-colors hover:bg-secondary/40 data-[state=selected]:bg-secondary", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        // Session 12 (R11-V): reference table header cell — live-measured on
        // payrollmodule + assetmanagement ("Payslips" / "Asset" columns):
        // text-left py-3 px-4 font-medium text-slate-500 → 45px row at 20px
        // text (the old shadcn h-10 px-3 text-muted-foreground was 40px).
        "text-left py-3 px-4 font-medium text-slate-500 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };
