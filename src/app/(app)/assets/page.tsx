"use client";

import * as React from "react";
import { Inbox, Laptop, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";

/**
 * The LEGACY /assets route — parity round 30 (R30-C).
 *
 * REF serves this orphan page at /assets (the sidebar links "Assets" to
 * /assetmanagement, the modern page — byte-identical since session 12).
 * The clone 404'd here; this page replicates REF's measured contract
 * (docs/remediation-plan-session31.md):
 *
 *   - flat36 header, always-row (`flex justify-between items-start` even
 *     at 390px), the Add Asset button riding the badge row (y=32)
 *   - the green→blue canvas (sRGB-pinned per the Tailwind v4 trap 3)
 *   - the card: border-slate-200, a `bg-slate-50` header band with the
 *     leading-none 16px/600 "Assets" title, `p-0` content, the
 *     `p-12 text-center` "No assets yet" empty state
 *   - the Add Asset dialog: Asset Name / Type (incl. Desktop + Tablet) /
 *     Serial Number / Assign To (Optional) — POSTs the shared /api/assets.
 *
 * With data (unverifiable on REF — the with-data frontier): a divide-y
 * asset list (the functional superset on a REF-stub surface).
 */

const LEGACY_TYPES = [
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "phone", label: "Phone" },
  { value: "tablet", label: "Tablet" },
  { value: "monitor", label: "Monitor" },
  { value: "other", label: "Other" },
];

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string | null;
  status: string;
  assignedToName: string | null;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

