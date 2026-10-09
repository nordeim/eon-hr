import { db } from "@/lib/db";
import { SurveyAnalytics, type ResponseRow, type SurveyAnalyticsData, type SurveyOption } from "./analytics";

export default async function SurveyAnalyticsPage() {
  const [surveys, responses] = await Promise.all([
    db.survey.findMany({
      select: { id: true, title: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    db.surveyResponse.findMany({
      select: {
        surveyId: true,
        sentiment: true,
        submittedAt: true,
        survey: { select: { title: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const now = new Date();
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(2)}`);
  }

  const surveyOptions: SurveyOption[] = surveys.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
  }));

  const responseRows: ResponseRow[] = responses.map((r) => ({
    surveyId: r.surveyId,
    surveyTitle: r.survey.title,
    sentiment: r.sentiment,
    submittedAt: r.submittedAt.toISOString(),
  }));

  const data: SurveyAnalyticsData = {
    surveys: surveyOptions,
    responses: responseRows,
    monthLabels,
  };

  return <SurveyAnalytics data={data} />;
}
