"use client";

import * as React from "react";
import { CalendarRange, Download, FileText, Printer } from "lucide-react";
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
  reports: ReportDef[];
}

const CATEGORIES: Category[] = [
  {
    id: "employee-master",
    label: "Employee Master",
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
    reports: [
      { title: "Daily Attendance Report", description: "Present, absent and late records per day", type: "attendance" },
      { title: "Late Arrivals Report", description: "Late check-ins with minutes late", type: "late-arrivals" },
      { title: "Overtime Summary", description: "Overtime minutes per employee", type: "overtime" },
    ],
  },
  {
    id: "leave-absence",
    label: "Leave & Absence",
    reports: [
      { title: "Leave Requests Report", description: "All leave requests with status and days", type: "leave" },
      { title: "Leave Balances Report", description: "Entitled vs used days per leave type", type: "leave-balances" },
      { title: "Absence Summary", description: "Absent day records across the workforce", type: "absence" },
    ],
  },
  {
    id: "payroll-compensation",
    label: "Payroll & Compensation",
    reports: [
      { title: "Payroll Register", description: "Full payroll breakdown per period", type: "payroll" },
      { title: "Salary Disbursement Report", description: "Paid payslips only", type: "payroll-disbursement" },
      { title: "Deductions & Bonuses Report", description: "Bonus and deduction adjustments", type: "payroll-adjustments" },
    ],
  },
  {
    id: "performance-appraisal",
    label: "Performance & Appraisal",
    reports: [
      { title: "Goals & KPI Report", description: "Goal progress and status per employee", type: "performance-goals" },
      { title: "Performance Reviews Report", description: "Review ratings and completion", type: "performance-reviews" },
      { title: "Appraisal Cycles Report", description: "Cycle overview with review counts", type: "performance-cycles" },
    ],
  },
  {
    id: "training-development",
    label: "Training & Development",
    reports: [
      { title: "Training Platforms Report", description: "Connected learning platforms", type: "training" },
      { title: "Course Catalog Report", description: "Available courses per platform", type: "training-courses" },
    ],
  },
  {
    id: "employee-relations",
    label: "Employee Relations",
    reports: [
      { title: "Staff Requests Report", description: "Requests across categories and priorities", type: "employee-relations" },
      { title: "Survey Responses Report", description: "Engagement survey responses with sentiment", type: "survey-responses" },
      { title: "Communication Log", description: "Email, SMS and WhatsApp history", type: "communications" },
    ],
  },
  {
    id: "contracts-compliance",
    label: "Contracts & Compliance",
    reports: [
      { title: "Document Register", description: "All tracked employee documents", type: "contracts" },
      { title: "Document Expiry Report", description: "Documents sorted by expiry date", type: "document-expiry" },
      { title: "Compliance Alerts Report", description: "Alert severity and resolution status", type: "compliance-alerts" },
    ],
  },
  {
    id: "exit-separation",
    label: "Exit & Separation",
    reports: [
      { title: "Offboarding Report", description: "Departures with reasons and status", type: "exit" },
      { title: "Exit Checklists Report", description: "Checklist completion status per departure", type: "exit-checklists" },
    ],
  },
  {
    id: "organizational",
    label: "Organizational",
    reports: [
      { title: "Headcount by Department", description: "Employees and active counts per department", type: "organizational" },
      { title: "Reporting Structure Report", description: "Manager and direct-report mapping", type: "org-structure" },
    ],
  },
  {
    id: "analytics-decision",
    label: "Analytics & Decision",
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

  async function exportCsv(report: ReportDef) {
    const qs = new URLSearchParams({ type: report.type });
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (department !== "all") qs.set("department", department);
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        section="HR Reports & Analytics"
        title="Reports"
        subtitle="Generate comprehensive HR reports across all modules"
      />

      <Tabs defaultValue="employee-master" className="flex flex-col gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => (
          <TabsContent key={c.id} value={c.id} className="mt-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {c.reports.map((r) => (
                <Card key={r.type} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 text-base">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                      {r.title}
                    </CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportCsv(r)}>
                      <Download aria-hidden="true" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Printer aria-hidden="true" />
                      PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Report Filters
          </CardTitle>
          <CardDescription>Applied to CSV exports where the report supports them</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rf-from">Date From</Label>
              <Input id="rf-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rf-to">Date To</Label>
              <Input id="rf-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rf-department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="rf-department" className="w-full">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