function labelize(v: string): string {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LegacyAssetsPage() {
  const toast = useToast();
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, employeesRes] = await Promise.all([fetch("/api/assets"), fetch("/api/employees")]);
      const assetsJson = await assetsRes.json();
      const employeesJson = await employeesRes.json();
      if (assetsJson.ok) setAssets(assetsJson.data.assets);
      else toast.toast({ title: "Failed to load assets", description: assetsJson.error?.message, variant: "error" });
      if (employeesJson.ok) {
        setEmployees(
          employeesJson.data.employees.map((e: EmployeeOption) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName }))
        );
      }
    } catch {
      toast.toast({ title: "Network error", description: "Could not load assets.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onSave(data: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not add asset", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({ title: "Asset added", description: `${String(data.name)} registered.`, variant: "success" });
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    }
  }

  return (
    /* Session 38 (R37-A): the Dialog root is LIFTED to wrap the page —
       DialogTrigger only works inside its root's context, and REF's
       trigger is a real Radix trigger (aria-haspopup="dialog" +
       focus-restore-on-close via triggerRef; read from
       @radix-ui/react-dialog 1.2.0: DialogContentModal's onCloseAutoFocus
       focuses context.triggerRef.current — null with the old plain
       onClick button, which dropped focus to BODY on close). The root
       renders no DOM — layout untouched. */
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          /* Session 31 (R30-C) → Session 49 (R48-A3/G2): REF's header is
           *  the UNPREFIXED always-row `flex justify-between items-start`
           *  with the single Add Asset action rendered DIRECTLY in the
           *  row (no cluster wrapper) and the badge glyph Laptop at
           *  text-green-600 (live-measured @1440×900 this round —
           *  replacing the r30 class-trio translation). */
          alwaysRow
          actionsUnwrapped
          layout="flat36"
          actionsStart
          section="Asset Management"
          iconClassName="text-green-600"
          sectionIcon={<Laptop aria-hidden="true" />}
          title="Assets"
          subtitle="Track and manage company assets"
          actions={
            <DialogTrigger asChild>
              {/* Session 49 (R48-G2b): REF's CTA is the UTILITY-form green
                 gradient (bg-gradient-to-r from-green-600 to-emerald-600,
                 hover:bg-primary/90 — live-measured this round; the
                 endpoints match the r6-measured #16A34A→#059669 sRGB
                 pair; the hover is REF's overlay, not a gradient swap). */}
              <Button className="bg-none bg-gradient-to-r from-green-600 to-emerald-600 hover:bg-none hover:bg-primary/90">
                <Plus className="mr-2" aria-hidden="true" />
                Add Asset
              </Button>
            </DialogTrigger>
          }
        />

        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="leading-none">Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : assets.length === 0 ? (
              /* REF's empty: the systemic icon-over-line recipe — a 64px
                 slate-300 Inbox (mb-4 wrapper, y=310, path-fingerprinted)
                 above the 16px slate-500 line (y=390) */
              <div className="p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <Inbox className="h-16 w-16 text-slate-300" aria-hidden="true" />
                </div>
                <p className="text-slate-500">No assets yet</p>
              </div>
            ) : (
              /* the with-data superset: REF is zero-data; the empty state
                  above is the byte-parity contract */
              <div className="divide-y">
                {assets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-4 px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {labelize(a.type)}
                        {a.serialNumber ? ` · ${a.serialNumber}` : ""}
                        {a.assignedToName ? ` · ${a.assignedToName}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssetDialog
        open={dialogOpen}
        employees={employees}
        onOpenChange={setDialogOpen}
        onSave={onSave}
      />
    </div>
    </Dialog>
  );
}

function AssetDialog({
  open,
  employees,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employees: EmployeeOption[];
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", type: "laptop", serialNumber: "", assignedToId: "none" });

  React.useEffect(() => {
    if (open) setForm({ name: "", type: "laptop", serialNumber: "", assignedToId: "none" });
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const okResult = await onSave({
      name: form.name.trim(),
      type: form.type,
      serialNumber: form.serialNumber.trim(),
      assignedToId: form.assignedToId === "none" ? "" : form.assignedToId,
      value: 0,
    });
    setSaving(false);
    if (okResult) onOpenChange(false);
  }

  return (
    /* Session 38 (R37-A): the root lives on the page now — this
       component renders the Content directly (the context requirement:
       the trigger and the content must share the lifted root). */
    <DialogContent className="max-w-lg">
        {/* Session 35 (R34-A): the H2-only header — REF renders no
            description (the loans pattern, re-measured this round). */}
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
        </DialogHeader>
        {/* Session 35 (R34-A): REF's literal dialog classes — the
            space-y-4 form + space-y-2 field wrappers (v3 semantics:
            margin-top on the following block → 12px label→control gaps;
            the v4 clone compensates with mt-2 on each control — the
            session-34 inline-label trap). */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              className="mt-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Macbook Air 2024"
              required
              maxLength={80}
            />
          </div>
          {/* Session 35 (R34-A): REF's 2-col row — Type + Serial ride one
              grid-cols-2 gap-4 row (223+223 over the 462 inner width,
              labels above each). */}
          <div className="grid grid-cols-2 gap-4">
            {/* No space-y-2 here — Radix's hidden native select renders as
                the LAST child, so v4's :not(:last-child) would put mb-8 on
                the TRIGGER (a phantom 8px inside the cell; REF's v3
                * + * selector never did this). The explicit mt-2 on the
                trigger provides the 12px label→control gap alone. */}
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger aria-label="Asset type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEGACY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-serial">Serial Number</Label>
              <Input
                id="asset-serial"
                className="mt-2"
                value={form.serialNumber}
                onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                maxLength={60}
              />
            </div>
          </div>
          <div>
            <Label>Assign To (Optional)</Label>
            <Select value={form.assignedToId} onValueChange={(v) => setForm((f) => ({ ...f, assignedToId: v }))}>
              <SelectTrigger aria-label="Assign to employee" className="mt-2">
                <SelectValue placeholder="Not assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assigned</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {/* Session 35 (R34-A): text-only — REF's footer button is
                102×36 with no icon.
                Session 38 (R37-B): disabled ONLY while saving — REF keeps
                the submit enabled at rest (its Tab order includes it and
                the empty-submit fires the native validation tooltip; the
                !form.name.trim() clause removed it from the Tab order). */}
            <Button type="submit" disabled={saving}>
              Add Asset
            </Button>
          </DialogFooter>
        </form>
    </DialogContent>
  );
}
