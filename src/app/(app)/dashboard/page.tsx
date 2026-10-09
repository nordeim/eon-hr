import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, MessageSquare, Receipt, Calendar } from "lucide-react";
import Link from "next/link";
import { CustomizeButton } from "./customize-button";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Quick actions — reference icons + bordered chip styling
// (lucide briefcase / message-square / receipt / calendar, w-4 h-4 blue-600).
const QUICK_ACTIONS = [
  { label: "My Portal", href: "/employeeselfservice", icon: Briefcase },
  { label: "Submit Request", href: "/staffrequests?new=1", icon: MessageSquare },
  { label: "Claim Expense", href: "/expenses?new=1", icon: Receipt },
  { label: "Request Leave", href: "/leavemanagement?new=1", icon: Calendar },
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
      {/* Reference header: h1.text-3xl font-bold text-slate-900 + slate-500 subtitle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
          <p className="mt-1 text-slate-500">Your personal employee portal.</p>
        </div>
        <CustomizeButton />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Quick Actions — reference: bordered chips, small inline blue icons */}
        <Card data-widget="quick-actions">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <action.icon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="text-sm text-slate-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances — reference: label text-slate-600, value font-medium,
            h-2 track bg-slate-200 with bg-blue-500 / bg-green-500 fills */}
        <Card data-widget="leave-balances">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-0.5">
              <CardTitle>My Leave Balances</CardTitle>
            </div>
            <Link href="/leavemanagement" className="text-xs text-blue-600 hover:underline">
              Request leave
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No leave balances yet</p>
            ) : (
              balances.map((b) => {
                const pct = b.entitled > 0 ? ((b.entitled - b.used) / b.entitled) * 100 : 0;
                return (
                  <div key={b.leaveType.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">{b.leaveType.name}</span>
                      <span className="font-medium text-slate-900">
                        {b.entitled - b.used} / {b.entitled} days
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={"h-2 rounded-full " + (b.leaveType.name === "Sick Leave" ? "bg-green-500" : "bg-blue-500")}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${b.leaveType.name} balance`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card data-widget="recent-requests">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>My Recent Requests</CardTitle>
            <Link href="/staffrequests" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No requests yet</p>
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

        {/* Expense Claims — reference: 1 grid column (first column of row 2),
            left-aligned amount, "0" text-2xl bold slate-900 with "SAR total"
            as an inline text-sm slate-500 span. */}
        <Card data-widget="expense-claims">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>My Expense Claims</CardTitle>
            <Link href="/expenses" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-3 text-2xl font-bold text-slate-900">
              {(totalExpense / 100).toLocaleString("en-US", {
                minimumFractionDigits: totalExpense % 100 === 0 ? 0 : 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-slate-500">SAR total</span>
            </p>
            {totalExpense === 0 ? (
              <p className="py-2 text-center text-sm text-slate-400">No claims yet</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
