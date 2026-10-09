import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/** Maps domain statuses to colored badges — one source of truth for the app. */
const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" | "default" | "purple" }> = {
  // generic
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  draft: { label: "Draft", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "info" },
  // employees
  on_leave: { label: "On Leave", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
  terminated: { label: "Terminated", variant: "destructive" },
  full_time: { label: "Full-time", variant: "info" },
  part_time: { label: "Part-time", variant: "secondary" },
  contract: { label: "Contract", variant: "purple" },
  intern: { label: "Intern", variant: "secondary" },
  // payroll / money
  paid: { label: "Paid", variant: "success" },
  reimbursed: { label: "Reimbursed", variant: "success" },
  // attendance
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "destructive" },
  late: { label: "Late", variant: "warning" },
  leave: { label: "Leave", variant: "info" },
  // recruitment
  applied: { label: "Applied", variant: "info" },
  interviewing: { label: "Interviewing", variant: "purple" },
  offer: { label: "Offer", variant: "warning" },
  hired: { label: "Hired", variant: "success" },
  open: { label: "Open", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  closed: { label: "Closed", variant: "secondary" },
  // documents / compliance
  valid: { label: "Valid", variant: "success" },
  expiring: { label: "Expiring Soon", variant: "warning" },
  expired: { label: "Expired", variant: "destructive" },
  pending_upload: { label: "Pending Upload", variant: "secondary" },
  resolved: { label: "Resolved", variant: "success" },
  dismissed: { label: "Dismissed", variant: "secondary" },
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "info" },
  low: { label: "Low", variant: "secondary" },
  // performance
  on_track: { label: "On Track", variant: "success" },
  at_risk: { label: "At Risk", variant: "warning" },
  behind: { label: "Behind", variant: "destructive" },
  not_started: { label: "Not Started", variant: "secondary" },
  // assets
  available: { label: "Available", variant: "success" },
  assigned: { label: "Assigned", variant: "info" },
  repair: { label: "In Repair", variant: "warning" },
  retired: { label: "Retired", variant: "secondary" },
  // requests
  resolved_req: { label: "Resolved", variant: "success" },
  urgent: { label: "Urgent", variant: "destructive" },
  // loans
  loan_active: { label: "Active", variant: "info" },
  // letters
  issued: { label: "Issued", variant: "success" },
  // surveys
  submitted: { label: "Submitted", variant: "success" },
  acknowledged: { label: "Acknowledged", variant: "secondary" },
  // workflows
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  skipped: { label: "Skipped", variant: "secondary" },
  sent: { label: "Sent", variant: "success" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = STATUS_MAP[status] ?? { label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), variant: "secondary" as const };
  return (
    <Badge variant={entry.variant} className={cn("capitalize", className)}>
      {entry.label}
    </Badge>
  );
}
