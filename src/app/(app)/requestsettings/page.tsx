"use client";

import * as React from "react";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConfigRow {
  id: string;
  category: string;
  level: number;
  approverId: string;
  approverName: string;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "it", label: "IT" },
  { value: "hr", label: "HR" },
  { value: "facilities", label: "Facilities" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
];

/**
 * The /requestsettings orphan route — parity round 31 (R31-C8).
 *
 * REF serves this page (registry: RequestSettings): the slate→blue
 * canvas; the CENTERED 24px header (x=465 y=32) + Back ghost button +
 * the 14px sub; TWO 960px cards — "Approval Workflow / Set up to 3
 * approval levels per request category" (per-level select 219px + Add
 * dark button 219px + "Level N Approvers" 12px slate-500 labels +
 * "None set" 14px slate-400 lines) and "Request Limits / Set max
 * request counts or financial limits per period (petty cash, fuel,
 * etc.)" with the Finance/Monthly/All selects.
 * Superset: the Add flow persists ApprovalConfig rows via
 * /api/approval-config (REF-side zero-data).
 */
export default function RequestSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [configs, setConfigs] = React.useState<ConfigRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [category, setCategory] = React.useState("general");
  const [level, setLevel] = React.useState("1");
  const [approver, setApprover] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, empRes] = await Promise.all([fetch("/api/approval-config"), fetch("/api/employees")]);
      const cfgJson = await cfgRes.json();
      const empJson = await empRes.json();
      if (cfgJson.ok) setConfigs(cfgJson.data.configs);
      if (empJson.ok) setEmployees(empJson.data.employees);
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
    if (!approver) {
      toast.toast({ title: "Pick an approver first", variant: "error" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/approval-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, level: Number(level), approverId: approver }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not add approver", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Approver added", variant: "success" });
      setApprover("");
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setAdding(false);
    }
  }

  async function onRemove(id: string) {
    try {
      const res = await fetch(`/api/approval-config?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not remove", description: json.error?.message, variant: "error" });
        return;
      }
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    }
  }

  const approversFor = (lvl: number) => configs.filter((c) => c.category === category && c.level === lvl);

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full p-4 md:p-8">
        <div className="mx-auto max-w-[960px] space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="px-2 text-xs text-slate-500" onClick={() => history.back()}>
              <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Request Settings</h1>
              <p className="text-sm text-slate-500">Configure approvers and request limits</p>
            </div>
            <div className="w-[85px]" aria-hidden="true" />
          </div>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-col space-y-1.5 border-b p-6">
              <p className="font-semibold leading-none tracking-tight">Approval Workflow</p>
              <p className="text-sm text-muted-foreground">Set up to 3 approval levels per request category</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {[1, 2, 3].map((lvl) => (
                <div key={lvl} className="space-y-2">
                  <Label>Level {lvl} {lvl === 1 ? "(First)" : lvl === 3 ? "(Final)" : ""}</Label>
                  {lvl === Number(level) ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Select value={approver} onValueChange={setApprover}>
                        <SelectTrigger className="w-[219px]">
                          <SelectValue placeholder="Select approver" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.firstName} {e.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={() => void onAdd()} disabled={adding}>
                        {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="mr-2" aria-hidden="true" />}
                        Add
                      </Button>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-slate-500">Level {lvl} Approvers</p>
                    {approversFor(lvl).length === 0 ? (
                      <p className="text-sm text-slate-400">None set</p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {approversFor(lvl).map((c) => (
                          <li key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                            {c.approverName}
                            <button
                              type="button"
                              onClick={() => void onRemove(c.id)}
                              className="text-slate-400 hover:text-red-500"
                              aria-label={`Remove ${c.approverName}`}
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-col space-y-1.5 border-b p-6">
              <p className="font-semibold leading-none tracking-tight">Request Limits</p>
              <p className="text-sm text-muted-foreground">
                Set max request counts or financial limits per period (petty cash, fuel, etc.)
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue="finance">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="department">Per Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
