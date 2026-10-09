"use client";

import * as React from "react";
import { Plus, Download, Pencil, Trash2, UserPlus, UserMinus, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatSar } from "@/lib/utils";

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string | null;
  status: string;
  warrantyExpiry: string | null;
  value: number;
  assignedToId: string | null;
  assignedToInternalId: string | null;
  assignedToName: string | null;
}

interface AssetStats {
  total: number;
  assigned: number;
  available: number;
  repair: number;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_OPTIONS = ["all", "available", "assigned", "repair", "retired"];
const TYPE_OPTIONS = ["all", "laptop", "phone", "monitor", "furniture", "vehicle", "other"];

function labelize(v: string): string {
  return v === "all" ? "All" : v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AssetManagementPage() {
  const toast = useToast();
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [stats, setStats] = React.useState<AssetStats>({ total: 0, assigned: 0, available: 0, repair: 0 });
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("all");
  const [type, setType] = React.useState("all");
  const [busy, setBusy] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Asset | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [assignTarget, setAssignTarget] = React.useState<Asset | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status !== "all") qs.set("status", status);
      if (type !== "all") qs.set("type", type);
      const [assetsRes, employeesRes] = await Promise.all([fetch(`/api/assets?${qs}`), fetch("/api/employees")]);
      const assetsJson = await assetsRes.json();
      const employeesJson = await employeesRes.json();
      if (assetsJson.ok) {
        setAssets(assetsJson.data.assets);
        setStats(assetsJson.data.stats);
      } else {
        toast.toast({ title: "Failed to load assets", description: assetsJson.error?.message, variant: "error" });
      }
      if (employeesJson.ok) {
        setEmployees(employeesJson.data.employees.map((e: EmployeeOption) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName })));
      }
    } catch {
      toast.toast({ title: "Network error", description: "Could not load assets.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [status, type, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/assets?id=${editing.id}` : "/api/assets", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return false;
      }
      toast.toast({
        title: editing ? "Asset updated" : "Asset added",
        description: editing ? "Changes saved." : `${String(data.name)} registered in the inventory.`,
        variant: "success",
      });
      setDialogOpen(false);
      setEditing(null);
      await load();
      return true;
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(asset: Asset) {
    if (!window.confirm(`Delete asset "${asset.name}"? This cannot be undone.`)) return;
    setBusy(asset.id + "delete");
    try {
      const res = await fetch(`/api/assets?id=${asset.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Asset deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onAssign(asset: Asset, employeeId: string) {
    setBusy(asset.id + "assign");
    try {
      const res = await fetch(`/api/assets?id=${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: employeeId }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Assign failed", description: json.error?.message, variant: "error" });
        return;
      }
      const emp = employees.find((e) => e.id === employeeId);
      toast.toast({ title: "Asset assigned", description: `${asset.name} → ${emp ? `${emp.firstName} ${emp.lastName}` : "employee"}.`, variant: "success" });
      setAssignTarget(null);
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  async function onUnassign(asset: Asset) {
    setBusy(asset.id + "unassign");
    try {
      const res = await fetch(`/api/assets?id=${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: "" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Unassign failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Asset unassigned", description: `${asset.name} is back in the pool.`, variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setBusy(null);
    }
  }

  function exportCsv() {
    if (assets.length === 0) {
      toast.toast({ title: "Nothing to export", description: "No assets match the current filters.", variant: "info" });
      return;
    }
    const header = ["Asset", "Type", "Serial No.", "Assigned To", "Status", "Warranty", "Value (SAR)"];
    const rows = assets.map((a) => [
      a.name,
      labelize(a.type),
      a.serialNumber ?? "",
      a.assignedToName ?? "",
      labelize(a.status),
      a.warrantyExpiry ? formatDate(a.warrantyExpiry) : "",
      String(a.value / 100),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.toast({ title: "Export ready", description: `${assets.length} asset(s) exported to CSV.`, variant: "success" });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Asset Management"
        subtitle="Track company equipment assigned to employees"
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download aria-hidden="true" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus aria-hidden="true" />
              Add Asset
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Assets" value={stats.total} icon={<Package className="h-4 w-4" />} />
        <StatCard label="Assigned" value={stats.assigned} icon={<Package className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Available" value={stats.available} icon={<Package className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="In Repair" value={stats.repair} icon={<Package className="h-4 w-4" />} iconClassName="bg-amber-100 text-amber-600" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-foreground sm:min-w-24">
          {assets.length} asset{assets.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Statuses" : labelize(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All Types" : labelize(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No assets found"
            description={
              status !== "all" || type !== "all"
                ? "Try clearing the status or type filters."
                : "Add your first company asset to get started"
            }
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus aria-hidden="true" />
                Add Asset
              </Button>
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSar(asset.value)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{labelize(asset.type)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.serialNumber ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.assignedToName ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(asset.warrantyExpiry)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Edit ${asset.name}`}
                        onClick={() => {
                          setEditing(asset);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      {asset.assignedToId ? (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Unassign ${asset.name}`}
                          disabled={busy === asset.id + "unassign"}
                          onClick={() => onUnassign(asset)}
                        >
                          {busy === asset.id + "unassign" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserMinus aria-hidden="true" />}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Assign ${asset.name}`}
                          disabled={busy === asset.id + "assign"}
                          onClick={() => setAssignTarget(asset)}
                        >
                          <UserPlus aria-hidden="true" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="iconSm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${asset.name}`}
                        disabled={busy === asset.id + "delete"}
                        onClick={() => onDelete(asset)}
                      >
                        {busy === asset.id + "delete" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssetDialog
        open={dialogOpen}
        asset={editing}
        employees={employees}
        saving={saving}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={onSave}
      />

      <Dialog open={assignTarget !== null} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>{assignTarget ? `Who receives "${assignTarget.name}"?` : ""}</DialogDescription>
          </DialogHeader>
          {assignTarget ? <AssignForm asset={assignTarget} employees={employees} busy={busy === assignTarget.id + "assign"} onAssign={onAssign} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignForm({
  asset,
  employees,
  busy,
  onAssign,
}: {
  asset: Asset;
  employees: EmployeeOption[];
  busy: boolean;
  onAssign: (asset: Asset, employeeId: string) => void;
}) {
  const [employeeId, setEmployeeId] = React.useState("");
  React.useEffect(() => {
    setEmployeeId(employees[0]?.id ?? "");
  }, [employees, asset.id]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (employeeId) onAssign(asset, employeeId);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assign-employee">Employee</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger id="assign-employee">
            <SelectValue placeholder={employees.length === 0 ? "No employees found" : "Select employee"} />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={busy || !employeeId}>
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
          Assign
        </Button>
      </DialogFooter>
    </form>
  );
}

function AssetDialog({
  open,
  asset,
  employees,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  asset: Asset | null;
  employees: EmployeeOption[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState({
    name: "",
    type: "laptop",
    serialNumber: "",
    value: "0",
    warrantyExpiry: "",
    assignedToId: "none",
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        name: asset?.name ?? "",
        type: asset?.type ?? "laptop",
        serialNumber: asset?.serialNumber ?? "",
        value: asset ? String(asset.value / 100) : "0",
        warrantyExpiry: asset?.warrantyExpiry ? asset.warrantyExpiry.slice(0, 10) : "",
        assignedToId: asset?.assignedToInternalId ?? "none",
      });
    }
  }, [open, asset]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const valueNum = Number(form.value);
    if (!Number.isFinite(valueNum) || valueNum < 0) return;
    const assignee =
      form.assignedToId === "none" ? (asset ? "" : undefined) : form.assignedToId;
    const saved = await onSave({
      name: form.name.trim(),
      type: form.type,
      serialNumber: form.serialNumber.trim(),
      value: Math.round(valueNum * 100),
      warrantyExpiry: form.warrantyExpiry,
      ...(assignee !== undefined ? { assignedToId: assignee } : {}),
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
          <DialogDescription>{asset ? "Update the asset details." : "Register new company equipment."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input id="asset-name" required maxLength={80} placeholder="e.g. MacBook Pro 16&quot;" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="asset-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.filter((t) => t !== "all").map((t) => (
                    <SelectItem key={t} value={t}>
                      {labelize(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-serial">Serial No.</Label>
              <Input id="asset-serial" maxLength={60} placeholder="SN-0001" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-value">Value (SAR)</Label>
              <Input id="asset-value" type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-warranty">Warranty Expiry</Label>
              <Input id="asset-warranty" type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-assign">Assigned To (optional)</Label>
            <Select value={form.assignedToId} onValueChange={(v) => setForm({ ...form, assignedToId: v })}>
              <SelectTrigger id="asset-assign">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {asset?.assignedToName ? (
              <p className="text-xs text-muted-foreground">Currently assigned to {asset.assignedToName}.</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {asset ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
