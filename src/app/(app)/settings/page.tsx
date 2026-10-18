"use client";

import * as React from "react";
import { Building2, CircleCheckBig, Clock, FileText, Loader2, Palette, Pencil, Plug, Plus, Save, SettingsIcon, Trash2, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

interface CompanyInfo {
  name: string;
  industry: string | null;
  size: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  taxId: string | null;
  registrationNumber: string | null;
}

interface DepartmentRow {
  id: string;
  name: string;
  code: string | null;
  description?: string | null;
  managerEmail?: string | null;
  employeeCount: number;
}

interface ShiftRow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  department: string | null;
  active: boolean;
}

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  userName: string;
}

interface WorkflowRow {
  id: string;
  name: string;
  active: boolean;
}

const COMPANY_FIELDS: { key: keyof CompanyInfo; label: string }[] = [
  { key: "name", label: "Company Name" },
  { key: "industry", label: "Industry" },
  { key: "size", label: "Company Size" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "address", label: "Address" },
  { key: "taxId", label: "Tax ID" },
  { key: "registrationNumber", label: "Registration Number" },
];

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function SettingsPage() {
  const toast = useToast();
  const [canEdit, setCanEdit] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        setCanEdit(["admin", "hr"].includes(json.data?.user?.role ?? ""));
      } catch {
        setCanEdit(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
        section="System Settings"
        layout="flat36"
        iconClassName="text-blue-600"
        sectionIcon={<SettingsIcon aria-hidden="true" />}
        title="Settings"
        subtitle="Configure your HR system"
      />

      {/* Session 14 (R13-B): the reference's settings tabs — the DEFAULT
          shrink-wrapped TabsList with bg-white + border (971px, not the
          full-width muted pill) and iconed triggers (16px svg, mr-2). */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="company"><Building2 className="h-4 w-4 mr-2" aria-hidden="true" />Company</TabsTrigger>
          <TabsTrigger value="workflows"><Workflow className="h-4 w-4 mr-2" aria-hidden="true" />Approval Workflows</TabsTrigger>
          <TabsTrigger value="shifts"><Clock className="h-4 w-4 mr-2" aria-hidden="true" />Shifts</TabsTrigger>
          <TabsTrigger value="departments"><Users className="h-4 w-4 mr-2" aria-hidden="true" />Departments</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-4 w-4 mr-2" aria-hidden="true" />Integrations</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="h-4 w-4 mr-2" aria-hidden="true" />Theme &amp; Layout</TabsTrigger>
          <TabsTrigger value="logs"><FileText className="h-4 w-4 mr-2" aria-hidden="true" />System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-0">
          <CompanyTab canEdit={canEdit} toast={toast} />
        </TabsContent>
        <TabsContent value="workflows" className="mt-0">
          <WorkflowsTab toast={toast} />
        </TabsContent>
        <TabsContent value="shifts" className="mt-0">
          <ShiftsTab toast={toast} />
        </TabsContent>
        <TabsContent value="departments" className="mt-0">
          <DepartmentsTab canEdit={canEdit} toast={toast} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-0">
          <IntegrationsTab toast={toast} />
        </TabsContent>
        <TabsContent value="theme" className="mt-0">
          <ThemeTab toast={toast} />
        </TabsContent>
        <TabsContent value="logs" className="mt-0">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}

// ---------------------------------------------------------------- Company

function CompanyTab({ canEdit, toast }: { canEdit: boolean; toast: ReturnType<typeof useToast> }) {
  const [company, setCompany] = React.useState<CompanyInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    industry: "",
    size: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    taxId: "",
    registrationNumber: "",
  });

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/company");
        const json = await res.json();
        if (json.ok) setCompany(json.data.company);
        else toast.toast({ title: "Failed to load company", description: json.error?.message, variant: "error" });
      } catch {
        toast.toast({ title: "Network error", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (editOpen && company) {
      setForm({
        name: company.name ?? "",
        industry: company.industry ?? "",
        size: company.size ?? "",
        phone: company.phone ?? "",
        email: company.email ?? "",
        website: company.website ?? "",
        address: company.address ?? "",
        taxId: company.taxId ?? "",
        registrationNumber: company.registrationNumber ?? "",
      });
    }
  }, [editOpen, company]);

  async function onSave() {
    if (!form.name.trim()) {
      toast.toast({ title: "Company name is required", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          industry: form.industry.trim(),
          size: form.size,
          phone: form.phone.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          taxId: form.taxId.trim(),
          registrationNumber: form.registrationNumber.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Save failed", description: json.error?.message, variant: "error" });
        return;
      }
      setCompany(json.data.company);
      setEditOpen(false);
      toast.toast({ title: "Company updated", description: "Company information saved.", variant: "success" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    /* Session 14 (R13-B): reference recipe — CardHeader is a
       `flex flex-col space-y-1.5` stack whose inner row is
       `flex justify-between items-center` (title-only DIV
       `font-semibold leading-none tracking-tight` + the iconed h-9
       Edit); the content is `p-6` > `space-y-6` > `grid
       md:grid-cols-2 gap-6` of read-only p-4 bg-slate-50 rounded-lg
       tiles (label text-sm slate-500 mb-1 + value font-medium).
       631px card. Session 56 (R56-A): the tile interiors re-measured
       live — every tile carries bg-slate-50 + rounded-lg (computed
       rgb(248,250,252) + 8px) and the ADDRESS tile rides an
       UNPREFIXED col-span-2 (the always-on span that forces the
       2-track implicit grid below md — REF at 390px computes 2
       content-sized tracks, not a stacked column). */
    <Card className="border-slate-200">
      <CardHeader className="flex flex-col space-y-1.5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="font-semibold leading-none tracking-tight">Company Information</div>
          {canEdit ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2" aria-hidden="true" />
              Edit
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {COMPANY_FIELDS.map((f) => (
              <div key={f.key} className={f.key === "address" ? "p-4 bg-slate-50 rounded-lg col-span-2" : "p-4 bg-slate-50 rounded-lg"}>
                <p className="text-sm text-slate-500 mb-1">{f.label}</p>
                <p className="font-medium text-slate-900">
                  {company ? company[f.key] || "Not set" : "Not set"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Company Information</DialogTitle>
            <DialogDescription>Update your company details.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onSave();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-industry">Industry</Label>
                <Input
                  id="company-industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="retail"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-size">Company Size</Label>
                <Select value={form.size || "none"} onValueChange={(v) => setForm({ ...form, size: v === "none" ? "" : v })}>
                  <SelectTrigger id="company-size">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    {SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+65 87651230"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-website">Website</Label>
              <Input
                id="company-website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company-address">Address</Label>
              <Input
                id="company-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Singapore, Singapore"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-tax">Tax ID</Label>
                <Input
                  id="company-tax"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-reg">Registration Number</Label>
                <Input
                  id="company-reg"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ----------------------------------------------------------- Approval Workflows

function WorkflowsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [workflows, setWorkflows] = React.useState<WorkflowRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/approval-workflows");
      const json = await res.json();
      if (json.ok) setWorkflows(json.data.workflows);
    } catch {
      // non-critical tab
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    /* Session 38 (R37-A): the Dialog root LIFTED to wrap the Card —
       the DialogTrigger (below) must sit inside the root's context
       for REF's trigger contract (aria-haspopup="dialog" +
       focus-restore-on-close via triggerRef). Renders no DOM. */
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
    <Card className="border-slate-200">
      {/* Session 36 (R35-F1): REF's header — the flex-row recipe with the
          Add Workflow action riding the row (REF: 160×36, the dark solid
          bg rgb(23,23,23) + Plus mr-2 — the live re-measure found the
          button the census missed entirely). */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6">
        <div className="font-semibold leading-none tracking-tight">Approval Workflows</div>
        <DialogTrigger asChild>
          <Button variant="dark">
            <Plus className="mr-2" aria-hidden="true" />
            Add Workflow
          </Button>
        </DialogTrigger>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : workflows.length === 0 ? (
          /* Session 36 (R35-E): REF's empty — the 48px slate-300 icon + the
             single 16px slate-500 P (no second line; measured y-for-y). */
          <div className="py-14 text-center">
            <CircleCheckBig className="w-12 h-12 mx-auto mb-3 text-slate-300" aria-hidden="true" />
            <p className="text-base text-slate-500">No workflows configured</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {workflows.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <p className="text-sm font-medium text-foreground">{w.name}</p>
                <StatusBadge status={w.active ? "active" : "inactive"} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CreateWorkflowDialog onOpenChange={setAddOpen} onCreated={load} toast={toast} />
    </Card>
    </Dialog>
  );
}

/* Session 36 (R35-F2): REF's Create Approval Workflow dialog —
   live-measured contract: max-w-3xl (768px), the H2-only header, Row 1 =
   Workflow Name | Type (a w-full h-9 select with the five options
   Leave/Expense/Loan/Payroll/Recruitment), the Approval Levels row
   (label + the 113×32 outline size-sm Add Level at the right), level
   cards (rounded-xl border p-4 border-slate-200: the H4 "Level N" + the
   40×32 Trash2 text-red-600 remove + grid grid-cols-2 gap-3 with the
   "Level Name (e.g., Manager)" / "Role (e.g., Department Head)" /
   "Delay (hours)" inputs + the Mandatory checkbox), footer Cancel
   (outline 81×36) + Create (dark 79×36, right-aligned).
   Superset wiring: Create posts to the existing /api/approval-workflows
   endpoint (levels capped at the API's 3; the level drafts persist in
   the actions JSON). */
const APPLIES_BY_TYPE: Record<string, string> = {
  leave: "leave_requests",
  expense: "expenses",
  loan: "loans",
  payroll: "payroll",
  recruitment: "recruitment",
};

interface LevelDraft {
  name: string;
  role: string;
  delay: string;
  mandatory: boolean;
}

function CreateWorkflowDialog({
  onOpenChange,
  onCreated,
  toast,
}: {
  onOpenChange: (v: boolean) => void;
  onCreated: () => Promise<void>;
  toast: ReturnType<typeof useToast>;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<string>("leave");
  const [levels, setLevels] = React.useState<LevelDraft[]>([]);
  const [saving, setSaving] = React.useState(false);

  function addLevel() {
    setLevels((ls) =>
      ls.length >= 3 ? ls : [...ls, { name: "", role: "", delay: "", mandatory: false }]
    );
  }

  function patchLevel(i: number, patch: Partial<LevelDraft>) {
    setLevels((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function create() {
    setSaving(true);
    try {
      const res = await fetch("/api/approval-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          levels: Math.max(1, levels.length),
          appliesTo: APPLIES_BY_TYPE[type] ?? "leave_requests",
          threshold: 0,
          active: true,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not create the workflow", description: json.error?.message, variant: "error" });
        return;
      }
      onOpenChange(false);
      setName("");
      setType("leave");
      setLevels([]);
      await onCreated();
      toast.toast({ title: "Workflow created", variant: "success" });
    } catch {
      toast.toast({ title: "Network error — try again", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    /* Session 38 (R37-A): the root lives in WorkflowsTab now — this
       renders the Content directly (trigger + content share the root). */
    <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Approval Workflow</DialogTitle>
        </DialogHeader>
        {/* Session 37 (R36-A): REF wraps the body in a real <form> — the
            Name input carries required (REF's empty-submit is the NATIVE
            tooltip, no custom error text) and Create is the submit. */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wf-name">Workflow Name</Label>
              <Input
                id="wf-name"
                className="mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                required
              />
            </div>
            {/* No space-y here — Radix's hidden native select renders as
                the LAST child, so v4's :not(:last-child) would put mb on
                the TRIGGER (the session-35 phantom-8px trap). The trigger's
                mt-2 carries the 12px label→control gap alone (the verified
                asset-dialog recipe). */}
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="recruitment">Recruitment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium leading-none">Approval Levels</Label>
              {/* Session 38 (R37-C1): REF's interior Add Level = 113×32 —
                  the Plus rides w-4 h-4 mr-1 (16px icon + 4px margin);
                  the clone's mr-2 measured 117×32 and shifted the
                  dialog's right-edge stack (Cancel x 911 vs REF 907). */}
              <Button variant="outline" size="sm" type="button" onClick={addLevel}>
                <Plus className="mr-1" aria-hidden="true" />
                Add Level
              </Button>
            </div>
            {levels.map((level, i) => (
              <Card key={i} className="p-4 border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Level {i + 1}</h4>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-10"
                      type="button"
                      onClick={() => setLevels((ls) => ls.filter((_, idx) => idx !== i))}
                      aria-label={`Remove level ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                    </Button>
                  </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={level.name}
                    onChange={(e) => patchLevel(i, { name: e.target.value })}
                    placeholder="Level Name (e.g., Manager)"
                  />
                  <Input
                    value={level.role}
                    onChange={(e) => patchLevel(i, { role: e.target.value })}
                    placeholder="Role (e.g., Department Head)"
                  />
                  <Input
                    type="number"
                    value={level.delay}
                    onChange={(e) => patchLevel(i, { delay: e.target.value })}
                    placeholder="Delay (hours)"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`wf-level-${i}-mandatory`}
                      checked={level.mandatory}
                      onCheckedChange={(v) => patchLevel(i, { mandatory: v === true })}
                    />
                    <Label
                      htmlFor={`wf-level-${i}-mandatory`}
                      className="text-sm font-medium leading-none"
                    >
                      Mandatory
                    </Label>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="dark" type="submit" disabled={saving}>
              Create
            </Button>
          </DialogFooter>
        </form>
    </DialogContent>
  );
}

// ---------------------------------------------------------------- Shifts

function ShiftsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [shifts, setShifts] = React.useState<ShiftRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/shifts");
      const json = await res.json();
      if (json.ok) setShifts(json.data.shifts);
    } catch {
      // non-critical tab
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    /* Session 38 (R37-A): the Dialog root LIFTED to wrap the Card — the
       DialogTrigger (below) must sit inside the root's context for REF's
       trigger contract (aria-haspopup="dialog" + focus-restore). */
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
    <Card className="border-slate-200">
      {/* Session 36 (R35-F4): REF's header — the flex-row recipe with the
          Add Shift action (REF: 127×36, the dark solid + Plus mr-2 — the
          live re-measure found the button the census missed). */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6">
        <div className="font-semibold leading-none tracking-tight">Work Shifts</div>
        <DialogTrigger asChild>
          <Button variant="dark">
            <Plus className="mr-2" aria-hidden="true" />
            Add Shift
          </Button>
        </DialogTrigger>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="py-14 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" aria-hidden="true" />
            <p className="text-base text-slate-500">No shifts configured</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.startTime} – {s.endTime}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.department ?? "All Departments"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.active ? "active" : "inactive"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <AddShiftDialog onOpenChange={setAddOpen} onCreated={load} toast={toast} />
    </Card>
    </Dialog>
  );
}

/* Session 36 (R35-F5): REF's Add Shift dialog — live-measured contract:
   max-w-lg (512px), the H2-only header, three 2-col rows (Shift Name |
   Code with the "e.g., M, E, N" placeholder; Start Time | End Time as
   type=time; Break (minutes) | Tolerance (minutes) with the "0"
   placeholder), the Status row (label + the Active/Inactive select),
   footer Cancel (outline) + Create (dark). Superset wiring: Create posts
   to /api/shifts in its new shape-discriminated create mode. */
function AddShiftDialog({
  onOpenChange,
  onCreated,
  toast,
}: {
  onOpenChange: (v: boolean) => void;
  onCreated: () => Promise<void>;
  toast: ReturnType<typeof useToast>;
}) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("17:00");
  // Session 37 (R36-A5): REF's defaults are 60 and 0 (live-measured
  // val="60"/"0"), not empty strings.
  const [breakMinutes, setBreakMinutes] = React.useState("60");
  const [toleranceMinutes, setToleranceMinutes] = React.useState("0");
  const [status, setStatus] = React.useState("active");
  const [saving, setSaving] = React.useState(false);

  async function create() {
    setSaving(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || undefined,
          startTime,
          endTime,
          breakMinutes: breakMinutes === "" ? undefined : Number(breakMinutes),
          toleranceMinutes: toleranceMinutes === "" ? undefined : Number(toleranceMinutes),
          active: status === "active",
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not create the shift", description: json.error?.message, variant: "error" });
        return;
      }
      onOpenChange(false);
      setName("");
      setCode("");
      setStartTime("09:00");
      setEndTime("17:00");
      setBreakMinutes("60");
      setToleranceMinutes("0");
      setStatus("active");
      await onCreated();
      toast.toast({ title: "Shift created", variant: "success" });
    } catch {
      toast.toast({ title: "Network error — try again", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    /* Session 38 (R37-A): the root lives in ShiftsTab now — this renders
       the Content directly (trigger + content share the root). */
    <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Shift</DialogTitle>
        </DialogHeader>
        {/* Session 37 (R36-A): REF's form contract — Name/Start/End carry
            required (native validation; no custom error text), and the
            Status row rides INSIDE the grid as the 7th cell (a 223px
            column with the w-full trigger). */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift-name">Shift Name</Label>
              <Input id="shift-name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-code">Code</Label>
              <Input
                id="shift-code"
                className="mt-2"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., M, E, N"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-start">Start Time</Label>
              <Input
                id="shift-start"
                className="mt-2"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-end">End Time</Label>
              <Input
                id="shift-end"
                className="mt-2"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-break">Break (minutes)</Label>
              <Input
                id="shift-break"
                className="mt-2"
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-tolerance">Tolerance (minutes)</Label>
              <Input
                id="shift-tolerance"
                className="mt-2"
                type="number"
                value={toleranceMinutes}
                onChange={(e) => setToleranceMinutes(e.target.value)}
                placeholder="0"
              />
            </div>
            {/* No space-y — the Radix last-child trap (see the workflow
                dialog's Type cell). */}
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="dark" type="submit" disabled={saving}>
              Create
            </Button>
          </DialogFooter>
        </form>
    </DialogContent>
  );
}

// ------------------------------------------------------------ Departments

function DepartmentsTab({ canEdit, toast }: { canEdit: boolean; toast: ReturnType<typeof useToast> }) {
  const [departments, setDepartments] = React.useState<DepartmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  // Session 37 (R36-B): REF's dialog fields — Name + Description +
  // Manager Email (the Name+Code pair was invented; code stays in the
  // API for compat).
  const [form, setForm] = React.useState({ name: "", description: "", managerEmail: "" });

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      const json = await res.json();
      if (json.ok) setDepartments(json.data.departments);
      else toast.toast({ title: "Failed to load departments", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onAdd() {
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          managerEmail: form.managerEmail.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Add failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Department added", description: `${form.name.trim()} is ready.`, variant: "success" });
      setAddOpen(false);
      setForm({ name: "", description: "", managerEmail: "" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(dept: DepartmentRow) {
    if (!window.confirm(`Delete ${dept.name}?`)) return;
    try {
      const res = await fetch(`/api/departments?id=${dept.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Delete failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Department deleted", variant: "success" });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  return (
    /* Session 38 (R37-A): the Dialog root LIFTED to wrap the Card — the
       DialogTrigger (below) must sit inside the root's context for REF's
       trigger contract (aria-haspopup="dialog" + focus-restore). */
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
    <Card className="border-slate-200">
      {/* Session 36 (R35-E): REF's header — the title-only border-b recipe
          + the Add Department button at the DEFAULT h-9 size (180×36,
          dark variant, Plus icon — measured; the clone's outline size-sm
          was 158×32). */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6">
        <div className="font-semibold leading-none tracking-tight">Departments</div>
        {canEdit ? (
          <DialogTrigger asChild>
            <Button variant="dark">
              <Plus className="mr-2" aria-hidden="true" />
              Add Department
            </Button>
          </DialogTrigger>
        ) : null}
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : departments.length === 0 ? (
          /* Session 36 (R35-E): REF's empty — the 48px slate-300 Building2
             + the P-based two-line empty (16px slate-500 title + 14px
             slate-400 description; measured y-for-y). */
          <div className="py-14 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" aria-hidden="true" />
            <p className="text-base text-slate-500">No departments yet</p>
            <p className="mt-1 text-sm text-slate-400">Click &quot;Add Department&quot; to create your first department.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.code ? `Code ${d.code} · ` : ""}
                      {d.employeeCount} employee{d.employeeCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.employeeCount === 0 ? <Badge variant="secondary">Empty</Badge> : null}
                  {canEdit ? (
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Delete ${d.name}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(d)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Session 37 (R36-B): REF's Add Department dialog — live-measured
          contract: max-w-lg (512×372), the form space-y-4 with three stacked
          space-y-2 fields ("Department Name *" required ph "e.g., Human
          Resources" / Description ph "Brief description" / Manager Email
          type=email ph "manager@company.com"), the footer's
          flex justify-end gap-3 with Cancel (outline 81×36, button) +
          Create (dark solid 79×36, submit). No DialogDescription. */}
      {/* Session 38 (R37-A): the root is lifted — the Content renders
          directly under the tab-level root. */}
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onAdd();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name *</Label>
              <Input
                id="dept-name"
                className="mt-2"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Human Resources"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-description">Description</Label>
              <Input
                id="dept-description"
                className="mt-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-manager">Manager Email</Label>
              <Input
                id="dept-manager"
                className="mt-2"
                type="email"
                value={form.managerEmail}
                onChange={(e) => setForm({ ...form, managerEmail: e.target.value })}
                placeholder="manager@company.com"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="dark" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
    </Card>
    </Dialog>
  );
}

// ------------------------------------------------------------ Integrations

function IntegrationsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  /* Session 36 (R35-E): REF's integration registry (live-measured — the
     four 527×98 tiles): WhatsApp / SMS Gateway / Email Service / ZKT
     BioTime Cloud, each with a 48px text-initials chip (w-12 h-12
     {color}-100 rounded-lg + {color}-700 font-bold text-lg) and an
     outline Connect/Configure action — Email carries the Active badge
     instead. The clone's previous icon-chip tile set was invented. */
  const integrations = [
    {
      name: "WhatsApp Integration",
      description: "Send notifications via WhatsApp",
      initials: "WA",
      chipBg: "bg-green-100",
      chipText: "text-green-700",
      action: "Connect" as const,
    },
    {
      name: "SMS Gateway",
      description: "Twilio or local provider",
      initials: "SMS",
      chipBg: "bg-blue-100",
      chipText: "text-blue-700",
      action: "Configure" as const,
    },
    {
      name: "Email Service",
      description: "Built-in email integration",
      initials: "@",
      chipBg: "bg-slate-100",
      chipText: "text-slate-700",
      active: true,
    },
    {
      name: "ZKT BioTime Cloud",
      description: "Biometric Attendance Sync",
      initials: "ZKT",
      chipBg: "bg-indigo-100",
      chipText: "text-indigo-700",
      action: "Connect" as const,
    },
  ];
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-slate-200">
        <div className="font-semibold leading-none tracking-tight">System Integrations</div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.map((i) => (
            <div
              key={i.name}
              className="p-6 border border-slate-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${i.chipBg} rounded-lg flex items-center justify-center`}>
                  <span className={`${i.chipText} font-bold text-lg`}>{i.initials}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{i.name}</h3>
                  <p className="text-sm text-slate-500">{i.description}</p>
                </div>
              </div>
              {i.active ? (
                /* REF's Active badge: the green-100/green-700 pair. */
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 border-transparent">
                  Active
                </span>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.toast({
                      title: `${i.name} is not configured`,
                      description: "Set the provider credentials in your deployment environment to connect.",
                      variant: "info",
                    })
                  }
                >
                  {i.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------ Theme & Layout

/* Session 36 (R35-E): REF's real theme form (live-measured): the three
   workspace colors (the html-token triple #1877f2 / #42b72a / #e4e6eb as
   the starting values), a preview box with three 80px swatches, and the
   Layout Settings section (Menu Position select + the two collapse
   checkboxes). The clone's Compact Mode / Density controls were invented.
   Superset wiring: Save Theme applies the three custom properties to
   document.documentElement.style and persists them to localStorage
   (restored on boot by the THEME_BOOT sibling in layout.tsx). */
const THEME_COLORS_KEY = "eon-theme-colors";
const DEFAULT_THEME_COLORS = { primary: "#1877f2", secondary: "#42b72a", accent: "#e4e6eb" };

/* Session 36 (R35-F8): REF's three Quick Presets (live-measured swatch
   triples — see the ThemeTab comment). */
const THEME_PRESETS = [
  { name: "Facebook (Default)", primary: "#1877f2", secondary: "#42b72a", accent: "#e4e6eb" },
  { name: "Professional Blue", primary: "#3b82f6", secondary: "#6366f1", accent: "#e0e7ff" },
  { name: "Fresh Green", primary: "#10b981", secondary: "#059669", accent: "#d1fae5" },
] as const;

function ThemeTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [colors, setColors] = React.useState(DEFAULT_THEME_COLORS);
  const [menuPosition, setMenuPosition] = React.useState("left");
  const [allowCollapse, setAllowCollapse] = React.useState(true);
  const [startCollapsed, setStartCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(THEME_COLORS_KEY);
      if (raw) setColors({ ...DEFAULT_THEME_COLORS, ...JSON.parse(raw) });
    } catch {
      /* corrupted storage — keep defaults */
    }
  }, []);

  function applyPreset(preset: { primary: string; secondary: string; accent: string }) {
    setColors({ primary: preset.primary, secondary: preset.secondary, accent: preset.accent });
  }

  function saveTheme() {
    setColors((c) => {
      try {
        window.localStorage.setItem(THEME_COLORS_KEY, JSON.stringify(c));
        document.documentElement.style.setProperty("--primary-color", c.primary);
        document.documentElement.style.setProperty("--secondary-color", c.secondary);
        document.documentElement.style.setProperty("--accent-color", c.accent);
      } catch {
        /* storage unavailable — session-only */
      }
      return c;
    });
    toast.toast({ title: "Theme saved", variant: "success" });
  }

  const fields = [
    { key: "primary" as const, label: "Primary Color" },
    { key: "secondary" as const, label: "Secondary Color" },
    { key: "accent" as const, label: "Accent Color" },
  ];

  return (
    <Card className="border-slate-200">
      {/* REF's header: the title-only border-b recipe + the dark Save
          Theme action riding the header row (36px). */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6">
        <div className="font-semibold leading-none tracking-tight">Theme &amp; Layout Settings</div>
        {/* Session 36 (R35-F7): REF's Save Theme — the dark solid
           (bg rgb(23,23,23), 151×36) with the lucide-save mr-2 icon
           (re-measured; the gradient CTA was the wrong recipe family). */}
        <Button variant="dark" onClick={saveTheme}>
          <Save className="mr-2" aria-hidden="true" />
          Save Theme
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Colors</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={`theme-${f.key}`}>{f.label}</Label>
              {/* REF's field row: the 64×40 color input + the hex text
                  field (269×36). */}
              <div className="flex gap-2">
                <input
                  id={`theme-${f.key}`}
                  type="color"
                  className="flex rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-16 h-10"
                  value={colors[f.key]}
                  onChange={(e) => setColors({ ...colors, [f.key]: e.target.value })}
                />
                <Input
                  className="sm:max-w-[269px]"
                  value={colors[f.key]}
                  onChange={(e) => setColors({ ...colors, [f.key]: e.target.value })}
                  aria-label={`${f.label} hex value`}
                />
              </div>
            </div>
          ))}
        </div>
        {/* REF's preview box: mt-4 p-4 bg-slate-50 rounded-lg with the
            "Preview:" label + three 80px swatch tiles. */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 mb-3">Preview:</p>
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-lg shadow-sm border-2" style={{ backgroundColor: colors.primary }} />
            <div className="w-20 h-20 rounded-lg shadow-sm border-2" style={{ backgroundColor: colors.secondary }} />
            <div className="w-20 h-20 rounded-lg shadow-sm border-2" style={{ backgroundColor: colors.accent }} />
          </div>
        </div>
        {/* REF's Layout Settings: the pt-6 border-t section with the Menu
            Position select + the two collapse checkboxes. */}
        <div className="pt-6 border-t mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Layout Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Menu Position</Label>
              <Select value={menuPosition} onValueChange={setMenuPosition}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Sidebar</SelectItem>
                  <SelectItem value="top">Top Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow-collapse"
                checked={allowCollapse}
                onCheckedChange={(v) => setAllowCollapse(v === true)}
              />
              <Label htmlFor="allow-collapse" className="text-sm font-medium leading-none">
                Allow sidebar to collapse
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="start-collapsed"
                checked={startCollapsed}
                onCheckedChange={(v) => setStartCollapsed(v === true)}
              />
              <Label htmlFor="start-collapsed" className="text-sm font-medium leading-none">
                Start with sidebar collapsed
              </Label>
            </div>
          </div>
        </div>
        {/* Session 36 (R35-F8): REF's Quick Presets — the three outline
           cards (REF: 346×86 each in the 3-col grid; outline variant +
           h-auto p-4 flex flex-col items-start gap-2; the three w-6 h-6
           rounded swatches + the name). Live-measured swatches:
           Facebook (Default) #1877f2/#42b72a/#e4e6eb, Professional Blue
           #3b82f6/#6366f1/#e0e7ff, Fresh Green #10b981/#059669/#d1fae5.
           Click populates the three color fields (REF behavior — the
           card itself carries no active state). */}
        <div className="pt-6 border-t mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Presets</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                </div>
                <span className="text-sm font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------ System Logs

/* Session 36 (R35-E): REF's log-viewer shell (live-measured): the border-b
   header with the "{N} total logs" counter, the five-field filter grid
   (grid md:grid-cols-5 gap-4 — Search / User / Action / From Date / To
   Date) with a Clear Filters size-sm action below, and the "No logs found
   matching your filters" empty line (16px slate-500, text-center py-8 —
   no icon). The with-data table stays as the clone's superset. */
function LogsTab() {
  const [logs, setLogs] = React.useState<AuditLogRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [forbidden, setForbidden] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [user, setUser] = React.useState("all");
  const [action, setAction] = React.useState("all");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/audit-logs");
        const json = await res.json();
        if (json.ok) setLogs(json.data.logs);
        else setForbidden(true);
      } catch {
        setForbidden(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const users = React.useMemo(
    () => Array.from(new Set(logs.map((l) => l.userName))).sort(),
    [logs]
  );
  const actions = React.useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs]
  );

  const filtered = logs.filter((l) => {
    if (search && !`${l.action} ${l.entity} ${l.userName}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (user !== "all" && l.userName !== user) return false;
    if (action !== "all" && l.action !== action) return false;
    if (from && new Date(l.createdAt) < new Date(from)) return false;
    if (to && new Date(l.createdAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  });

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 p-6">
        <div className="font-semibold leading-none tracking-tight">System Audit Logs</div>
        <div className="text-sm text-slate-600">{filtered.length} total logs</div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Session 36 (R35-F9): REF's filter area rides a slate-50 island —
            mb-6 p-4 bg-slate-50 rounded-lg space-y-4 wraps the five-field
            grid + the Clear Filters action (re-measured: the wrapper's p-4
            gives REF's 195px grid columns; the clone's bare grid rendered
            201 — the census had the grid recipe but missed the wrapper). */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
          <div className="grid md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="log-search">Search</Label>
            <Input
              id="log-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
            />
          </div>
          <div className="space-y-2">
            <Label>User</Label>
            <Select value={user} onValueChange={setUser}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-from">From Date</Label>
            <Input id="log-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-to">To Date</Label>
            <Input id="log-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setUser("all");
                setAction("all");
                setFrom("");
                setTo("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : forbidden ? (
          <EmptyState
            title="Access restricted"
            description="Only admin, HR or security roles can view system logs."
          />
        ) : filtered.length === 0 ? (
          /* Session 36 (R35-F13): REF's empty carries the 48px FileText
             slate-300 icon above the line (live-measured — the census
             had recorded "no icon"). */
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" aria-hidden="true" />
            <p className="text-slate-500">No logs found matching your filters</p>
          </div>
        ) : (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-foreground">{l.action}</TableCell>
                    <TableCell className="text-muted-foreground">{l.entity}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(l.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{l.userName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
