import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

const JobInput = z.object({
  title: z.string().trim().min(1, "Job title is required").max(120),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.enum(["full_time", "part_time", "contract", "intern"]).default("full_time"),
  status: z.enum(["open", "paused", "closed"]).default("open"),
  openings: z.number().int().min(1, "At least one opening").max(99).default(1),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

// GET /api/jobs?status=
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const status = req.nextUrl.searchParams.get("status") ?? "all";
    const jobs = await db.jobPosting.findMany({
      where: status !== "all" ? { status } : {},
      include: { _count: { select: { candidates: true } } },
      orderBy: { postedAt: "desc" },
    });
    return ok({ jobs });
  });
}

// POST /api/jobs — post a new job.
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, JobInput);
    if (!data) return bad;

    const job = await db.jobPosting.create({
      data: {
        title: data.title,
        department: data.department || null,
        location: data.location || null,
        type: data.type,
        status: data.status,
        openings: data.openings,
        description: data.description || null,
      },
      include: { _count: { select: { candidates: true } } },
    });
    return ok({ job });
  });
}

// PATCH /api/jobs?id=xxx — edit posting and/or change status.
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Job id is required");

    const { data, response: bad } = await parseBody(req, JobInput.partial());
    if (!data) return bad;

    const existing = await db.jobPosting.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Job posting not found");

    const job = await db.jobPosting.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.department !== undefined ? { department: data.department || null } : {}),
        ...(data.location !== undefined ? { location: data.location || null } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.openings !== undefined ? { openings: data.openings } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
      },
      include: { _count: { select: { candidates: true } } },
    });
    return ok({ job });
  });
}

// DELETE /api/jobs?id=xxx — candidates cascade with the posting.
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Job id is required");

    const existing = await db.jobPosting.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Job posting not found");

    await db.jobPosting.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
