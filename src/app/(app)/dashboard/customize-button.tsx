"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const WIDGETS = [
  { key: "quick-actions", label: "Quick Actions" },
  { key: "leave-balances", label: "Leave Balances" },
  { key: "recent-requests", label: "Recent Requests" },
  { key: "expense-claims", label: "Expense Claims" },
];

const STORAGE_KEY = "eon-dashboard-widgets";

export function CustomizeButton() {
  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(WIDGETS.map((w) => [w.key, true]))
  );

  // Load persisted visibility (useSyncExternalStore-style guard: only after mount)
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setVisible((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    for (const w of WIDGETS) {
      const el = document.querySelector<HTMLElement>(`[data-widget="${w.key}"]`);
      if (el) el.style.display = visible[w.key] === false ? "none" : "";
    }
  }, [visible, open]);

  function persist(next: Record<string, boolean>) {
    setVisible(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — session-only */
    }
    for (const w of WIDGETS) {
      const el = document.querySelector<HTMLElement>(`[data-widget="${w.key}"]`);
      if (el) el.style.display = next[w.key] === false ? "none" : "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Reference (session-3): h-9 (36px), px-4 py-2, text-sm, radius 6px,
            border #E5E5E5 (neutral-200 — NOT slate-200), bg-white. */}
        <Button variant="outline" className="border-[#e5e5e5] px-4 py-2 text-sm">
          <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>Choose which widgets appear on your dashboard.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {WIDGETS.map((w) => (
            <div key={w.key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`widget-${w.key}`} className="text-sm font-normal">
                {w.label}
              </Label>
              <Switch
                id={`widget-${w.key}`}
                checked={visible[w.key] !== false}
                onCheckedChange={(checked) => persist({ ...visible, [w.key]: checked })}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
