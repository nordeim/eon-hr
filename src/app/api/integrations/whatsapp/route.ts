import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireRole, parseBody } from "@/lib/api";

// /api/integrations/whatsapp — the WhatsApp provider config (session 57,
// R57-C — the superset persistence behind REF's "Configure WhatsApp API"
// dialog; REF's own Save closes silently with no stored state).
//
// GET   → the current config (apiKey masked)
// PUT   → upsert the config (admin/hr gate)

const WhatsappInput = z.object({
  apiKey: z.string().trim().min(1, "API key is required").max(200),
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, "Enter a valid phone number with country code"),
  webhookUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(300)
    .optional()
    .or(z.literal("")),
});

const PROVIDER = "whatsapp";

function maskKey(key: string | null): string | null {
  if (!key) return null;
  if (key.length <= 8) return "•".repeat(key.length);
  return key.slice(0, 4) + "•".repeat(Math.min(12, key.length - 8)) + key.slice(-4);
}

export async function GET() {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const integration = await db.integration.findUnique({ where: { provider: PROVIDER } });
    return ok({
      integration: integration
        ? {
            provider: integration.provider,
            apiKeyMasked: maskKey(integration.apiKey),
            phoneNumber: integration.phoneNumber,
            webhookUrl: integration.webhookUrl,
            status: integration.status,
            updatedAt: integration.updatedAt,
          }
        : null,
    });
  });
}

export async function PUT(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, WhatsappInput);
    if (!data) return bad;

    const integration = await db.integration.upsert({
      where: { provider: PROVIDER },
      update: {
        apiKey: data.apiKey,
        phoneNumber: data.phoneNumber,
        webhookUrl: data.webhookUrl || null,
        status: "connected",
      },
      create: {
        provider: PROVIDER,
        apiKey: data.apiKey,
        phoneNumber: data.phoneNumber,
        webhookUrl: data.webhookUrl || null,
        status: "connected",
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "integration.update",
        entity: "integration",
        entityId: integration.id,
        detail: JSON.stringify({ provider: PROVIDER, status: "connected" }),
      },
    });

    return ok({ integration: { provider: integration.provider, status: integration.status } });
  });
}
