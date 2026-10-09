import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";
import { EmployeeInput } from "@/lib/validation";

/** "" -> null for optional strings, ISO strings -> Date or null. */
function text(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
}
function date(v: string | undefined | null): Date | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

// GET /api/employees?search=&status=&type=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const type = req.nextUrl.searchParams.get("type") ?? "all";

    const employees = await db.employee.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { email: { contains: search } },
                  { jobTitle: { contains: search } },
                ],
              }
            : {},
          status !== "all" ? { employmentStatus: status } : {},
          type !== "all" ? { employmentType: type } : {},
        ],
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        departmentId: true,
        managerId: true,
        employmentStatus: true,
        employmentType: true,
        startDate: true,
        baseSalary: true,
        // wizard fields (edit mode round-trips)
        privateEmail: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        nationalId: true,
        iqamaNumber: true,
        iqamaExpiry: true,
        contractType: true,
        contractStart: true,
        bankName: true,
        iban: true,
        gosiNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ employees });
  });
}

/**
 * Collision-safe EMP-XXXX generator: takes the MAX numeric suffix across all
 * rows (+1) instead of count()+1 — deletions leave count gaps that would
 * collide with existing ids (P2002). Retries once if a race still collides.
 */
async function nextEmployeeId(): Promise<string> {
  const rows = await db.employee.findMany({ select: { employeeId: true } });
  const max = rows.reduce((m, r) => {
    const n = Number.parseInt(r.employeeId.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `EMP-${String(max + 1).padStart(4, "0")}`;
}

// POST /api/employees — full wizard payload.
// When onboardingTemplateId is set, an OnboardingProcess is kicked off with
// the template's tasks (mirrors the reference wizard step 4).
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, EmployeeInput);
    if (!data) return bad;

    const existing = await db.employee.findUnique({ where: { email: data.email } });
    if (existing) return err("CONFLICT", "An employee with this email already exists");

    // Optional relations must exist when supplied.
    if (data.departmentId) {
      const dept = await db.department.findUnique({ where: { id: data.departmentId } });
      if (!dept) return err("VALIDATION", "Selected department does not exist");
    }
    if (data.managerId) {
      const mgr = await db.employee.findUnique({ where: { id: data.managerId } });
      if (!mgr) return err("VALIDATION", "Selected manager does not exist");
    }
    if (data.onboardingTemplateId) {
      const tpl = await db.onboardingTemplate.findUnique({ where: { id: data.onboardingTemplateId } });
      if (!tpl) return err("VALIDATION", "Selected onboarding template does not exist");
    }

    const createData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: text(data.phone),
      jobTitle: text(data.jobTitle),
      departmentId: text(data.departmentId),
      managerId: text(data.managerId),
      employmentStatus: data.employmentStatus,
      employmentType: data.employmentType,
      startDate: date(data.startDate),
      baseSalary: data.baseSalary,
      // wizard step 1
      privateEmail: text(data.privateEmail),
      dateOfBirth: date(data.dateOfBirth),
      gender: text(data.gender),
      nationality: text(data.nationality),
      nationalId: text(data.nationalId),
      iqamaNumber: text(data.iqamaNumber),
      iqamaExpiry: date(data.iqamaExpiry),
      // wizard step 3
      contractType: text(data.contractType),
      contractStart: date(data.contractStart) ?? date(data.startDate),
      bankName: text(data.bankName),
      iban: text(data.iban),
      gosiNumber: text(data.gosiNumber),
    };

    let employee: { id: string; employeeId: string } | null = null;
    for (let attempt = 0; attempt < 2 && !employee; attempt++) {
      try {
        employee = await db.employee.create({
          data: { ...createData, employeeId: await nextEmployeeId() },
          select: { id: true, employeeId: true },
        });
      } catch (e) {
        const code = (e as { code?: string }).code;
        if (code === "P2002" && attempt === 0) continue; // id race — retry
        throw e;
      }
    }
    if (!employee) return err("INTERNAL", "Could not allocate an employee id");

    if (data.onboardingTemplateId) {
      const tpl = await db.onboardingTemplate.findUnique({
        where: { id: data.onboardingTemplateId },
      });
      if (tpl) {
        let tasks: { title: string; description?: string }[] = [];
        try {
          tasks = JSON.parse(tpl.tasks ?? "[]") as { title: string; description?: string }[];
        } catch {
          tasks = [];
        }
        const checklist = tasks.map((t) => ({ title: t.title, done: false }));
        await db.onboardingProcess.create({
          data: {
            employeeId: employee.id,
            templateId: tpl.id,
            status: "in_progress",
            tasks: JSON.stringify(checklist),
          },
        });
      }
    }

    return ok({ employee });
  });
}

// PATCH /api/employees?id=xxx
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Employee id is required");
    const { data, response: bad } = await parseBody(req, EmployeeInput.partial());
    if (!data) return bad;

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Employee not found");

    if (data.email && data.email !== existing.email) {
      const dupe = await db.employee.findUnique({ where: { email: data.email } });
      if (dupe) return err("CONFLICT", "Another employee already uses this email");
    }

    // Same relation pre-validation as POST — a bad id should be a VALIDATION
    // error, not a Prisma FK crash (which would surface as INTERNAL).
    if (data.departmentId && data.departmentId !== existing.departmentId) {
      const dept = await db.department.findUnique({ where: { id: data.departmentId } });
      if (!dept) return err("VALIDATION", "Selected department does not exist");
    }
    if (data.managerId && data.managerId !== existing.managerId) {
      const mgr = await db.employee.findUnique({ where: { id: data.managerId } });
      if (!mgr) return err("VALIDATION", "Selected manager does not exist");
    }

    await db.employee.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: text(data.phone) } : {}),
        ...(data.jobTitle !== undefined ? { jobTitle: text(data.jobTitle) } : {}),
        ...(data.departmentId !== undefined ? { departmentId: text(data.departmentId) } : {}),
        ...(data.managerId !== undefined ? { managerId: text(data.managerId) } : {}),
        ...(data.employmentStatus !== undefined ? { employmentStatus: data.employmentStatus } : {}),
        ...(data.employmentType !== undefined ? { employmentType: data.employmentType } : {}),
        ...(data.startDate !== undefined ? { startDate: date(data.startDate) } : {}),
        ...(data.baseSalary !== undefined ? { baseSalary: data.baseSalary } : {}),
        ...(data.privateEmail !== undefined ? { privateEmail: text(data.privateEmail) } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: date(data.dateOfBirth) } : {}),
        ...(data.gender !== undefined ? { gender: text(data.gender) } : {}),
        ...(data.nationality !== undefined ? { nationality: text(data.nationality) } : {}),
        ...(data.nationalId !== undefined ? { nationalId: text(data.nationalId) } : {}),
        ...(data.iqamaNumber !== undefined ? { iqamaNumber: text(data.iqamaNumber) } : {}),
        ...(data.iqamaExpiry !== undefined ? { iqamaExpiry: date(data.iqamaExpiry) } : {}),
        ...(data.contractType !== undefined ? { contractType: text(data.contractType) } : {}),
        ...(data.contractStart !== undefined ? { contractStart: date(data.contractStart) } : {}),
        ...(data.bankName !== undefined ? { bankName: text(data.bankName) } : {}),
        ...(data.iban !== undefined ? { iban: text(data.iban) } : {}),
        ...(data.gosiNumber !== undefined ? { gosiNumber: text(data.gosiNumber) } : {}),
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/employees?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Employee id is required");
    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Employee not found");

    await db.employee.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
