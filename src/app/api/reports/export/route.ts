import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { err, requireUser } from "@/lib/api";

// GET /api/reports/export?type=<report-type>&from=YYYY-MM-DD&to=YYYY-MM-DD&department=<id>
// Generic CSV exporter covering the report catalogue on /reports.
// Returns text/csv on success; JSON error envelope otherwise.

type Cell = string | number | null;
interface ReportResult {
  headers: string[];
  rows: Cell[][];
}
interface Filters {
  from: Date | null;
  to: Date | null;
  departmentId: string | null;
}
type Builder = (f: Filters) => Promise<ReportResult>;

function csvEscape(v: Cell): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(result: ReportResult): string {
  const lines = [result.headers, ...result.rows].map((row) => row.map(csvEscape).join(","));
  return `${lines.join("\n")}\n`;
}

function sar(minor: number): string {
  return (minor / 100).toFixed(2);
}

function isoDate(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

function isoDateTime(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 16).replace("T", " ") : "";
}

function fullName(e: { firstName: string; lastName: string }): string {
  return `${e.firstName} ${e.lastName}`.trim();
}

function parseDate(value: string | null, endOfDay = false): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(endOfDay ? `${value}T23:59:59.999` : `${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const PROBATION_DAYS = 90;

// ---------------------------------------------------------------------------
// Report builders
// ---------------------------------------------------------------------------

const employeeList: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
      ],
    },
    include: { department: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return {
    headers: ["Employee ID", "Full Name", "Email", "Job Title", "Department", "Employment Status", "Employment Type", "Start Date", "End Date"],
    rows: employees.map((e) => [
      e.employeeId,
      fullName(e),
      e.email,
      e.jobTitle,
      e.department?.name ?? "",
      e.employmentStatus,
      e.employmentType,
      isoDate(e.startDate),
      isoDate(e.endDate),
    ]),
  };
};

const employeePersonal: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
      ],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return {
    headers: ["Employee ID", "Full Name", "Email", "Phone", "Nationality", "National ID", "Date of Birth", "Gender", "Address"],
    rows: employees.map((e) => [
      e.employeeId,
      fullName(e),
      e.email,
      e.phone,
      e.nationality,
      e.nationalId,
      isoDate(e.dateOfBirth),
      e.gender,
      e.address,
    ]),
  };
};

const employeeDocuments: Builder = async (f) => {
  const documents = await db.document.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
      ],
    },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Employee ID", "Employee Name", "Document Name", "Type", "Status", "Issue Date", "Expiry Date"],
    rows: documents.map((d) => [
      d.employee.employeeId,
      fullName(d.employee),
      d.name,
      d.type,
      d.status,
      isoDate(d.issueDate),
      isoDate(d.expiryDate),
    ]),
  };
};

const employeeDemographics: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
      ],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  const now = Date.now();
  return {
    headers: ["Employee ID", "Full Name", "Nationality", "Gender", "Date of Birth", "Age"],
    rows: employees.map((e) => {
      const age = e.dateOfBirth
        ? Math.floor((now - e.dateOfBirth.getTime()) / (365.25 * 24 * 3600 * 1000))
        : null;
      return [e.employeeId, fullName(e), e.nationality, e.gender, isoDate(e.dateOfBirth), age];
    }),
  };
};

const isSaudi = (nationality: string | null): boolean =>
  (nationality ?? "").toLowerCase().includes("saudi");

const saudization: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
      ],
    },
    include: { department: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  const saudi = employees.filter((e) => isSaudi(e.nationality)).length;
  const nonSaudi = employees.length - saudi;
  const pct = (n: number) => (employees.length > 0 ? `${Math.round((n / employees.length) * 100)}%` : "0%");
  return {
    headers: ["Category", "Employees", "Percentage", "Nationality Basis"],
    rows: [
      ["Saudi Nationals", saudi, pct(saudi), "Nationality field containing 'Saudi'"],
      ["Non-Saudi", nonSaudi, pct(nonSaudi), "All other nationalities"],
      ["Total Workforce", employees.length, "100%", "Nitaqat compliance summary"],
      [],
      ...employees.map((e) => [
        e.employeeId,
        fullName(e),
        e.nationality ?? "Not set",
        isSaudi(e.nationality) ? "Saudi" : "Non-Saudi",
        e.department?.name ?? "",
      ]),
    ],
  };
};

const probation: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
        { employmentStatus: "active" },
      ],
    },
    include: { department: true },
    orderBy: { startDate: "desc" },
  });
  const now = Date.now();
  const inProbation = employees
    .filter((e) => e.startDate)
    .map((e) => {
      const start = e.startDate as Date;
      const end = new Date(start.getTime() + PROBATION_DAYS * 24 * 3600 * 1000);
      const daysRemaining = Math.ceil((end.getTime() - now) / (24 * 3600 * 1000));
      return { e, start, end, daysRemaining };
    })
    .filter((r) => r.daysRemaining >= 0);
  return {
    headers: ["Employee ID", "Full Name", "Department", "Start Date", "Probation End Date", "Days Remaining"],
    rows: inProbation.map((r) => [
      r.e.employeeId,
      fullName(r.e),
      r.e.department?.name ?? "",
      isoDate(r.start),
      isoDate(r.end),
      r.daysRemaining,
    ]),
  };
};

const attendanceReport = (statuses?: string[]): Builder => async (f) => {
  const records = await db.attendanceRecord.findMany({
    where: {
      AND: [
        f.from ? { date: { gte: f.from } } : {},
        f.to ? { date: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        statuses ? { status: { in: statuses } } : {},
      ],
    },
    include: { employee: { include: { department: true } } },
    orderBy: { date: "desc" },
  });
  return {
    headers: ["Employee ID", "Employee Name", "Department", "Date", "Check In", "Check Out", "Status", "Minutes Late", "Overtime (minutes)"],
    rows: records.map((r) => [
      r.employee.employeeId,
      fullName(r.employee),
      r.employee.department?.name ?? "",
      isoDate(r.date),
      r.checkIn ? isoDateTime(r.checkIn) : "",
      r.checkOut ? isoDateTime(r.checkOut) : "",
      r.status,
      r.minutesLate,
      r.overtime,
    ]),
  };
};

const leaveRequests: Builder = async (f) => {
  const requests = await db.leaveRequest.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
      ],
    },
    include: { employee: { include: { department: true } }, leaveType: true },
    orderBy: { startDate: "desc" },
  });
  return {
    headers: ["Employee ID", "Employee Name", "Department", "Leave Type", "Start Date", "End Date", "Days", "Status"],
    rows: requests.map((r) => [
      r.employee.employeeId,
      fullName(r.employee),
      r.employee.department?.name ?? "",
      r.leaveType.name,
      isoDate(r.startDate),
      isoDate(r.endDate),
      r.days,
      r.status,
    ]),
  };
};

const leaveBalances: Builder = async (f) => {
  const balances = await db.leaveBalance.findMany({
    where: f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
    include: { employee: { include: { department: true } }, leaveType: true },
    orderBy: [{ year: "desc" }, { employee: { lastName: "asc" } }],
  });
  return {
    headers: ["Employee ID", "Employee Name", "Department", "Leave Type", "Year", "Entitled (days)", "Used (days)", "Remaining (days)"],
    rows: balances.map((b) => [
      b.employee.employeeId,
      fullName(b.employee),
      b.employee.department?.name ?? "",
      b.leaveType.name,
      b.year,
      b.entitled,
      b.used,
      b.entitled - b.used,
    ]),
  };
};

const payrollReport = (paidOnly: boolean): Builder => async (f) => {
  const records = await db.payrollRecord.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        paidOnly ? { status: "paid" } : {},
      ],
    },
    include: { employee: { include: { department: true } } },
    orderBy: [{ period: "desc" }, { employee: { lastName: "asc" } }],
  });
  return {
    headers: ["Period", "Employee ID", "Employee Name", "Department", "Basic Salary (SAR)", "Allowances (SAR)", "Bonus (SAR)", "Deductions (SAR)", "Net Salary (SAR)", "Status"],
    rows: records.map((p) => [
      p.period,
      p.employee.employeeId,
      fullName(p.employee),
      p.employee.department?.name ?? "",
      sar(p.basicSalary),
      sar(p.allowances),
      sar(p.bonus),
      sar(p.deductions),
      sar(p.netSalary),
      p.status,
    ]),
  };
};

const payrollAdjustments: Builder = async (f) => {
  const records = await db.payrollRecord.findMany({
    where: {
      AND: [
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        { OR: [{ bonus: { gt: 0 } }, { deductions: { gt: 0 } }] },
      ],
    },
    include: { employee: true },
    orderBy: { period: "desc" },
  });
  return {
    headers: ["Period", "Employee ID", "Employee Name", "Bonus (SAR)", "Deductions (SAR)", "Status"],
    rows: records.map((p) => [
      p.period,
      p.employee.employeeId,
      fullName(p.employee),
      sar(p.bonus),
      sar(p.deductions),
      p.status,
    ]),
  };
};

const performanceGoals: Builder = async (f) => {
  const goals = await db.goal.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
      ],
    },
    include: { employee: { include: { department: true } } },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Employee ID", "Employee Name", "Department", "Goal", "Category", "Progress (%)", "Status", "Due Date"],
    rows: goals.map((g) => [
      g.employee.employeeId,
      fullName(g.employee),
      g.employee.department?.name ?? "",
      g.title,
      g.category,
      g.progress,
      g.status,
      isoDate(g.dueDate),
    ]),
  };
};

const performanceReviews: Builder = async (f) => {
  const reviews = await db.review.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
      ],
    },
    include: { employee: true, reviewer: true, cycle: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Employee", "Reviewer", "Cycle", "Cycle Type", "Status", "Overall Rating (1-5)", "Completed At"],
    rows: reviews.map((r) => [
      fullName(r.employee),
      fullName(r.reviewer),
      r.cycle.name,
      r.cycle.type,
      r.status,
      r.overallRating,
      isoDate(r.completedAt),
    ]),
  };
};

const performanceCycles: Builder = async () => {
  const cycles = await db.reviewCycle.findMany({
    include: { _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Cycle", "Type", "Status", "Period Start", "Period End", "Reviews"],
    rows: cycles.map((c) => [c.name, c.type, c.status, isoDate(c.periodStart), isoDate(c.periodEnd), c._count.reviews]),
  };
};

const overtimeSummary: Builder = async (f) => {
  const records = await db.attendanceRecord.findMany({
    where: {
      AND: [
        f.from ? { date: { gte: f.from } } : {},
        f.to ? { date: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        { overtime: { gt: 0 } },
      ],
    },
    include: { employee: { include: { department: true } } },
    orderBy: { date: "desc" },
  });
  return {
    headers: ["Employee ID", "Employee Name", "Department", "Date", "Overtime (minutes)", "Minutes Late"],
    rows: records.map((r) => [
      r.employee.employeeId,
      fullName(r.employee),
      r.employee.department?.name ?? "",
      isoDate(r.date),
      r.overtime,
      r.minutesLate,
    ]),
  };
};

const trainingReport: Builder = async () => {
  const platforms = await db.trainingPlatform.findMany({ orderBy: { name: "asc" } });
  return {
    headers: ["Platform", "Category", "Courses", "Active", "URL"],
    rows: platforms.map((p) => [p.name, p.category, p.coursesCount, p.active ? "Yes" : "No", p.url]),
  };
};

const trainingCourses: Builder = async () => {
  const platforms = await db.trainingPlatform.findMany({ orderBy: { name: "asc" } });
  return {
    headers: ["Platform", "Category", "Courses Count", "Description"],
    rows: platforms.map((p) => [p.name, p.category, p.coursesCount, p.description]),
  };
};

const staffRequests: Builder = async (f) => {
  const requests = await db.staffRequest.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
      ],
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Requested By", "Category", "Title", "Priority", "Status", "Created At", "Response"],
    rows: requests.map((r) => [
      r.user.name,
      r.category,
      r.title,
      r.priority,
      r.status,
      isoDateTime(r.createdAt),
      r.response,
    ]),
  };
};

const surveyResponses: Builder = async (f) => {
  const responses = await db.surveyResponse.findMany({
    where: {
      AND: [
        f.from ? { submittedAt: { gte: f.from } } : {},
        f.to ? { submittedAt: { lte: f.to } } : {},
      ],
    },
    include: { survey: true, employee: true },
    orderBy: { submittedAt: "desc" },
  });
  return {
    headers: ["Survey", "Employee", "Sentiment (-100..100)", "Submitted At"],
    rows: responses.map((r) => [r.survey.title, fullName(r.employee), r.sentiment, isoDateTime(r.submittedAt)]),
  };
};

const communications: Builder = async (f) => {
  const logs = await db.communicationLog.findMany({
    where: {
      AND: [
        f.from ? { sentAt: { gte: f.from } } : {},
        f.to ? { sentAt: { lte: f.to } } : {},
      ],
    },
    orderBy: { sentAt: "desc" },
  });
  return {
    headers: ["Channel", "Recipients", "Subject", "Status", "Sent At"],
    rows: logs.map((l) => [l.channel, l.recipients, l.subject, l.status, isoDateTime(l.sentAt)]),
  };
};

const documentsReport = (expiryFocus: boolean): Builder => async (f) => {
  const documents = await db.document.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        expiryFocus ? { expiryDate: { not: null } } : {},
      ],
    },
    include: { employee: true },
    orderBy: expiryFocus ? { expiryDate: "asc" } : { createdAt: "desc" },
  });
  const now = Date.now();
  return {
    headers: expiryFocus
      ? ["Employee", "Document", "Type", "Expiry Date", "Status", "Days to Expiry"]
      : ["Employee", "Document", "Type", "Status", "Issue Date", "Expiry Date"],
    rows: documents.map((d) =>
      expiryFocus
        ? [
            fullName(d.employee),
            d.name,
            d.type,
            isoDate(d.expiryDate),
            d.status,
            d.expiryDate
              ? Math.ceil((d.expiryDate.getTime() - now) / (24 * 3600 * 1000))
              : null,
          ]
        : [fullName(d.employee), d.name, d.type, d.status, isoDate(d.issueDate), isoDate(d.expiryDate)]
    ),
  };
};

const complianceAlerts: Builder = async (f) => {
  const alerts = await db.complianceAlert.findMany({
    where: {
      AND: [
        f.from ? { createdAt: { gte: f.from } } : {},
        f.to ? { createdAt: { lte: f.to } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    headers: ["Severity", "Type", "Title", "Message", "Status", "Created At"],
    rows: alerts.map((a) => [a.severity, a.type, a.title, a.message, a.status, isoDateTime(a.createdAt)]),
  };
};

const exitReport = (checklistFocus: boolean): Builder => async (f) => {
  const processes = await db.offboardingProcess.findMany({
    where: {
      AND: [
        f.from ? { lastDay: { gte: f.from } } : {},
        f.to ? { lastDay: { lte: f.to } } : {},
        f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
      ],
    },
    include: { employee: { include: { department: true } } },
    orderBy: { lastDay: "desc" },
  });
  if (!checklistFocus) {
    return {
      headers: ["Employee ID", "Employee Name", "Department", "Last Day", "Reason", "Status"],
      rows: processes.map((p) => [
        p.employee.employeeId,
        fullName(p.employee),
        p.employee.department?.name ?? "",
        isoDate(p.lastDay),
        p.reason,
        p.status,
      ]),
    };
  }
  const rows: Cell[][] = [];
  for (const p of processes) {
    let items: unknown[] = [];
    try {
      const parsed: unknown = JSON.parse(p.checklist || "[]");
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
    for (const item of items) {
      if (typeof item === "object" && item !== null) {
        const entry = item as { title?: unknown; done?: unknown };
        rows.push([fullName(p.employee), String(entry.title ?? ""), entry.done === true ? "Done" : "Pending", isoDate(p.lastDay)]);
      }
    }
  }
  return { headers: ["Employee", "Checklist Task", "Done", "Last Day"], rows };
};

const organizational: Builder = async (f) => {
  const departments = await db.department.findMany({
    where: f.departmentId ? { id: f.departmentId } : {},
    include: { employees: { select: { id: true, employmentStatus: true } } },
    orderBy: { name: "asc" },
  });
  const rows: Cell[][] = departments.map((d) => [
    d.name,
    d.employees.length,
    d.employees.filter((e) => e.employmentStatus === "active").length,
  ]);
  if (!f.departmentId) {
    const unassigned = await db.employee.count({ where: { departmentId: null } });
    rows.push(["Unassigned", unassigned, unassigned]);
  }
  return { headers: ["Department", "Employees", "Active"], rows };
};

const orgStructure: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
      ],
    },
    include: { department: true, manager: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return {
    headers: ["Employee ID", "Full Name", "Job Title", "Department", "Manager"],
    rows: employees.map((e) => [
      e.employeeId,
      fullName(e),
      e.jobTitle,
      e.department?.name ?? "",
      e.manager ? fullName(e.manager) : "",
    ]),
  };
};

const turnover: Builder = async (f) => {
  const employees = await db.employee.findMany({
    where: {
      AND: [
        f.from ? { startDate: { gte: f.from } } : {},
        f.to ? { startDate: { lte: f.to } } : {},
        f.departmentId ? { departmentId: f.departmentId } : {},
        { employmentStatus: "terminated" },
      ],
    },
    include: { department: true },
    orderBy: { endDate: "desc" },
  });
  const total = await db.employee.count({
    where: f.departmentId ? { departmentId: f.departmentId } : {},
  });
  const rows: Cell[][] = employees.map((e) => [
    e.employeeId,
    fullName(e),
    e.department?.name ?? "",
    isoDate(e.startDate),
    isoDate(e.endDate),
  ]);
  rows.push([]);
  rows.push(["Total Workforce", total, "Terminated", employees.length, `Turnover ${total > 0 ? Math.round((employees.length / total) * 100) : 0}%`]);
  return {
    headers: ["Employee ID", "Full Name", "Department", "Start Date", "End Date"],
    rows,
  };
};

const analytics: Builder = async (f) => {
  const deptWhere = f.departmentId ? { departmentId: f.departmentId } : {};
  const [employees, active, onLeave, terminated, departments, payrollCount, payrollSum, leaveCount, pendingLeave, attendanceCount, documents, assets] =
    await Promise.all([
      db.employee.count({ where: deptWhere }),
      db.employee.count({ where: { ...deptWhere, employmentStatus: "active" } }),
      db.employee.count({ where: { ...deptWhere, employmentStatus: "on_leave" } }),
      db.employee.count({ where: { ...deptWhere, employmentStatus: "terminated" } }),
      db.department.count(),
      db.payrollRecord.count({ where: f.departmentId ? { employee: { departmentId: f.departmentId } } : {} }),
      db.payrollRecord.aggregate({
        where: f.departmentId ? { employee: { departmentId: f.departmentId } } : {},
        _sum: { netSalary: true },
      }),
      db.leaveRequest.count(),
      db.leaveRequest.count({ where: { status: "pending" } }),
      db.attendanceRecord.count({ where: f.departmentId ? { employee: { departmentId: f.departmentId } } : {} }),
      db.document.count({ where: f.departmentId ? { employee: { departmentId: f.departmentId } } : {} }),
      db.asset.count(),
    ]);
  return {
    headers: ["Metric", "Value"],
    rows: [
      ["Total Employees", employees],
      ["Active Employees", active],
      ["On Leave", onLeave],
      ["Terminated", terminated],
      ["Departments", departments],
      ["Payroll Records", payrollCount],
      ["Payroll Total (SAR)", sar(payrollSum._sum.netSalary ?? 0)],
      ["Leave Requests", leaveCount],
      ["Pending Leave Requests", pendingLeave],
      ["Attendance Records", attendanceCount],
      ["Documents Tracked", documents],
      ["Assets Tracked", assets],
    ],
  };
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const REPORT_TYPES: Record<string, { filename: string; build: Builder }> = {
  "employee-master": { filename: "employee-list.csv", build: employeeList },
  "employee-list": { filename: "employee-list.csv", build: employeeList },
  "employee-personal": { filename: "employee-personal-information.csv", build: employeePersonal },
  "employee-documents": { filename: "employee-documents.csv", build: employeeDocuments },
  "employee-demographics": { filename: "employee-demographics.csv", build: employeeDemographics },
  saudization: { filename: "saudization-nitaqat-compliance.csv", build: saudization },
  probation: { filename: "probation-status.csv", build: probation },
  attendance: { filename: "daily-attendance.csv", build: attendanceReport() },
  "late-arrivals": { filename: "late-arrivals.csv", build: attendanceReport(["late"]) },
  overtime: { filename: "overtime-summary.csv", build: overtimeSummary },
  absence: { filename: "absence-summary.csv", build: attendanceReport(["absent"]) },
  leave: { filename: "leave-requests.csv", build: leaveRequests },
  "leave-balances": { filename: "leave-balances.csv", build: leaveBalances },
  payroll: { filename: "payroll-register.csv", build: payrollReport(false) },
  "payroll-disbursement": { filename: "payroll-disbursement.csv", build: payrollReport(true) },
  "payroll-adjustments": { filename: "payroll-adjustments.csv", build: payrollAdjustments },
  "performance-goals": { filename: "goals-kpi.csv", build: performanceGoals },
  "performance-reviews": { filename: "performance-reviews.csv", build: performanceReviews },
  "performance-cycles": { filename: "appraisal-cycles.csv", build: performanceCycles },
  training: { filename: "training-platforms.csv", build: trainingReport },
  "training-courses": { filename: "course-catalog.csv", build: trainingCourses },
  "employee-relations": { filename: "staff-requests.csv", build: staffRequests },
  "survey-responses": { filename: "survey-responses.csv", build: surveyResponses },
  communications: { filename: "communication-log.csv", build: communications },
  contracts: { filename: "document-register.csv", build: documentsReport(false) },
  "document-expiry": { filename: "document-expiry.csv", build: documentsReport(true) },
  "compliance-alerts": { filename: "compliance-alerts.csv", build: complianceAlerts },
  exit: { filename: "offboarding.csv", build: exitReport(false) },
  "exit-checklists": { filename: "exit-checklists.csv", build: exitReport(true) },
  organizational: { filename: "headcount-by-department.csv", build: organizational },
  "org-structure": { filename: "reporting-structure.csv", build: orgStructure },
  turnover: { filename: "turnover-analysis.csv", build: turnover },
  analytics: { filename: "workforce-analytics.csv", build: analytics },
};

export async function GET(req: NextRequest): Promise<Response> {
  // Note: this endpoint streams text/csv, so it bypasses guard()'s JSON
  // NextResponse<ApiResult<T>> signature — errors still use the JSON envelope.
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const sp = req.nextUrl.searchParams;
    const type = sp.get("type") ?? "";
    const report = REPORT_TYPES[type];
    if (!report) {
      return err("NOT_FOUND", `Unknown report type: ${type || "(none)"}`);
    }

    const filters: Filters = {
      from: parseDate(sp.get("from")),
      to: parseDate(sp.get("to"), true),
      departmentId: sp.get("department") || null,
    };

    const result = await report.build(filters);
    const csv = toCsv(result);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${report.filename}"`,
      },
    });
  } catch (e) {
    console.error("[api]", e);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }
}
