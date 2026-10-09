import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/communications — outbound email / SMS / WhatsApp blasts (logged).
// GET  → communication history (recipients parsed from JSON)
// POST → send: resolves recipient employees, logs the message

const SendInput = z.object({
  channel: z.enum(["email", "sms", "whatsapp"]),
  recipientIds: z.array(z.string().min(1)).min(1, "Select at least one recipient").max(200),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const logs = await db.communicationLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 100,
      select: { id: true, channel: true, recipients: true, subject: true, body: true, status: true, sentAt: true },
    });

    return ok({
      logs: logs.map((l) => {
        let names: string[] = [];
        try {
          const v: unknown = JSON.parse(l.recipients || "[]");
          if (Array.isArray(v)) names = v.filter((x): x is string => typeof x === "string");
        } catch {
          names = [];
        }
        return {
          id: l.id,
          channel: l.channel,
          recipients: names,
          recipientsCount: names.length,
          subject: l.subject,
          body: l.body,
          status: l.status,
          sentAt: l.sentAt,
        };
      }),
    });
  });
}

export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr", "manager"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, SendInput);
    if (!data) return bad;

    if (data.channel === "email" && !data.subject) {
      return err("VALIDATION", "Email subject is required", { subject: ["Subject is required for emails"] });
    }

    const employees = await db.employee.findMany({
      where: { id: { in: data.recipientIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    if (employees.length === 0) return err("NOT_FOUND", "No recipients matched the selection");

    const names = employees.map((e) => `${e.firstName} ${e.lastName}`.trim());
    const log = await db.communicationLog.create({
      data: {
        channel: data.channel,
        recipients: JSON.stringify(names),
        subject: data.subject || null,
        body: data.message,
        status: "sent",
      },
      select: { id: true, sentAt: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "communication.sent",
        entity: "communication_log",
        entityId: log.id,
        detail: JSON.stringify({ channel: data.channel, recipients: names.length, subject: data.subject || null }),
      },
    });

    return ok({
      log: {
        id: log.id,
        channel: data.channel,
        recipients: names,
        recipientsCount: names.length,
        subject: data.subject || null,
        body: data.message,
        status: "sent",
        sentAt: log.sentAt,
      },
    });
  });
}
