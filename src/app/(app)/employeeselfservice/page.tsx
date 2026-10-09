import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  FileText,
  Loader2,
  Package,
  Send,
  Wallet,
} from "lucide-react";
import { formatDate, formatSar, initials, timeAgo } from "@/lib/utils";

function LoadingCard() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </CardContent>
    </Card>
  );
}

async function SelfServiceContent() {
  const user = await getSessionUser();
  if (!user) return null;

  const employee = user.employeeId
    ? await db.employee.findUnique({
        where: { id: user.employeeId },
        include: { department: { select: { name: true } } },
      })
    : await db.employee.findFirst({
        where: { userId: user.id },
        include: { department: { select: { name: true } } },
      });

  if (!employee) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No employee profile linked"
            description="Your account is not connected to an employee record yet. Ask HR to link one."
          />
        </CardContent>
      </Card>
    );
  }

  const [balances, staffRequests, leaveRequests, payslips, documents, assets] = await Promise.all([
    db.leaveBalance.findMany({
      where: { employeeId: employee.id },
      include: { leaveType: { select: { name: true, color: true } } },
      orderBy: { leaveTypeId: "asc" },
    }),
    db.staffRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.leaveRequest.findMany({
      where: { employeeId: employee.id },
      include: { leaveType: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.payrollRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: { period: "desc" },
      take: 5,
    }),
    db.document.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
    }),
    db.asset.findMany({
      where: { assignedToId: employee.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const recentRequests = [
    ...staffRequests.map((r) => ({
      key: `staff-${r.id}`,
      icon: <Send className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />,
      title: r.title,
      meta: `Staff request · ${r.category.replace(/_/g, " ")}`,
      createdAt: r.createdAt,
      status: r.status,
    })),
    ...leaveRequests.map((r) => ({
      key: `leave-${r.id}`,
      icon: <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />,
      title: `${r.leaveType.name} (${r.days} ${r.days === 1 ? "day" : "days"})`,
      meta: `Leave request · ${formatDate(r.startDate)}`,
      createdAt: r.createdAt,
      status: r.status,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* My Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" aria-hidden="true" />
              My Profile
            </CardTitle>
            <CardDescription>Your employee record at a glance</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">
              View
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {employee.avatarUrl ? <AvatarImage src={employee.avatarUrl} alt={fullName} /> : null}
              <AvatarFallback className="text-base">{initials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{fullName}</p>
              <p className="truncate text-sm text-muted-foreground">{employee.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={employee.employmentStatus} />
                <StatusBadge status={employee.employmentType} />
              </div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Employee ID</dt>
              <dd className="font-medium text-foreground">{employee.employeeId}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Job Title</dt>
              <dd className="font-medium text-foreground">{employee.jobTitle ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Department</dt>
              <dd className="font-medium text-foreground">{employee.department?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Start Date</dt>
              <dd className="font-medium text-foreground">{formatDate(employee.startDate)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* My Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" aria-hidden="true" />
            My Leave Balances
          </CardTitle>
          <CardDescription>Entitled vs used days per leave type</CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <EmptyState title="No leave balances" description="Balances appear once HR assigns them." />
          ) : (
            <div className="flex flex-col gap-4">
              {balances.map((b) => {
                const pct = b.entitled > 0 ? Math.round((b.used / b.entitled) * 100) : 0;
                return (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{b.leaveType.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {b.used} / {b.entitled} days
                      </p>
                    </div>
                    <Progress value={pct} aria-label={`${b.leaveType.name} usage`} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" aria-hidden="true" />
            My Recent Requests
          </CardTitle>
          <CardDescription>Latest staff and leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <EmptyState title="No requests yet" description="Requests you submit appear here." />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentRequests.map((r) => (
                <li key={r.key} className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-3">
                  {r.icon}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.meta}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* My Payslips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" aria-hidden="true" />
            My Payslips
          </CardTitle>
          <CardDescription>Latest payroll periods</CardDescription>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <EmptyState title="No payslips yet" description="Payslips appear once payroll runs." />
          ) : (
            <ul className="flex flex-col gap-3">
              {payslips.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/30 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Period {p.period}</p>
                    <p className="text-xs text-muted-foreground">Net {formatSar(p.netSalary)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* My Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
            My Documents
          </CardTitle>
          <CardDescription>Documents on file with expiry status</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState title="No documents" description="Documents HR uploads for you appear here." />
          ) : (
            <ul className="flex flex-col gap-3">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/30 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.type.replace(/_/g, " ")}
                      {d.expiryDate ? ` · expires ${formatDate(d.expiryDate)}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* My Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" aria-hidden="true" />
            My Assets
          </CardTitle>
          <CardDescription>Company equipment assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <EmptyState title="No assets assigned" description="Assigned equipment appears here." />
          ) : (
            <ul className="flex flex-col gap-3">
              {assets.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/30 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.type.replace(/_/g, " ")}
                      {a.serialNumber ? ` · ${a.serialNumber}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployeeSelfServicePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader title="My Portal" subtitle="Your employee self-service portal" />
      <React.Suspense fallback={<LoadingCard />}>
        <SelfServiceContent />
      </React.Suspense>
    </div>
  );
}
