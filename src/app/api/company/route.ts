import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/company — the single company profile record.
// GET   → company (may be null; client renders "Not set")
// PATCH → update (admin/hr)

const CompanyInput = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120).optional(),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  size: z.string().trim().max(40).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  taxId: z.string().trim().max(60).optional().or(z.literal("")),
  registrationNumber: z.string().trim().max(60).optional().or(z.literal("")),
});

const COMPANY_FIELDS = {
  name: true,
  industry: true,
  size: true,
  phone: true,
  email: true,
  website: true,
  address: true,
  taxId: true,
  registrationNumber: true,
  updatedAt: true,
} as const;

export async function GET() {
  return guard(async () => {
    await requireUser();
    const company = await db.company.findFirst({ select: COMPANY_FIELDS });
    return ok({ company });
  });
}

export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, CompanyInput);
    if (!data) return bad;

    const existing = await db.company.findFirst({ select: { id: true } });
    const values = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.industry !== undefined ? { industry: data.industry || null } : {}),
      ...(data.size !== undefined ? { size: data.size || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
      ...(data.email !== undefined ? { email: data.email || null } : {}),
      ...(data.website !== undefined ? { website: data.website || null } : {}),
      ...(data.address !== undefined ? { address: data.address || null } : {}),
      ...(data.taxId !== undefined ? { taxId: data.taxId || null } : {}),
      ...(data.registrationNumber !== undefined ? { registrationNumber: data.registrationNumber || null } : {}),
    };

    const company = existing
      ? await db.company.update({ where: { id: existing.id }, data: values, select: COMPANY_FIELDS })
      : await db.company.create({ data: { id: "company", name: data.name ?? "Demo", ...values }, select: COMPANY_FIELDS });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "company.update",
        entity: "company",
        entityId: company.name,
        detail: JSON.stringify(values),
      },
    });

    return ok({ company });
  });
}
