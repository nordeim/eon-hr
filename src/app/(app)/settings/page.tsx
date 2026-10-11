"use client";

import * as React from "react";
import { Building2, Clock, FileText, Loader2, MessageSquare, Palette, Pencil, Plug, Plus, SettingsIcon, Shield, Trash2, Users, Video, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
const COMPACT_KEY = "eon.settings.compact";
const DENSITY_KEY = "eon.settings.density";

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
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
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
          <WorkflowsTab />
        </TabsContent>
        <TabsContent value="shifts" className="mt-0">
          <ShiftsTab />
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
       md:grid-cols-2 gap-6` of read-only p-4 tiles (label
       text-sm slate-500 mb-1 + value font-medium). 631px card. */
    <Card>
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
              <div key={f.key} className="p-4">
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

function WorkflowsTab() {
  const [workflows, setWorkflows] = React.useState<WorkflowRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/approval-workflows");
        const json = await res.json();
        if (json.ok) setWorkflows(json.data.workflows);
      } catch {
        // non-critical tab
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflows</CardTitle>
        <CardDescription>Multi-level approval hierarchies for requests and expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : workflows.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-6 w-6" aria-hidden="true" />}
            title="No approval workflows configured"
            description="Set up a workflow in the Approval Workflow Engine."
          />
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
    </Card>
  );
}

// ---------------------------------------------------------------- Shifts

function ShiftsTab() {
  const [shifts, setShifts] = React.useState<ShiftRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/shifts");
        const json = await res.json();
        if (json.ok) setShifts(json.data.shifts);
      } catch {
        // non-critical tab
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shifts</CardTitle>
        <CardDescription>Shift templates used by the shift calendar.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : shifts.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-6 w-6" aria-hidden="true" />}
            title="No shifts defined"
            description="Create shifts to build the shift calendar."
          />
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
    </Card>
  );
}

// ------------------------------------------------------------ Departments

function DepartmentsTab({ canEdit, toast }: { canEdit: boolean; toast: ReturnType<typeof useToast> }) {
  const [departments, setDepartments] = React.useState<DepartmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", code: "" });

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
    if (!form.name.trim()) {
      toast.toast({ title: "Department name is required", variant: "info" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), code: form.code.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Add failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Department added", description: `${form.name.trim()} is ready.`, variant: "success" });
      setAddOpen(false);
      setForm({ name: "", code: "" });
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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="min-w-0">
          <CardTitle>Departments</CardTitle>
          <CardDescription>Organize employees into departments.</CardDescription>
        </div>
        {canEdit ? (
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2" aria-hidden="true" />
            Add Department
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
            title="No departments yet"
            description="Add your first department to organize employees."
          />
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Create a new department.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onAdd();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Sales"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dept-code">Code</Label>
              <Input
                id="dept-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="SLS"
                maxLength={20}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Add Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ------------------------------------------------------------ Integrations

function IntegrationsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const integrations = [
    { name: "Slack", description: "Post announcements to Slack channels", icon: <MessageSquare className="h-5 w-5" aria-hidden="true" /> },
    { name: "Google Workspace", description: "Sync calendar and drive", icon: <Plug className="h-5 w-5" aria-hidden="true" /> },
    { name: "Zoom", description: "Attach meetings to interviews", icon: <Video className="h-5 w-5" aria-hidden="true" /> },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {integrations.map((i) => (
        <Card key={i.name}>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              {i.icon}
            </div>
            <div>
              <p className="font-medium text-foreground">{i.name}</p>
              <p className="text-sm text-muted-foreground">{i.description}</p>
            </div>
            <Button
              className="w-full"
              onClick={() =>
                toast.toast({
                  title: `${i.name} integration coming soon`,
                  description: "You'll be able to connect your workspace in a future update.",
                  variant: "info",
                })
              }
            >
              Connect
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ Theme & Layout

function ThemeTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [compact, setCompact] = React.useState(false);
  const [density, setDensity] = React.useState("comfortable");

  React.useEffect(() => {
    setCompact(window.localStorage.getItem(COMPACT_KEY) === "true");
    const stored = window.localStorage.getItem(DENSITY_KEY);
    if (stored) setDensity(stored);
  }, []);

  function persistCompact(v: boolean) {
    setCompact(v);
    window.localStorage.setItem(COMPACT_KEY, String(v));
  }

  function persistDensity(v: string) {
    setDensity(v);
    window.localStorage.setItem(DENSITY_KEY, v);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme &amp; Layout</CardTitle>
        <CardDescription>Layout preferences are saved to this browser.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Compact Mode</p>
            <p className="text-xs text-muted-foreground">Reduce padding across tables and cards</p>
          </div>
          <Switch checked={compact} onCheckedChange={persistCompact} aria-label="Compact mode" />
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border p-4">
          <Label htmlFor="density">Density</Label>
          <Select value={density} onValueChange={persistDensity}>
            <SelectTrigger id="density" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Controls row height and spacing in lists and tables.
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            persistCompact(false);
            persistDensity("comfortable");
            toast.toast({ title: "Layout reset", variant: "info" });
          }}
        >
          Reset to defaults
        </Button>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------ System Logs

function LogsTab() {
  const [logs, setLogs] = React.useState<AuditLogRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [forbidden, setForbidden] = React.useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>Audit trail of recent system actions.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : forbidden ? (
          <EmptyState
            title="Access restricted"
            description="Only admin, HR or security roles can view system logs."
          />
        ) : logs.length === 0 ? (
          <EmptyState title="No system activity yet" description="Actions like company updates will appear here." />
        ) : (
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
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-foreground">{l.action}</TableCell>
                  <TableCell className="text-muted-foreground">{l.entity}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{l.userName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
