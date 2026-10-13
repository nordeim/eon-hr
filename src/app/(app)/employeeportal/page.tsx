import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * The /employeeportal orphan route — parity round 31 (R31-C2).
 *
 * REF serves this page (registry: EmployeePortal): a blue→indigo-100
 * gradient canvas centering a max-w-md shadow-xl card. Zero-data (the
 * linked employee has no onboarding process): "No Onboarding Found" +
 * the muted line (measured y=335/448px card, docs/remediation-plan-
 * session32.md). Superset: with an active OnboardingProcess the card
 * renders the progress (REF-side unverifiable — the with-data frontier).
 */
export default async function EmployeePortalPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const employee = user.employeeId
    ? await db.employee.findUnique({
        where: { id: user.employeeId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          onboardingProcs: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { id: true, status: true, progress: true, startedAt: true, tasks: true },
          },
        },
      })
    : null;

  const process = employee?.onboardingProcs[0] ?? null;
  let tasks: { title: string; done: boolean }[] = [];
  if (process) {
    try {
      const parsed: unknown = JSON.parse(process.tasks || "[]");
      if (Array.isArray(parsed)) {
        tasks = parsed.filter(
          (t): t is { title: string; done: boolean } =>
            typeof t === "object" && t !== null && "title" in t && "done" in t
        );
      }
    } catch {
      tasks = [];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="max-w-md w-full border-slate-200 shadow-xl">
        <CardContent className="p-8 text-center">
          {!employee || !process ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <ClipboardList className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No Onboarding Found</h2>
              <p className="mt-2 text-slate-600">
                You don&apos;t have an active onboarding process yet. Please contact your HR team.
              </p>
            </>
          ) : (
            /* the with-data superset (REF-side unverifiable) */
            <>
              <h2 className="text-xl font-bold text-slate-900">
                Welcome, {employee.firstName} {employee.lastName}
              </h2>
              <p className="mt-2 text-slate-600">Your onboarding is {process.progress}% complete.</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.min(100, Math.max(0, process.progress))}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2 text-left">
                {tasks.map((t) => (
                  <li key={t.title} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className={t.done ? "text-green-600" : "text-slate-400"}>{t.done ? "✓" : "○"}</span>
                    {t.title}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
