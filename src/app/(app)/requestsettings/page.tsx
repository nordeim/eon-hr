"use client";

import * as React from "react";
import { ArrowLeft, Loader2, Plus, Shield, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

/**
 * The /requestsettings page — parity round 33 (R33-C), rebuilt to the
 * live-measured REF structure (the round-31 body drifted):
 *
 * the slate→blue canvas; the `p-4 md:p-8 max-w-5xl mx-auto space-y-6`
 * container; the LEFT-aligned header (`flex items-center gap-3` — the
 * Back ghost h-8 + the title block: h1 `text-2xl font-bold
 * text-slate-900` y=32 + the 14px sub — NOT centered); the Approval
 * Workflow card: CardHeader (title + sub) + the 4-col row y=228
 * ([Input "Approver name"][Input "Approver email"][Select "Level 1
 * (First)"][Add dark — each 219px, gap-3]) + the 3 static rows —
 * `text-xs font-semibold text-slate-500 uppercase mb-1` "LEVEL N
 * APPROVERS" + `text-slate-400 text-sm pl-2` "None set"; the Request
 * Limits card: the 3-row grid (y=585 [Input "Limit name (e.g. Petty
 * Cash Monthly)"][Select "Finance"][Select "Monthly"]; y=633 [Input
 * "Sub-type (e.g. petty_cash)"][Input "Max requests (optional)"
 * number][Input "Max amount SAR (optional)" number]; y=681 [Select
 * "All Staff"][Add Limit dark]) + `text-slate-400 text-sm` "No limits
 * configured".
 *
 * Supersets: the Add flow persists ApprovalConfig rows via
 * /api/approval-config (name+email resolved against Employee —
 * REF-side zero-data); Add Limit keeps an in-memory limit list
 * (REF's button is inert; no schema model is forced for it).
 */
export default function RequestSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [configs, setConfigs] = React.useState<ConfigRow[]>([]);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [level, setLevel] = React.useState("1");
  const [adding, setAdding] = React.useState(false);
  const [limitName, setLimitName] = React.useState("");
  const [limitSubType, setLimitSubType] = React.useState("");
  const [limitMaxReq, setLimitMaxReq] = React.useState("");
  const [limitMaxAmt, setLimitMaxAmt] = React.useState("");
  const [limitCategory, setLimitCategory] = React.useState("finance");
  const [limitPeriod, setLimitPeriod] = React.useState("monthly");
  const [limitScope, setLimitScope] = React.useState("all_staff");
  const [limits, setLimits] = React.useState<{ name: string; subType: string; category: string; period: string; scope: string; maxRequests: string; maxAmount: string }[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approval-config");
      const json = await res.json();
      if (json.ok) setConfigs(json.data.configs);
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
    if (!name.trim() || !email.trim()) {
      toast.toast({ title: "Name and email are required", variant: "error" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/approval-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "general", level: Number(level), approverName: name, approverEmail: email }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Could not add approver", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({ title: "Approver added", variant: "success" });
      setName("");
      setEmail("");
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

  function onAddLimit() {
    if (!limitName.trim()) {
      toast.toast({ title: "Limit name is required", variant: "error" });
      return;
    }
    setLimits((ls) => [
      ...ls,
      { name: limitName, subType: limitSubType, category: limitCategory, period: limitPeriod, scope: limitScope, maxRequests: limitMaxReq, maxAmount: limitMaxAmt },
    ]);
    setLimitName("");
    setLimitSubType("");
    setLimitMaxReq("");
    setLimitMaxAmt("");
    toast.toast({ title: "Limit added", description: "Note: limits persist for this session (REF's button is inert).", variant: "success" });
  }

  const approversFor = (lvl: number) => configs.filter((c) => c.level === lvl);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* REF's header: Back + the title block, LEFT-aligned (gap-3) */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Request Settings</h1>
            <p className="text-sm text-slate-500">Configure approvers and request limits</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col space-y-1.5 border-b p-6">
            {/* REF (round 33): the heads carry icons — Shield blue-600 /
                Users purple-600, w-5 h-5 (the head renders h=20). */}
            <CardTitle className="flex items-center gap-2 font-semibold leading-none tracking-tight">
              <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
              Approval Workflow
            </CardTitle>
            <p className="text-sm text-slate-500">Set up to 3 approval levels per request category</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Session 50 (R49-B7): REF's interior — p-6 space-y-4
                (live-measured); the card itself is the PLAIN Card. */}
            {/* REF's 4-col row (round 33): name + email + level + Add;
                mb-4 spaces the level rows (REF: 16 then 12s). */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <Input placeholder="Approver name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Approver name" />
              <Input type="text" placeholder="Approver email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Approver email" />
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full" aria-label="Approval level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 (First)</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3 (Final)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="dark" onClick={() => void onAdd()} disabled={adding}>
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="mr-1" aria-hidden="true" />}
                Add
              </Button>
            </div>

            <div className="space-y-2">
            {[1, 2, 3].map((lvl) => {
              const rows = approversFor(lvl);
              return (
                <div key={lvl}>
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Level {lvl} Approvers</p>
                  {rows.length === 0 ? (
                    <p className="pl-2 text-sm text-slate-400">None set</p>
                  ) : (
                    <ul className="space-y-1 pl-2">
                      {rows.map((c) => (
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
              );
            })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col space-y-1.5 border-b p-6">
            <CardTitle className="flex items-center gap-2 font-semibold leading-none tracking-tight">
              <Users className="w-5 h-5 text-purple-600" aria-hidden="true" />
              Request Limits
            </CardTitle>
            <p className="text-sm text-slate-500">
              Set max request counts or financial limits per period (petty cash, fuel, etc.)
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* REF's 3-row limits grid */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Input placeholder="Limit name (e.g. Petty Cash Monthly)" value={limitName} onChange={(e) => setLimitName(e.target.value)} aria-label="Limit name" />
              <Select value={limitCategory} onValueChange={setLimitCategory}>
                <SelectTrigger className="w-full" aria-label="Limit category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={limitPeriod} onValueChange={setLimitPeriod}>
                <SelectTrigger className="w-full" aria-label="Limit period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Sub-type (e.g. petty_cash)" value={limitSubType} onChange={(e) => setLimitSubType(e.target.value)} aria-label="Limit sub-type" />
              <Input type="number" placeholder="Max requests (optional)" value={limitMaxReq} onChange={(e) => setLimitMaxReq(e.target.value)} aria-label="Max requests" />
              <Input type="number" placeholder="Max amount SAR (optional)" value={limitMaxAmt} onChange={(e) => setLimitMaxAmt(e.target.value)} aria-label="Max amount" />
              <Select value={limitScope} onValueChange={setLimitScope}>
                <SelectTrigger className="w-full" aria-label="Limit scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_staff">All Staff</SelectItem>
                  <SelectItem value="per_department">Per Department</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="dark" onClick={onAddLimit}>
                <Plus className="mr-1" aria-hidden="true" />
                Add Limit
              </Button>
            </div>

            {limits.length === 0 ? (
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">No limits configured</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {limits.map((l, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    {l.name}
                    {l.subType ? ` · ${l.subType}` : ""} · {l.category} · {l.period} · {l.scope === "all_staff" ? "All Staff" : "Per Department"}
                    {l.maxRequests ? ` · max ${l.maxRequests} requests` : ""}
                    {l.maxAmount ? ` · max ${l.maxAmount} SAR` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : null}
    </div>
  );
}
