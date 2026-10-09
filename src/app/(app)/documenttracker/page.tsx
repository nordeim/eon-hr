"use client";

import * as React from "react";
import { BellRing, FileCheck2, FileClock, FileStack, FileText, FileX2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatDate } from "@/lib/utils";

interface DocumentRow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  name: string;
  type: string;
  fileUrl: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  status: string;
  daysToExpiry: number | null;
}

interface EmployeeOption {
  id: string;
  name: string;
  code: string;
}

const DOC_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "id", label: "ID" },
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "certificate", label: "Certificate" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "valid", label: "Valid" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "pending_upload", label: "Pending Upload" },
];

function typeLabel(v: string): string {
  const found = DOC_TYPES.find((t) => t.value === v);
  return found ? found.label : v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DocumentTrackerPage() {
  const toast = useToast();
  const [documents, setDocuments] = React.useState<DocumentRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");
  const [checking, setChecking] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const [editing, setEditing] = React.useState<DocumentRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  function openNewDialog() {
    setDialogSeq((s) => s + 1);
    setEditing(null);
    setDialogOpen(true);
  }

  function openEditDialog(doc: DocumentRow) {
    setDialogSeq((s) => s + 1);
    setEditing(doc);
    setDialogOpen(true);
  }

  const load = React.useCallback(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setDocuments(json.data.documents);
          setEmployees(json.data.employees);
        } else {
          toast.toast({ title: "Failed to load", description: json.error?.message, variant: "error" });
        }
      })
      .catch(() => toast.toast({ title: "Failed to load", description: "Network error", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function runAlertCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/documents/alert-check", { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Alert check failed", description: json.error?.message, variant: "error" });
        return;
      }
      const { checked, updated, alertsCreated, expiring, expired } = json.data;
      toast.toast({
        title: "Alert check complete",
        description: `${checked} documents checked — ${expiring} expiring, ${expired} expired, ${updated} status${updated === 1 ? "" : "es"} updated, ${alertsCreated} new alert${alertsCreated === 1 ? "" : "s"}.`,
        variant: "info",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setChecking(false);
    }
  }

  async function saveDocument(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/documents?id=${editing.id}` : "/api/documents", {
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
        title: editing ? "Document updated" : "Document added",
        description: editing ? "Changes saved." : `${String(data.name)} was added to the tracker.`,
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

  async function deleteDocument(doc: DocumentRow) {
    if (!window.confirm(`Delete "${doc.name}"? Related compliance alerts are also removed.`)) return;
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Document deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  const stats = React.useMemo(() => {
    return {
      total: documents.length,
      valid: documents.filter((d) => d.status === "valid").length,
      expiring: documents.filter((d) => d.status === "expiring").length,
      expired: documents.filter((d) => d.status === "expired").length,
    };
  }, [documents]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return documents;
    return documents.filter((d) => d.status === filter);
  }, [documents, filter]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="Document Management"
        sectionIcon={<FileText aria-hidden="true" />}
        title="Document Tracker"
        subtitle="Track employee documents & automated expiry alerts"
        actions={
          <>
            <Button variant="outline" disabled={checking} onClick={runAlertCheck}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BellRing aria-hidden="true" />}
              Run Alert Check
            </Button>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2" aria-hidden="true" />
              Add Document
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Documents" value={stats.total} icon={<FileStack className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Valid" value={stats.valid} icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Expiring ≤30 days" value={stats.expiring} icon={<FileClock className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Expired" value={stats.expired} icon={<FileX2 className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="No documents found"
            description="Add your first employee document to start tracking expiry."
            action={
              <Button onClick={openNewDialog}>
                <Plus className="mr-2" aria-hidden="true" />
                Add Document
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No documents found" description="No documents match this filter." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{doc.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{doc.employeeCode}</p>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{doc.name}</TableCell>
                  <TableCell className="text-muted-foreground">{typeLabel(doc.type)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(doc.issueDate)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.expiryDate)}
                    {doc.daysToExpiry !== null && doc.status === "expiring" ? (
                      <span className="block text-xs text-amber-600">in {doc.daysToExpiry} day(s)</span>
                    ) : null}
                    {doc.daysToExpiry !== null && doc.status === "expired" ? (
                      <span className="block text-xs text-red-600">{Math.abs(doc.daysToExpiry)} day(s) ago</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Edit ${doc.name}`}
                        onClick={() => openEditDialog(doc)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        aria-label={`Delete ${doc.name}`}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => deleteDocument(doc)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DocumentDialog
        key={`doc-${dialogSeq}-${editing?.id ?? "new"}`}
        open={dialogOpen}
        editing={editing}
        employees={employees}
        saving={saving}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={saveDocument}
      />
    </div>
  );
}

function DocumentDialog({
  open,
  editing,
  employees,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  editing: DocumentRow | null;
  employees: EmployeeOption[];
  saving: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = React.useState(() => ({
    employeeId: editing?.employeeId ?? employees[0]?.id ?? "",
    name: editing?.name ?? "",
    type: editing?.type ?? "contract",
    issueDate: editing?.issueDate ? editing.issueDate.slice(0, 10) : "",
    expiryDate: editing?.expiryDate ? editing.expiryDate.slice(0, 10) : "",
    notes: editing?.notes ?? "",
    pendingUpload: editing?.status === "pending_upload",
  }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      employeeId: form.employeeId,
      name: form.name,
      type: form.type,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
      ...(form.pendingUpload ? { status: "pending_upload" } : {}),
    });
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the document details." : "Track an employee document and its expiry."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-employee">Employee</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger id="doc-employee">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              required
              maxLength={140}
              placeholder="e.g. Employment Contract"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="doc-pending"
                checked={form.pendingUpload}
                onCheckedChange={(checked) => setForm({ ...form, pendingUpload: checked === true })}
              />
              <Label htmlFor="doc-pending" className="cursor-pointer font-normal">
                Pending upload (no file yet)
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-issue">Issue Date</Label>
              <Input
                id="doc-issue"
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-expiry">Expiry Date</Label>
              <Input
                id="doc-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-notes">Notes</Label>
            <Textarea
              id="doc-notes"
              rows={2}
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.employeeId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {editing ? "Save Changes" : "Add Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
