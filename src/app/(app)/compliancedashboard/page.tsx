"use client";

import * as React from "react";
import { ScanSearch, Bell, ShieldAlert, AlertTriangle, CheckCircle2, Activity, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";

interface RiskDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  expiryDate: string | null;
  daysLeft: number;
  risk: string;
  severity: string;
  employeeId: string;
  employeeName: string;
}

interface ComplianceStats {
  critical: number;
  high: number;
  resolved: number;
  active: number;
}

interface ComplianceData {
  alerts: { id: string; severity: string; title: string; message: string; status: string; employeeName: string | null }[];
  documents: RiskDoc[];
  stats: ComplianceStats;
}

const FILTERS = [
  { key: "all", label: "All Alerts" },
  { key: "expired", label: "Expired" },
  { key: "d7", label: "Expiring ≤ 7 days" },
  { key: "d15", label: "Expiring ≤ 15 days" },
  { key: "d30", label: "Expiring ≤ 30 days" },
] as const;

const TYPE_OPTIONS = ["all", "contract", "id", "passport", "visa", "certificate", "medical", "other"];

function labelize(v: string): string {
  return v === "all" ? "All Types" : v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function daysText(days: number): string {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `${days}d left`;
}

function inFilter(doc: RiskDoc, key: string): boolean {
  switch (key) {
    case "expired":
      return doc.daysLeft < 0;
    case "d7":
      return doc.daysLeft >= 0 && doc.daysLeft <= 7;
    case "d15":
      return doc.daysLeft >= 0 && doc.daysLeft <= 15;
    case "d30":
      return doc.daysLeft >= 0 && doc.daysLeft <= 30;
    default:
      return true;
  }
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ComplianceDashboardPage() {
  const toast = useToast();
  const [data, setData] = React.useState<ComplianceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [notifying, setNotifying] = React.useState<number | null>(null);
  const [filter, setFilter] = React.useState<string>("all");
  const [type, setType] = React.useState("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else toast.toast({ title: "Failed to load compliance data", description: json.error?.message, variant: "error" });
    } catch {
      toast.toast({ title: "Network error", description: "Could not reach the compliance service.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function runScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Scan failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: "Compliance scan complete",
        description: `${json.data.scanned} document(s) scanned — ${json.data.created} new, ${json.data.updated} updated, ${json.data.resolved} resolved alerts.`,
        variant: "success",
      });
      await load();
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setScanning(false);
    }
  }

  async function notifyWindow(windowDays: 7 | 15 | 30) {
    setNotifying(windowDays);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notify", windowDays }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.toast({ title: "Notify failed", description: json.error?.message, variant: "error" });
        return;
      }
      toast.toast({
        title: json.data.notified > 0 ? "Reminder emails queued" : "Nothing to send",
        description:
          json.data.notified > 0
            ? `${json.data.notified} employee(s) with documents expiring within ${windowDays} days will be notified.`
            : `No documents expiring within ${windowDays} days.`,
        variant: json.data.notified > 0 ? "success" : "info",
      });
    } catch {
      toast.toast({ title: "Network error", variant: "error" });
    } finally {
      setNotifying(null);
    }
  }

  const documents = data?.documents ?? [];
  const stats = data?.stats ?? { critical: 0, high: 0, resolved: 0, active: 0 };

  const filtered = React.useMemo(
    () => documents.filter((d) => (type === "all" || d.type === type) && inFilter(d, filter)),
    [documents, filter, type]
  );

  const chipCounts = React.useMemo(() => {
    const byType = documents.filter((d) => type === "all" || d.type === type);
    const counts: Record<string, number> = {};
    for (const f of FILTERS) counts[f.key] = byType.filter((d) => inFilter(d, f.key)).length;
    return counts;
  }, [documents, type]);

  const atRiskEmployees = React.useMemo(() => {
    const map = new Map<string, { name: string; employeeId: string; docs: RiskDoc[] }>();
    for (const doc of filtered) {
      const entry = map.get(doc.employeeName) ?? {
        name: doc.employeeName,
        employeeId: doc.employeeId,
        docs: [],
      };
      entry.docs.push(doc);
      map.set(doc.employeeName, entry);
    }
    return [...map.values()].sort(
      (a, b) =>
        Math.min(...a.docs.map((d) => SEVERITY_RANK[d.severity] ?? 9)) -
        Math.min(...b.docs.map((d) => SEVERITY_RANK[d.severity] ?? 9))
    );
  }, [filtered]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="Compliance Monitor"
        title="Compliance Dashboard"
        subtitle="Proactive document expiry tracking & automated notifications"
        actions={
          <Button onClick={runScan} disabled={scanning || loading}>
            {scanning ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ScanSearch aria-hidden="true" />}
            Run Compliance Scan
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Critical Alerts" value={stats.critical} icon={<ShieldAlert className="h-4 w-4" />} iconClassName="bg-red-100 text-red-600" />
        <StatCard label="High Priority" value={stats.high} icon={<AlertTriangle className="h-4 w-4" />} iconClassName="bg-amber-100 text-amber-600" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="h-4 w-4" />} iconClassName="bg-emerald-100 text-emerald-600" />
        <StatCard label="Active Alerts" value={stats.active} icon={<Activity className="h-4 w-4" />} iconClassName="bg-blue-100 text-blue-600" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Document Expiry Monitor</CardTitle>
              <CardDescription>Track documents approaching expiry and notify their owners.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                  <Button
                    key={f.key}
                    size="sm"
                    variant={filter === f.key ? "default" : "outline"}
                    onClick={() => setFilter(f.key)}
                    aria-pressed={filter === f.key}
                  >
                    {f.label} ({chipCounts[f.key] ?? 0})
                  </Button>
                ))}
                <div className="flex flex-1 justify-end">
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full sm:w-40" aria-label="Filter by document type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {labelize(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Notify:</span>
                {([7, 15, 30] as const).map((w) => (
                  <Button
                    key={w}
                    size="sm"
                    variant="outline"
                    onClick={() => notifyWindow(w)}
                    disabled={notifying !== null}
                  >
                    {notifying === w ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Bell aria-hidden="true" />}
                    Notify All ≤ {w} days
                  </Button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {filtered.length} at-risk document{filtered.length === 1 ? "" : "s"}
              </p>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={<FileWarning className="h-6 w-6" />}
                  title="No documents at risk in this filter"
                  description="All tracked documents are valid beyond the selected window."
                />
              ) : (
                <div className="divide-y">
                  {filtered.map((doc) => (
                    <div key={doc.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <FileWarning className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {doc.employeeName} · {labelize(doc.type)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:shrink-0">
                        <div className="text-right">
                          <p className="text-sm text-foreground">{formatDate(doc.expiryDate)}</p>
                          <p
                            className={
                              doc.daysLeft < 0
                                ? "text-xs font-medium text-red-600"
                                : doc.daysLeft <= 7
                                  ? "text-xs font-medium text-amber-600"
                                  : "text-xs text-muted-foreground"
                            }
                          >
                            {daysText(doc.daysLeft)}
                          </p>
                        </div>
                        <StatusBadge status={doc.severity} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>At-Risk Employees</CardTitle>
              <CardDescription>Employees with documents requiring renewal action.</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskEmployees.length === 0 ? (
                <EmptyState
                  title="No documents at risk in this filter"
                  description="Employees appear here when one of their documents expires soon."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {atRiskEmployees.map((emp) => {
                    const worst =
                      emp.docs.slice().sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9))[0]
                        ?.severity ?? "low";
                    return (
                      <div
                        key={emp.employeeId + emp.name}
                        className="flex flex-col gap-3 rounded-lg border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials(emp.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {emp.docs.length} at-risk document{emp.docs.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {emp.docs.map((doc) => (
                            <span
                              key={doc.id}
                              className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {doc.name} · {daysText(doc.daysLeft)}
                            </span>
                          ))}
                          <StatusBadge status={worst} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
