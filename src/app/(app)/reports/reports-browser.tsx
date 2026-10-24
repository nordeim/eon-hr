"use client";

import * as React from "react";
import { BarChart3, Building2, Clock, DollarSign, Download, FileCheck, FileText, GraduationCap, LogOut, Plane, Shield, TrendingUp, Users } from "lucide-react";
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
import { RefFilterGlyph } from "@/components/shared/ref-filter-glyph";
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
  /** Session 11 (R10-L) + Session 88 (R88-D1/D2): every reference chip
   *  carries a 16px icon (gap-2) — the per-category lucide set, stored
   *  as the COMPONENT so each site renders its own size: the tab at
   *  h-4 w-4 (16px, live-measured), the card title at w-5 h-5 (20px,
   *  currentColor — the R88-D1 bare-icon recipe, no blue wrapper).
   *  R88-D2: Leave & Absence = Plane, Payroll & Compensation =
   *  DollarSign (the old CalendarDays/Banknote were inventions). */
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  reports: ReportDef[];
}

const CATEGORIES: Category[] = [
  {
    id: "employee-master",
    label: "Employee Master",
    icon: Users,
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
    icon: Clock,
    reports: [
      { title: "Daily Attendance Report", description: "Present, absent and late records per day", type: "attendance" },
      { title: "Late Arrivals Report", description: "Late check-ins with minutes late", type: "late-arrivals" },
      { title: "Overtime Summary", description: "Overtime minutes per employee", type: "overtime" },
    ],
  },
  {
    id: "leave-absence",
    label: "Leave & Absence",
    icon: Plane,
    reports: [
      { title: "Leave Requests Report", description: "All leave requests with status and days", type: "leave" },
      { title: "Leave Balances Report", description: "Entitled vs used days per leave type", type: "leave-balances" },
      { title: "Absence Summary", description: "Absent day records across the workforce", type: "absence" },
    ],
  },
  {
    id: "payroll-compensation",
    label: "Payroll & Compensation",
    icon: DollarSign,
    reports: [
      { title: "Payroll Register", description: "Full payroll breakdown per period", type: "payroll" },
      { title: "Salary Disbursement Report", description: "Paid payslips only", type: "payroll-disbursement" },
      { title: "Deductions & Bonuses Report", description: "Bonus and deduction adjustments", type: "payroll-adjustments" },
    ],
  },
  {
    id: "performance-appraisal",
    label: "Performance & Appraisal",
    icon: TrendingUp,
    reports: [
      { title: "Goals & KPI Report", description: "Goal progress and status per employee", type: "performance-goals" },
      { title: "Performance Reviews Report", description: "Review ratings and completion", type: "performance-reviews" },
      { title: "Appraisal Cycles Report", description: "Cycle overview with review counts", type: "performance-cycles" },
    ],
  },
  {
    id: "training-development",
    label: "Training & Development",
    icon: GraduationCap,
    reports: [
      { title: "Training Platforms Report", description: "Connected learning platforms", type: "training" },
      { title: "Course Catalog Report", description: "Available courses per platform", type: "training-courses" },
    ],
  },
  {
    id: "employee-relations",
    label: "Employee Relations",
    icon: Shield,
    reports: [
      { title: "Staff Requests Report", description: "Requests across categories and priorities", type: "employee-relations" },
      { title: "Survey Responses Report", description: "Engagement survey responses with sentiment", type: "survey-responses" },
      { title: "Communication Log", description: "Email, SMS and WhatsApp history", type: "communications" },
    ],
  },
  {
    id: "contracts-compliance",
    label: "Contracts & Compliance",
    icon: FileCheck,
    reports: [
      { title: "Document Register", description: "All tracked employee documents", type: "contracts" },
      { title: "Document Expiry Report", description: "Documents sorted by expiry date", type: "document-expiry" },
      { title: "Compliance Alerts Report", description: "Alert severity and resolution status", type: "compliance-alerts" },
    ],
  },
  {
    id: "exit-separation",
    label: "Exit & Separation",
    icon: LogOut,
    reports: [
      { title: "Offboarding Report", description: "Departures with reasons and status", type: "exit" },
      { title: "Exit Checklists Report", description: "Checklist completion status per departure", type: "exit-checklists" },
    ],
  },
  {
    id: "organizational",
    label: "Organizational",
    icon: Building2,
    reports: [
      { title: "Headcount by Department", description: "Employees and active counts per department", type: "organizational" },
      { title: "Reporting Structure Report", description: "Manager and direct-report mapping", type: "org-structure" },
    ],
  },
  {
    id: "analytics-decision",
    label: "Analytics & Decision",
    icon: BarChart3,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        /* Session 49 (R48-A2): the bare family — REF renders the hero
         *  block as a DIRECT child of the content wrapper (no hero row).
         *  Live-measured @1440×900 this round. */
        bare
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
        <TabsList className="h-auto w-full flex-wrap justify-center border border-slate-200 bg-white text-neutral-500">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="gap-2">
              <c.icon className="h-4 w-4" aria-hidden="true" />
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
            {/* Session 87 (R87-I residual): the OUTER section card also
                carries the REF's border-slate-200 (the page hardcodes it
                at both levels — live-read, computed border
                rgb(226,232,240)). */}
            <Card className="border-slate-200">
              {/* Session 88 (R88-D5): the REF's card header carries the
                  gradient band (bg-gradient-to-r from-blue-50 to
                  indigo-50 — live-measured computed rgb(239,246,255) at
                  the left edge). The TW-v4 trap-3 rule: parity-critical
                  gradients pin the sRGB interpolation via the
                  arbitrary-value form (v4's bg-gradient-to-* interpolates
                  in oklab and drifts the blend). */}
              <CardHeader className="flex flex-col space-y-1.5 border-b border-slate-200 bg-[linear-gradient(to_right,#eff6ff,#eef2ff)]">
                <div className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                  {/* Session 88 (R88-D1): the REF's bare title icon — a DIRECT svg child of the title div at w-5 h-5 (20px), currentColor (the title's own ink; the old blue 16px wrapper span was a clone invention). */}
                  <c.icon className="w-5 h-5" aria-hidden="true" />
                  {c.label} Reports
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {c.reports.map((r) => (
                    /* Session 87 (R87-I): the card family re-measured by
                       the full-registry cross-side pixel-diff — the
                       REF's set verbatim: `rounded-xl border bg-card
                       text-card-foreground shadow border-slate-200`
                       (computed border rgb(226,232,240) vs the default
                       token's rgb(229,229,229); + shadow). */
                    <div key={r.type} className="rounded-xl border bg-card text-card-foreground shadow border-slate-200 p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">{r.title}</h3>
                      <div className="flex gap-2">
                        {/* Session 88 (R88-D4): the REF renders Download on BOTH export buttons (`lucide-download w-3 h-3 mr-2` — the w-3 h-3 classes are DEAD, the button's [&_svg]:size-4 wins and the icon renders 16px, computed-verified; the class list mirrors the REF's DOM). The old Printer on the PDF was an invention. */}
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => exportCsv(r)}>
                          <Download className="w-3 h-3 mr-2" aria-hidden="true" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                          <Download className="w-3 h-3 mr-2" aria-hidden="true" />
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
            {/* Session 88 (R88-D3): the REF's Report Filters title glyph — the CLASSIC-triangle Filter (the r87 lucide-version escalation, the vendored RefFilterGlyph — lucide 0.525's Funnel has different geometry), w-5 h-5 currentColor. */}
            <RefFilterGlyph className="w-5 h-5" />
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
