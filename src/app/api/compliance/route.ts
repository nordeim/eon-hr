import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireRole, parseBody, type ApiResult } from "@/lib/api";

// Compliance dashboard: document expiry monitoring + alert scan.
// GET  → alerts + computed at-risk document buckets + stats
// POST → { action: "scan" } recomputes alerts from Document.expiryDate (upserts)
//        { action: "notify", windowDays } creates CommunicationLog entries

interface ComplianceActionResult {
  notified?: number;
  message?: string;
  scanned?: number;
  created?: number;
  updated?: number;
  resolved?: number;
}

const ActionInput = z.object({
  action: z.enum(["scan", "notify"]).default("scan"),
  windowDays: z.number().int().min(1).max(90).optional(),
});

const DAY_MS = 86_400_000;

function daysLeft(expiry: Date): number {
  return Math.ceil((expiry.getTime() - Date.now()) / DAY_MS);
}

function riskBucket(days: number): "expired" | "d7" | "d15" | "d30" | "ok" {
  if (days < 0) return "expired";
  if (days <= 7) return "d7";
  if (days <= 15) return "d15";
  if (days <= 30) return "d30";
  return "ok";
}

function severityFor(bucket: "expired" | "d7" | "d15" | "d30" | "ok"): string {
  if (bucket === "expired") return "critical";
  if (bucket === "d7") return "high";
  if (bucket === "d15") return "medium";
  return "low";
}

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

// GET /api/compliance
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;
    void req;

    const [alerts, documents] = await Promise.all([
      db.complianceAlert.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: {
          employee: { select: { firstName: true, lastName: true, employeeId: true } },
        },
      }),
      db.document.findMany({
        where: { expiryDate: { not: null } },
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
        orderBy: { expiryDate: "asc" },
      }),
    ]);

    const atRisk = documents
      .map((d) => {
        const days = daysLeft(d.expiryDate as Date);
        return {
          id: d.id,
          name: d.name,
          type: d.type,
          status: d.status,
          expiryDate: d.expiryDate,
          daysLeft: days,
          risk: riskBucket(days),
          severity: severityFor(riskBucket(days)),
          employeeId: d.employee.employeeId,
          employeeName: empName(d.employee),
        };
      })
      .filter((d) => d.risk !== "ok");

    const stats = {
      critical: alerts.filter((a) => a.severity === "critical" && a.status === "active").length,
      high: alerts.filter((a) => a.severity === "high" && a.status === "active").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
      active: alerts.filter((a) => a.status === "active").length,
    };

    return ok({
      alerts: alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        type: a.type,
        title: a.title,
        message: a.message,
        status: a.status,
        createdAt: a.createdAt,
        employeeName: a.employee ? empName(a.employee) : null,
      })),
      documents: atRisk,
      stats,
    });
  });
}

// POST /api/compliance — scan or notify
export async function POST(req: NextRequest) {
  return guard(async (): Promise<NextResponse<ApiResult<ComplianceActionResult>>> => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, ActionInput);
    if (!data) return bad;

    if (data.action === "notify") {
      const windowDays = data.windowDays ?? 7;
      const documents = await db.document.findMany({
        where: { expiryDate: { not: null } },
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true, email: true } } },
      });
      const targets = documents
        .map((d) => ({ doc: d, days: daysLeft(d.expiryDate as Date) }))
        .filter((t) => t.days <= windowDays);
      if (targets.length === 0) {
        return ok({ notified: 0, message: `No documents expiring within ${windowDays} days` });
      }
      const recipients = targets.map((t) => ({
        name: empName(t.doc.employee),
        email: t.doc.employee.email,
        document: t.doc.name,
        daysLeft: t.days,
      }));
      await db.communicationLog.create({
        data: {
          channel: "email",
          recipients: JSON.stringify(recipients.map((r) => r.email)),
          subject: `Document expiry reminder — ${recipients.length} document(s) within ${windowDays} days`,
          body: recipients
            .map((r) =>
              `${r.name}: ${r.document} ${
                r.daysLeft < 0 ? `expired ${Math.abs(r.daysLeft)} day(s) ago` : `expires in ${r.daysLeft} day(s)`
              }`
            )
            .join("; "),
          status: "sent",
        },
      });
      return ok({ notified: recipients.length });
    }

    // ---- scan: recompute document statuses + upsert alerts ----
    const documents = await db.document.findMany({ where: { expiryDate: { not: null } } });
    const atRiskIds: string[] = [];
    let created = 0;
    let updated = 0;

    for (const d of documents) {
      const days = daysLeft(d.expiryDate as Date);
      const bucket = riskBucket(days);
      const newStatus = bucket === "expired" ? "expired" : bucket === "ok" ? "valid" : "expiring";
      if (newStatus !== d.status) {
        await db.document.update({ where: { id: d.id }, data: { status: newStatus } });
      }
      if (bucket === "ok") continue;
      atRiskIds.push(d.id);

      const severity = severityFor(bucket);
      const title = bucket === "expired" ? `${d.name} expired` : `${d.name} expiring soon`;
      const message =
        bucket === "expired"
          ? `${d.name} expired ${Math.abs(days)} day(s) ago. Renewal required immediately.`
          : `${d.name} expires in ${days} day(s). Schedule renewal before it lapses.`;

      const existing = await db.complianceAlert.findFirst({
        where: { documentId: d.id, type: "document_expiry", status: "active" },
      });
      if (existing) {
        if (existing.severity !== severity || existing.message !== message) {
          await db.complianceAlert.update({ where: { id: existing.id }, data: { severity, title, message } });
          updated++;
        }
      } else {
        await db.complianceAlert.create({
          data: {
            employeeId: d.employeeId,
            documentId: d.id,
            severity,
            type: "document_expiry",
            title,
            message,
            status: "active",
          },
        });
        created++;
      }
    }

    // resolve alerts whose documents are no longer at risk (or were deleted)
    const now = new Date();
    let resolved = 0;
    if (atRiskIds.length > 0) {
      const r1 = await db.complianceAlert.updateMany({
        where: { type: "document_expiry", status: "active", documentId: { notIn: atRiskIds } },
        data: { status: "resolved", resolvedAt: now },
      });
      resolved += r1.count;
    } else {
      const r1 = await db.complianceAlert.updateMany({
        where: { type: "document_expiry", status: "active", documentId: { not: null } },
        data: { status: "resolved", resolvedAt: now },
      });
      resolved += r1.count;
    }
    const r2 = await db.complianceAlert.updateMany({
      where: { type: "document_expiry", status: "active", documentId: null },
      data: { status: "resolved", resolvedAt: now },
    });
    resolved += r2.count;

    return ok({ scanned: documents.length, created, updated, resolved });
  });
}
