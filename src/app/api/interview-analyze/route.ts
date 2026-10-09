import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, err, guard, requireUser, parseBody } from "@/lib/api";

// Interview analysis — deterministic, local heuristics on the notes text.
// No external AI calls, no randomness: the same notes always yield the same
// analysis. Signals used: length, action verbs, positive/negative keywords,
// question marks.

const ACTION_VERBS = [
  "led", "delivered", "achieved", "improved", "managed", "built", "designed", "launched",
  "mentored", "resolved", "automated", "increased", "reduced", "shipped", "coordinated",
  "presented", "negotiated", "trained", "owned", "drove",
];

const POSITIVE_WORDS = [
  "excellent", "strong", "great", "impressive", "outstanding", "confident", "articulate",
  "prepared", "knowledgeable", "skilled", "proactive", "motivated", "enthusiastic",
];

const CONCERN_WORDS = [
  "weak", "late", "missed", "poor", "lacks", "concern", "struggled", "unclear", "vague",
  "hesitant", "unprepared", "conflict", "turnover", "overwhelmed", "disorganized",
];

const AnalyzeInput = z.object({
  candidateId: z.string().optional(),
  candidateName: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().min(1, "Interview notes are required").max(20_000),
});

interface Analysis {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  questions: string[];
  summary: string;
  wordCount: number;
}

function analyze(notes: string, candidateName: string): Analysis {
  const lower = notes.toLowerCase();
  const words = lower.split(/[^a-z0-9']+/).filter(Boolean);
  const wordCount = words.length;

  const foundVerbs = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\w*\\b`).test(lower));
  const foundPositives = POSITIVE_WORDS.filter((p) => new RegExp(`\\b${p}\\b`).test(lower));
  const foundConcerns = CONCERN_WORDS.filter((c) => new RegExp(`\\b${c}\\w*\\b`).test(lower));
  const questionCount = (notes.match(/\?/g) ?? []).length;

  const score = Math.max(
    5,
    Math.min(
      98,
      Math.round(
        30 +
          foundVerbs.length * 7 +
          foundPositives.length * 5 -
          foundConcerns.length * 8 +
          Math.min(15, Math.floor(wordCount / 40))
      )
    )
  );

  const name = candidateName || "The candidate";

  const strengths: string[] = [];
  if (foundVerbs.length > 0) {
    strengths.push(
      `Ownership signals — the notes mention ${foundVerbs.slice(0, 3).map((v) => `“${v}”`).join(", ")}.`
    );
  }
  if (foundPositives.length > 0) {
    strengths.push(
      `Strong impression — described as ${foundPositives.slice(0, 3).map((p) => `“${p}”`).join(", ")}.`
    );
  }
  if (wordCount >= 120) {
    strengths.push(`Detailed notes (${wordCount} words) — enough evidence to compare against other candidates.`);
  }
  if (strengths.length === 0) {
    strengths.push("Notes are brief — record concrete examples in the next interview to surface strengths.");
  }

  const weaknesses: string[] = [];
  if (foundConcerns.length > 0) {
    weaknesses.push(
      `Flags raised — the notes include ${foundConcerns.slice(0, 3).map((c) => `“${c}”`).join(", ")}.`
    );
  }
  if (foundVerbs.length === 0) {
    weaknesses.push("No action verbs found — no evidence of leading or delivering concrete outcomes.");
  }
  if (wordCount < 60) {
    weaknesses.push("Very short notes — the assessment may be based on insufficient evidence.");
  }
  if (questionCount < 2) {
    weaknesses.push("Few questions were asked — deep technical/behavioral probing may be missing.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("No red flags detected in the notes — probe deeper in the next round to be sure.");
  }

  const questions: string[] = [];
  if (foundVerbs.length === 0) {
    questions.push("Walk me through a project you personally led end-to-end — what was your specific contribution?");
  } else {
    questions.push(`You mentioned you ${foundVerbs[0]} something — what was the measurable impact?`);
  }
  if (foundConcerns.length > 0) {
    questions.push(`The notes flag “${foundConcerns[0]}” — can you describe that situation and how you handled it?`);
  } else {
    questions.push("Tell me about a time a project went wrong — what did you change afterwards?");
  }
  questions.push("Which skill on your CV are you weakest in, and what are you doing about it?");
  if (questionCount < 2) {
    questions.push("What questions do you have about the role and how success is measured here?");
  }

  const verdict =
    score >= 75 ? "Recommend moving forward" : score >= 50 ? "Hold — needs another round" : "Do not advance";

  const summary = `${name} scored ${score}/100 on the interview notes. ${verdict}. ${
    wordCount
  } words of notes, ${foundVerbs.length} action-verb signal(s), ${
    foundConcerns.length > 0 ? `${foundConcerns.length} concern(s) flagged` : "no concerns flagged"
  }.`;

  return { score, verdict, strengths, weaknesses, questions, summary, wordCount };
}

// POST /api/interview-analyze {candidateId?, candidateName?, notes}
export async function POST(req: NextRequest) {
  return guard(async () => {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { data, response: bad } = await parseBody(req, AnalyzeInput);
    if (!data) return bad;

    let candidateName = data.candidateName ?? "";
    if (data.candidateId) {
      const candidate = await db.candidate.findUnique({
        where: { id: data.candidateId },
        select: { name: true },
      });
      if (!candidate) return err("NOT_FOUND", "Candidate not found");
      candidateName = candidate.name;
    }

    const analysis = analyze(data.notes, candidateName);
    return ok({ analysis, candidate: candidateName || null });
  });
}
