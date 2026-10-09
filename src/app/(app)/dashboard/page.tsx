import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, MessageSquarePlus, Receipt, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { formatSar } from "@/lib/utils";
import { CustomizeButton } from "./customize-button";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  { label: "My Portal", href: "/employeeselfservice", icon: Building2 },
  { label: "Submit Request", href: "/staffrequests?new=1", icon: MessageSquarePlus },
  { label: "Claim Expense", href: "/expenses?new=1", icon: Receipt },
  { label: "Request Leave", href: "/leavemanagement?new=1", icon: CalendarPlus },
];

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const year = new Date().getFullYear();
  const employee = user.employeeId
    ? await db.employee.findUnique({
        where: { id: user.employeeId },
        select: {
          id: true,
          leaveBalances: {
            where: { year },
            select: { entitled: true, used: true, leaveType: { select: { name: true, color: true } } },
            orderBy: { leaveType: { name: "asc" } },
          },
        },
      })
    : null;

  const recentRequests = employee
    ? await db.leaveRequest.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, startDate: true, endDate: true, status: true, days: true },
      })
    : [];

  const expenses = employee
    ? await db.expenseClaim.aggregate({
        where: { employeeId: employee.id, status: { in: ["pending", "approved", "reimbursed"] } },
        _sum: { amount: true },
      })
    : null;

  const balances = employee?.leaveBalances ?? [];
  const totalExpense = expenses?._sum.amount ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-muted-foreground">Your personal employee portal.</p>
        </div>
        <CustomizeButton />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Quick Actions */}
        <Card data-widget="quick-actions">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="sr-only">Common self-service shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3 text-sm font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:bg-accent/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <action.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances */}
        <Card data-widget="leave-balances">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-0.5">
              <CardTitle>My Leave Balances</CardTitle>
            </div>
            <Link href="/leavemanagement" className="text-sm font-medium text-primary hover:underline">
              Request leave
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {balances.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No leave balances yet</p>
            ) : (
              balances.map((b) => {
                const pct = b.entitled > 0 ? ((b.entitled - b.used) / b.entitled) * 100 : 0;
                return (
                  <div key={b.leaveType.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{b.leaveType.name}</span>
                      <span className="text-muted-foreground">
                        {b.entitled - b.used} / {b.entitled} days
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      aria-label={`${b.leaveType.name} balance`}
                      indicatorClassName={b.leaveType.name === "Sick Leave" ? "bg-emerald-500" : undefined}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card data-widget="recent-requests">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle>My Recent Requests</CardTitle>
            <Link href="/staffrequests" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No requests yet</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border/60">
                {recentRequests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">
                      {new Date(r.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — {r.days}d
                    </span>
                    <span className="font-medium capitalize text-foreground">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Claims */}
      <Card data-widget="expense-claims">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>My Expense Claims</CardTitle>
          <Link href="/expenses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-1 py-8">
          <p className="text-3xl font-bold text-foreground">{formatSar(totalExpense)}</p>
          <p className="text-sm text-muted-foreground">total</p>
          {totalExpense === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground/70">No claims yet</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
