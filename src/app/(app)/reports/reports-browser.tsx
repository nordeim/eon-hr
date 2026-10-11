"use client";

import * as React from "react";
import { Banknote, BarChart3, Building2, CalendarDays, CalendarRange, Clock, Download, FileText, GraduationCap, HeartHandshake, LogOut, Printer, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ui/toast";

export interface DepartmentOption {
  id: string;
  name: string;
}

interface ReportDef {
  title: string;
  description: string;
  type: string;
}

interface Category {
  id: string;
  label: string;
  /** Session 11 (R10-L): every reference chip carries a 16px icon
   *  (gap-2) — the per-category lucide set. */
  icon: React.ReactNode;
  reports: ReportDef[];
}

const CATEGORIES: Category[] = [
  {
    id: "employee-master",
    label: "Employee Master",
    icon: <Users className="h-4 w-4" aria-hidden="true" />,
    reports: [
      {
        title: "Employee List (Active/Inactive/Terminated)",
        description: "Complete employee directory with employment status",
        type: "employee-list",
      },
      {
        title: "Employee Personal Information Report",
        description: "Contact details, national ID, date of birth and addresses",
        type: "employee-personal",
      },
      {
        title: "Employee ID & Documents Report",
        description: "Document inventory and status per employee",
        type: "employee-documents",
      },
      {
        title: "Employee Demographics Report",
        description: "Nationality, gender and age breakdown",
        type: "employee-demographics",
      },
      {
        title: "Saudization / Nitaqat Compliance Report",
        description: "Saudi vs non-Saudi workforce ratios",
        type: "saudization",
      },
      {
        title: "Probation Status Report",
        description: "Employees within their probation period",
        type: "probation",
      },
    ],
  },
  {
    id: "attendance-time",
    label: "Attendance & Time",
    icon: <Clock className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Daily Attendance Report", description: "Present, absent and late records per day", type: "attendance" },
      { title: "Late Arrivals Report", description: "Late check-ins with minutes late", type: "late-arrivals" },
      { title: "Overtime Summary", description: "Overtime minutes per employee", type: "overtime" },
    ],
  },
  {
    id: "leave-absence",
    label: "Leave & Absence",
    icon: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Leave Requests Report", description: "All leave requests with status and days", type: "leave" },
      { title: "Leave Balances Report", description: "Entitled vs used days per leave type", type: "leave-balances" },
      { title: "Absence Summary", description: "Absent day records across the workforce", type: "absence" },
    ],
  },
  {
    id: "payroll-compensation",
    label: "Payroll & Compensation",
    icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Payroll Register", description: "Full payroll breakdown per period", type: "payroll" },
      { title: "Salary Disbursement Report", description: "Paid payslips only", type: "payroll-disbursement" },
      { title: "Deductions & Bonuses Report", description: "Bonus and deduction adjustments", type: "payroll-adjustments" },
    ],
  },
  {
    id: "performance-appraisal",
    label: "Performance & Appraisal",
    icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Goals & KPI Report", description: "Goal progress and status per employee", type: "performance-goals" },
      { title: "Performance Reviews Report", description: "Review ratings and completion", type: "performance-reviews" },
      { title: "Appraisal Cycles Report", description: "Cycle overview with review counts", type: "performance-cycles" },
    ],
  },
  {
    id: "training-development",
    label: "Training & Development",
    icon: <GraduationCap className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Training Platforms Report", description: "Connected learning platforms", type: "training" },
      { title: "Course Catalog Report", description: "Available courses per platform", type: "training-courses" },
    ],
  },
  {
    id: "employee-relations",
    label: "Employee Relations",
    icon: <HeartHandshake className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Staff Requests Report", description: "Requests across categories and priorities", type: "employee-relations" },
      { title: "Survey Responses Report", description: "Engagement survey responses with sentiment", type: "survey-responses" },
      { title: "Communication Log", description: "Email, SMS and WhatsApp history", type: "communications" },
    ],
  },
  {
    id: "contracts-compliance",
    label: "Contracts & Compliance",
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Document Register", description: "All tracked employee documents", type: "contracts" },
      { title: "Document Expiry Report", description: "Documents sorted by expiry date", type: "document-expiry" },
      { title: "Compliance Alerts Report", description: "Alert severity and resolution status", type: "compliance-alerts" },
    ],
  },
  {
    id: "exit-separation",
    label: "Exit & Separation",
    icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Offboarding Report", description: "Departures with reasons and status", type: "exit" },
      { title: "Exit Checklists Report", description: "Checklist completion status per departure", type: "exit-checklists" },
    ],
  },
  {
    id: "organizational",
    label: "Organizational",
    icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Headcount by Department", description: "Employees and active counts per department", type: "organizational" },
      { title: "Reporting Structure Report", description: "Manager and direct-report mapping", type: "org-structure" },
    ],
  },
  {
    id: "analytics-decision",
    label: "Analytics & Decision",
    icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
    reports: [
      { title: "Workforce Analytics Summary", description: "Key HR metrics in one table", type: "analytics" },
      { title: "Turnover Analysis", description: "Terminated employees and turnover rate", type: "turnover" },
    ],
  },
];

