import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// /api/documents — Document Tracker module.
// GET    → documents (status computed live from expiryDate), stats, employees.
// POST   → add a document (admin/hr).
// PATCH  ?id= → update (status recomputed when expiry changes).
// DELETE ?id= → delete the document and its compliance alerts.

const DOC_TYPES = ["contract", "id", "passport", "visa", "certificate", "medical", "other"] as const;

const DocInput = z.object({
  employeeId: z.string().trim().min(1, "Employee is required"),
  name: z.string().trim().min(1, "Document name is required").max(140),
  type: z.enum(DOC_TYPES).default("other"),
  issueDate: z.string().trim().optional().or(z.literal("")),
  expiryDate: z.string().trim().optional().or(z.literal("")),
  fileUrl: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["pending_upload"]).optional(),
});

const DocPatch = DocInput.partial();

function statusFromExpiry(expiry: Date | string | null): "valid" | "expiring" | "expired" {
  if (!expiry) return "valid";
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}

function daysToExpiry(expiry: Date | string | null): number | null {
  if (!expiry) return null;
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000);
}

function fullName(e: { firstName: string; lastName: string }): string {
  return `${e.firstName} ${e.lastName}`.trim();
}

const DOC_SELECT = {
  id: true,
  employeeId: true,
  name: true,
  type: true,
  fileUrl: true,
  issueDate: true,
  expiryDate: true,
  status: true,
  notes: true,
  createdAt: true,
  employee: { select: { firstName: true, lastName: true, employeeId: true } },
} as const;

// GET /api/documents
export async function GET() {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const [documents, employees] = await Promise.all([
      db.document.findMany({ orderBy: { createdAt: "desc" }, select: DOC_SELECT }),
      db.employee.findMany({
        select: { id: true, employeeId: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
    ]);

    const items = documents.map((d) => ({
      id: d.id,
      employeeId: d.employeeId,
      employeeName: fullName(d.employee),
      employeeCode: d.employee.employeeId,
      name: d.name,
      type: d.type,
      fileUrl: d.fileUrl,
      issueDate: d.issueDate,
      expiryDate: d.expiryDate,
      notes: d.notes,
      status: d.status === "pending_upload" ? "pending_upload" : statusFromExpiry(d.expiryDate),
      daysToExpiry: daysToExpiry(d.expiryDate),
    }));

    const stats = {
      total: items.length,
      valid: items.filter((d) => d.status === "valid").length,
      expiring: items.filter((d) => d.status === "expiring").length,
      expired: items.filter((d) => d.status === "expired").length,
      pendingUpload: items.filter((d) => d.status === "pending_upload").length,
    };

    return ok({
      documents: items,
      stats,
      employees: employees.map((e) => ({ id: e.id, name: fullName(e), code: e.employeeId })),
    });
  });
}

// POST /api/documents
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, DocInput);
    if (!data) return bad;

    const employee = await db.employee.findUnique({ where: { id: data.employeeId }, select: { id: true } });
    if (!employee) return err("NOT_FOUND", "Employee not found");

    const issueDate = data.issueDate ? new Date(`${data.issueDate}T00:00:00`) : null;
    const expiryDate = data.expiryDate ? new Date(`${data.expiryDate}T00:00:00`) : null;
    if (data.issueDate && Number.isNaN(issueDate!.getTime())) {
      return err("VALIDATION", "Enter a valid issue date");
    }
    if (data.expiryDate && Number.isNaN(expiryDate!.getTime())) {
      return err("VALIDATION", "Enter a valid expiry date");
    }

    const document = await db.document.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl || null,
        issueDate,
        expiryDate,
        notes: data.notes || null,
        status: data.status === "pending_upload" ? "pending_upload" : statusFromExpiry(expiryDate),
      },
      select: { id: true, name: true },
    });
    return ok({ document });
  });
}

// PATCH /api/documents?id=xxx
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Document id is required");

    const { data, response: bad } = await parseBody(req, DocPatch);
    if (!data) return bad;

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Document not found");

    if (data.employeeId && data.employeeId !== existing.employeeId) {
      const employee = await db.employee.findUnique({ where: { id: data.employeeId }, select: { id: true } });
      if (!employee) return err("NOT_FOUND", "Employee not found");
    }

    const issueDate =
      data.issueDate !== undefined ? (data.issueDate ? new Date(`${data.issueDate}T00:00:00`) : null) : undefined;
    const expiryDate =
      data.expiryDate !== undefined ? (data.expiryDate ? new Date(`${data.expiryDate}T00:00:00`) : null) : undefined;
    if (issueDate && Number.isNaN(issueDate.getTime())) return err("VALIDATION", "Enter a valid issue date");
    if (expiryDate && Number.isNaN(expiryDate.getTime())) return err("VALIDATION", "Enter a valid expiry date");

    // status: explicit pending_upload wins; otherwise recompute on expiry change
    let status: string | undefined;
    if (data.status !== undefined) status = data.status;
    else if (expiryDate !== undefined) status = statusFromExpiry(expiryDate);

    await db.document.update({
      where: { id },
      data: {
        ...(data.employeeId !== undefined ? { employeeId: data.employeeId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl || null } : {}),
        ...(issueDate !== undefined ? { issueDate } : {}),
        ...(expiryDate !== undefined ? { expiryDate } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/documents?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Document id is required");

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Document not found");

    await db.complianceAlert.deleteMany({ where: { documentId: id } });
    await db.document.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
