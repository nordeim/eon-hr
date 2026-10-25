"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

/* Session 93 (R93-D): the REF's Schedule Recurring Report dialog — live-read
 * 2026-10-25 (512×380): Report Name / Report Type (six) | Frequency (four,
 * same row) / Recipients + Add; Cancel | Schedule Report. No description
 * line. The recipients list is a local array (the Add button appends the
 * typed email); scheduling stays the local toast superset. */
const REPORT_TYPES = ["Attendance", "Payroll", "Overtime", "Leave", "Turnover", "Headcount"] as const;
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"] as const;

function isValidEmail(v: string): boolean {
  return /.+@.+\..+/.test(v.trim());
}

export function ScheduleReportButton() {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [reportType, setReportType] = React.useState<string>("Attendance");
  const [frequency, setFrequency] = React.useState<string>("Monthly");
  const [recipient, setRecipient] = React.useState("");
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  function addRecipient() {
    const email = recipient.trim();
    if (!isValidEmail(email)) {
      toast.toast({ title: "Enter a valid email", variant: "info" });
      return;
    }
    if (!recipients.includes(email)) {
      setRecipients((prev) => [...prev, email]);
    }
    setRecipient("");
  }

  function schedule() {
    setSaving(true);
    // Local scheduling only — the reference app stores nothing server-side here.
    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast.toast({
        title: "Report scheduled",
        description: `You will receive a ${frequency.toLowerCase()} ${reportType} report by email.`,
        variant: "success",
      });
      setName("");
      setRecipient("");
      setRecipients([]);
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Session 14 (R13-A): the reference renders this as the default blue
              gradient CTA (179px, iconed mr-2) — not outline.
              Session 88 (R88-B): the REF's glyph is the PLAIN PLUS
              (live-measured: lucide-plus, paths M5 12h14 ~ M12 5v14),
              not CalendarClock. */}
        <Button>
          <Plus className="mr-2" aria-hidden="true" />
          Schedule Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Recurring Report</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Attendance"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="report-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-recipients">Recipients</Label>
            <div className="flex items-center gap-2">
              <Input
                id="report-recipients"
                type="email"
                placeholder="email@company.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecipient();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRecipient}>
                Add
              </Button>
            </div>
            {recipients.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recipients.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground hover:bg-secondary/80"
                    onClick={() => setRecipients((prev) => prev.filter((x) => x !== r))}
                    aria-label={`Remove ${r}`}
                  >
                    {r} ✕
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={schedule} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Schedule Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