export function ReportsBrowser({ departments }: { departments: DepartmentOption[] }) {
  const toast = useToast();
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [department, setDepartment] = React.useState("all");
  const [status, setStatus] = React.useState("all");

const STATUS_OPTIONS = ["all", "active", "inactive", "terminated"];

  async function exportCsv(report: ReportDef) {
    const qs = new URLSearchParams({ type: report.type });
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (department !== "all") qs.set("department", department);
    if (status !== "all") qs.set("status", status);
    try {
      const res = await fetch(`/api/reports/export?${qs}`);
      if (!res.ok) {
        let message = "Export failed";
        try {
          const json = await res.json();
          if (!json.ok) message = json.error?.message ?? message;
        } catch {
          // non-JSON error body — keep default message
        }
        toast.toast({ title: "Export failed", description: message, variant: "error" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.toast({
        title: "Report exported",
        description: `${report.title} downloaded as CSV.`,
        variant: "success",
      });
    } catch {
      toast.toast({ title: "Network error", description: "Could not reach the export API.", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right_bottom,#f8fafc,#eff6ff)] p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        section="HR Reports & Analytics"
        layout="flat36"
        iconClassName="text-blue-600"
        sectionIcon={<FileText aria-hidden="true" />}
        title="Reports"
        subtitle="Generate comprehensive HR reports across all modules"
      />

      <Tabs defaultValue="employee-master" className="flex flex-col gap-6">
        {/* Session 11 (R10-L): the reference's category selector — a WHITE
            bordered wrapping pill (`bg-white border border-slate-200
            flex-wrap h-auto`), rows centered with NO row gap (28px pitch),
            each chip carrying a 16px icon with gap-2 (measured chips
            170-222px wide vs our icon-less 126-198). */}
        <TabsList className="h-auto w-full flex-wrap justify-center border border-slate-200 bg-white text-muted-foreground">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="gap-2">
              {c.icon}
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Session 14 (R13-F): the reference's active tab — ONE card per
            category: a border-b CardHeader with a 20px-iconed
            `font-semibold leading-none tracking-tight` title, then p-6
            content wrapping `grid md:grid-cols-2 lg:grid-cols-3` of
            346x126 tiles (p-4: two-line H3 mb-3 + flex gap-2 of two
            equal-width iconed 152px buttons). */}
        {CATEGORIES.map((c) => (
          <TabsContent key={c.id} value={c.id} className="mt-0">
            <Card>
              <CardHeader className="flex flex-col space-y-1.5 border-b border-slate-200">
                <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                  <span className="flex h-5 w-5 items-center justify-center text-blue-600">{c.icon}</span>
                  {c.label} Reports
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {c.reports.map((r) => (
                    <div key={r.type} className="rounded-xl border bg-card p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">{r.title}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => exportCsv(r)}>
                          <Download className="mr-2" aria-hidden="true" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                          <Printer className="mr-2" aria-hidden="true" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Session 14 (R13-F): the reference's Report Filters card —
          title-only header + `grid md:grid-cols-4` of Date From / Date To /
          Department / Status. */}
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 border-b border-slate-200">
          <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
            <CalendarRange className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Report Filters
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="rf-from">Date From</Label>
              <Input className="mt-2" id="rf-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rf-to">Date To</Label>
              <Input className="mt-2" id="rf-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rf-department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="rf-department" className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rf-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="rf-status" className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st === "all" ? "All Status" : st.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
