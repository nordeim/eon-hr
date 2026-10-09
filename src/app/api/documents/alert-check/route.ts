import { db } from "@/lib/db";
import { ok, guard, requireRole } from "@/lib/api";

// POST /api/documents/alert-check — "Run Alert Check".
// Recomputes every document's stored status from expiryDate (<0 days =
// expired, <=30 days = expiring) and creates ComplianceAlerts for expiring /
// expired documents that don't have an active alert yet (one per document).

function statusFromExpiry(expiry: Date | null): "valid" | "expiring" | "expired" {
  if (!expiry) return "valid";
  const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}

function daysToExpiry(expiry: Date): number {
  return Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
}

function fullName(e: { firstName: string; lastName: string }): string {
  return `${e.firstName} ${e.lastName}`.trim();
}

export async function POST() {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const documents = await db.document.findMany({
      select: {
        id: true,
        name: true,
        expiryDate: true,
        status: true,
        employeeId: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    let updated = 0;
    let alertsCreated = 0;
    let expiring = 0;
    let expired = 0;

    const activeAlerts = await db.complianceAlert.findMany({
      where: { type: "document_expiry", status: "active" },
      select: { documentId: true },
    });
    const alertedDocIds = new Set(activeAlerts.map((a) => a.documentId).filter((v): v is string => Boolean(v)));

    for (const doc of documents) {
      if (doc.status === "pending_upload") continue;

      const status = statusFromExpiry(doc.expiryDate);
      if (status !== doc.status) {
        await db.document.update({ where: { id: doc.id }, data: { status } });
        updated += 1;
      }

      if (status === "valid") continue;
      if (status === "expiring") expiring += 1;
      else expired += 1;

      if (alertedDocIds.has(doc.id)) continue;

      const days = doc.expiryDate ? daysToExpiry(doc.expiryDate) : null;
      const employeeName = doc.employee ? fullName(doc.employee) : "Employee";
      await db.complianceAlert.create({
        data: {
          employeeId: doc.employeeId,
          documentId: doc.id,
          severity: status === "expired" ? "critical" : "high",
          type: "document_expiry",
          title:
            status === "expired"
              ? `Document expired: ${doc.name}`
              : `Document expiring soon: ${doc.name}`,
          message:
            status === "expired"
              ? `${employeeName}'s "${doc.name}" expired${days !== null ? ` ${Math.abs(days)} day(s) ago` : ""}. Renewal required.`
              : `${employeeName}'s "${doc.name}" expires in ${days ?? "?"} day(s). Start the renewal process.`,
          status: "active",
        },
      });
      alertedDocIds.add(doc.id);
      alertsCreated += 1;
    }

    return ok({ checked: documents.length, updated, alertsCreated, expiring, expired });
  });
}
