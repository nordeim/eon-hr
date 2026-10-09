import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// Engagement surveys — create, activate/close, delete, with response stats.

const SurveyInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  questions: z
    .array(z.string().trim().min(1, "Question text is required").max(300))
    .min(1, "Add at least one question")
    .max(20, "A survey can have at most 20 questions"),
});

const SurveyPatch = z.object({
  status: z.enum(["draft", "active", "closed"], { message: "Invalid survey status" }),
});

interface QuestionShape {
  id: string;
  text: string;
  type: string;
}

function parseQuestions(raw: string): QuestionShape[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((q): q is Record<string, unknown> => typeof q === "object" && q !== null)
      .map((q, i) => ({
        id: typeof q.id === "string" ? q.id : `q${i + 1}`,
        text: typeof q.text === "string" ? q.text : String(q.text ?? ""),
        type: typeof q.type === "string" ? q.type : "text",
      }))
      .filter((q) => q.text.length > 0);
  } catch {
    return [];
  }
}

function empName(emp: { firstName: string; lastName: string; employeeId: string }): string {
  return [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.employeeId;
}

// GET /api/surveys
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;
    void req;

    const surveys = await db.survey.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        responses: {
          orderBy: { submittedAt: "desc" },
          include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
        },
      },
    });

    return ok({
      surveys: surveys.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        questions: parseQuestions(s.questions),
        startDate: s.startDate,
        endDate: s.endDate,
        createdAt: s.createdAt,
        responses: s.responses.map((r) => ({
          id: r.id,
          sentiment: r.sentiment,
          submittedAt: r.submittedAt,
          answers: r.answers,
          employeeName: empName(r.employee),
        })),
      })),
    });
  });
}

// POST /api/surveys — create a draft survey with a question list
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, SurveyInput);
    if (!data) return bad;

    const survey = await db.survey.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: "draft",
        questions: JSON.stringify(
          data.questions.map((text, i) => ({ id: `q${i + 1}`, text, type: "text" }))
        ),
      },
    });
    return ok({ survey: { id: survey.id } });
  });
}

// PATCH /api/surveys?id= — activate / close / reopen as draft
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Survey id is required");

    const { data, response: bad } = await parseBody(req, SurveyPatch);
    if (!data) return bad;

    const existing = await db.survey.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Survey not found");

    await db.survey.update({
      where: { id },
      data: {
        status: data.status,
        startDate: data.status === "active" && !existing.startDate ? new Date() : existing.startDate,
        endDate: data.status === "closed" ? new Date() : null,
      },
    });
    return ok({ updated: true });
  });
}

// DELETE /api/surveys?id= — removes the survey and its responses (cascade)
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Survey id is required");

    const existing = await db.survey.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Survey not found");

    await db.survey.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
