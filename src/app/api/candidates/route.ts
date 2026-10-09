import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, requireRole, parseBody } from "@/lib/api";

// ---------------------------------------------------------------------------
// Deterministic "AI" CV scoring — a keyword-overlap heuristic. No randomness,
// no external calls: the same CV + job always produce the same score.
// ---------------------------------------------------------------------------

const SKILL_KEYWORDS = [
  "javascript", "typescript", "react", "next", "node", "python", "java", "csharp", "dotnet",
  "sql", "postgresql", "mysql", "mongodb", "aws", "azure", "docker", "kubernetes", "git",
  "rest", "graphql", "api", "css", "html", "tailwind", "figma", "excel", "powerpoint",
  "communication", "leadership", "teamwork", "collaboration", "agile", "scrum", "kanban",
  "management", "mentoring", "coaching", "negotiation", "presentation", "reporting",
  "marketing", "sales", "finance", "accounting", "recruitment", "onboarding", "payroll",
  "design", "testing", "automation", "devops", "security", "analytics", "research",
];

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "will", "are", "was", "you",
  "your", "our", "their", "they", "who", "what", "when", "where", "how", "why", "all",
  "any", "can", "has", "had", "not", "but", "out", "use", "using", "work", "working",
  "role", "team", "teams", "job", "jobs", "company", "companies", "years", "year",
  "looking", "join", "joining", "seeking", "candidate", "candidates", "experience",
  "experienced", "strong", "good", "great", "excellent", "must", "should", "plus",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length >= 3);
}

function containsToken(tokens: string[], keyword: string): boolean {
  if (tokens.includes(keyword)) return true;
  return tokens.some((t) => (t.startsWith(keyword) || keyword.startsWith(t)) && Math.min(t.length, keyword.length) >= 4);
}

interface Scored {
  aiScore: number;
  skillsMatch: number;
  matchedKeywords: string[];
}

function scoreCv(
  job: { title: string; department: string | null; description: string | null },
  cvText: string
): Scored {
  const cvTokens = tokenize(cvText);
  const jobText = `${job.title} ${job.department ?? ""} ${job.description ?? ""}`;
  const jobKeywords = [...new Set(tokenize(jobText).filter((t) => !STOPWORDS.has(t)))].slice(0, 24);

  const matchedKeywords = jobKeywords.filter((k) => containsToken(cvTokens, k));
  const skillsFound = SKILL_KEYWORDS.filter((s) => containsToken(cvTokens, s));

  // Skills match: share of job keywords present in the CV; when the posting
  // carries no meaningful keywords, fall back to recognized skill density.
  const skillsMatch =
    jobKeywords.length > 0
      ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
      : Math.min(90, skillsFound.length * 9);

  // Experience signals (deterministic).
  const years = [...cvText.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi)].map((m) => Number(m[1]));
  const maxYears = years.length > 0 ? Math.max(...years) : 0;
  const wordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const seniorHits = (cvText.toLowerCase().match(/\b(senior|lead|manager|head|director|architect|founder)\b/g) ?? []).length;

  const score = Math.max(
    5,
    Math.min(
      98,
      Math.round(
        skillsMatch * 0.6 +
          Math.min(18, maxYears * 2) +
          Math.min(10, seniorHits * 2) +
          Math.min(10, Math.floor(wordCount / 60))
      )
    )
  );

  return { aiScore: score, skillsMatch: Math.min(100, skillsMatch), matchedKeywords };
}

// ---------------------------------------------------------------------------

const CandidateInput = z.object({
  jobPostingId: z.string().min(1, "Job posting is required"),
  name: z.string().trim().min(1, "Candidate name is required").max(120),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  cvText: z.string().min(1, "Paste the CV text to analyze").max(20_000).optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const CandidatePatch = z.object({
  stage: z.enum(["applied", "interviewing", "offer", "hired", "rejected"]).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const STAGES = ["applied", "interviewing", "offer", "hired", "rejected"] as const;

// GET /api/candidates?jobId=&stage=&sort=aiScore
export async function GET(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const jobId = req.nextUrl.searchParams.get("jobId") ?? "";
    const stage = req.nextUrl.searchParams.get("stage") ?? "all";
    const sort = req.nextUrl.searchParams.get("sort") ?? "default";

    const candidates = await db.candidate.findMany({
      where: {
        AND: [jobId ? { jobPostingId: jobId } : {}, stage !== "all" ? { stage } : {}],
      },
      include: { jobPosting: { select: { id: true, title: true, department: true } } },
      orderBy: { appliedAt: "desc" },
    });

    if (sort === "aiScore") {
      // Sort by AI score descending; unscored candidates sink to the bottom.
      candidates.sort((a, b) => (b.aiScore ?? -1) - (a.aiScore ?? -1));
    }

    return ok({ candidates, stages: STAGES });
  });
}

// POST /api/candidates — add an applicant, or analyze a CV: when cvText is
// present the deterministic scorer fills aiScore + skillsMatch server-side.
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, CandidateInput);
    if (!data) return bad;

    const job = await db.jobPosting.findUnique({
      where: { id: data.jobPostingId },
      select: { id: true, title: true, department: true, description: true },
    });
    if (!job) return err("NOT_FOUND", "Job posting not found");

    let aiScore: number | undefined;
    let skillsMatch: number | undefined;
    let matchedKeywords: string[] = [];
    if (data.cvText) {
      const scored = scoreCv(job, data.cvText);
      aiScore = scored.aiScore;
      skillsMatch = scored.skillsMatch;
      matchedKeywords = scored.matchedKeywords;
    }

    const candidate = await db.candidate.create({
      data: {
        jobPostingId: data.jobPostingId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cvText: data.cvText ?? null,
        stage: "applied",
        aiScore: aiScore ?? null,
        skillsMatch: skillsMatch ?? null,
        notes: data.notes || null,
      },
      include: { jobPosting: { select: { id: true, title: true, department: true } } },
    });

    return ok({ candidate, matchedKeywords });
  });
}

// PATCH /api/candidates?id=xxx — move through the pipeline / edit notes.
export async function PATCH(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Candidate id is required");

    const { data, response: bad } = await parseBody(req, CandidatePatch);
    if (!data) return bad;
    if (!data.stage && data.notes === undefined) {
      return err("VALIDATION", "Provide a stage or notes");
    }

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Candidate not found");

    const candidate = await db.candidate.update({
      where: { id },
      data: {
        ...(data.stage ? { stage: data.stage } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      },
      include: { jobPosting: { select: { id: true, title: true, department: true } } },
    });
    return ok({ candidate });
  });
}

// DELETE /api/candidates?id=xxx
export async function DELETE(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireRole(["admin", "hr"]);
    if (!user) return response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return err("VALIDATION", "Candidate id is required");

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Candidate not found");

    await db.candidate.delete({ where: { id } });
    return ok({ deleted: true });
  });
}
