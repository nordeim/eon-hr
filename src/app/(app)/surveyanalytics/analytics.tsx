"use client";

import * as React from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import {
  SentimentDistributionBar,
  SentimentTrendLine,
  SurveyComparisonBar,
  type SentimentSlice,
  type SurveyPoint,
  type TrendPoint,
} from "./charts";

export interface SurveyOption {
  id: string;
  title: string;
  status: string;
}

export interface ResponseRow {
  surveyId: string;
  surveyTitle: string;
  sentiment: number | null;
  submittedAt: string; // ISO
}

export interface SurveyAnalyticsData {
  surveys: SurveyOption[];
  responses: ResponseRow[];
  monthLabels: string[]; // last 6 months, e.g. "May 26"
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadCsv(filename: string, rows: (string | number | null)[][]): void {
  const csv = rows.map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function truncate(name: string, max = 16): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function SurveyAnalytics({ data }: { data: SurveyAnalyticsData }) {
  const toast = useToast();
  const [selected, setSelected] = React.useState<string>("all");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [insights, setInsights] = React.useState<string[] | null>(null);

  const responses = React.useMemo(
    () => (selected === "all" ? data.responses : data.responses.filter((r) => r.surveyId === selected)),
    [data.responses, selected]
  );

  const scored = responses.filter((r): r is ResponseRow & { sentiment: number } => r.sentiment !== null);
  const avgSentiment =
    scored.length > 0 ? Math.round(scored.reduce((sum, r) => sum + r.sentiment, 0) / scored.length) : null;
  const positiveRate =
    scored.length > 0 ? Math.round((scored.filter((r) => r.sentiment > 0).length / scored.length) * 100) : 0;
  const activeSurveys =
    selected === "all"
      ? data.surveys.filter((s) => s.status === "active").length
      : data.surveys.filter((s) => s.id === selected && s.status === "active").length;

  const distribution: SentimentSlice[] = [
    {
      name: "Positive",
      value: scored.filter((r) => r.sentiment > 0).length,
      color: "#10b981",
    },
    {
      name: "Neutral",
      value: responses.filter((r) => r.sentiment === null || r.sentiment === 0).length,
      color: "#f59e0b",
    },
    {
      name: "Negative",
      value: scored.filter((r) => r.sentiment < 0).length,
      color: "#ef4444",
    },
  ];

  const trend: TrendPoint[] = data.monthLabels.map((label) => {
    const monthKey = label.slice(0, 3); // "May"
    const monthResponses = scored.filter((r) => {
      const d = new Date(r.submittedAt);
      return d.toLocaleString("en-US", { month: "short" }) === monthKey && String(d.getFullYear()).slice(2) === label.slice(4);
    });
    return {
      month: label,
      sentiment:
        monthResponses.length > 0
          ? Math.round(monthResponses.reduce((sum, r) => sum + r.sentiment, 0) / monthResponses.length)
          : null,
    };
  });

  const surveysInScope =
    selected === "all" ? data.surveys : data.surveys.filter((s) => s.id === selected);
  const bySurvey: SurveyPoint[] = surveysInScope.map((s) => {
    const rows = scored.filter((r) => r.surveyId === s.id);
    return {
      name: truncate(s.title),
      responses: data.responses.filter((r) => r.surveyId === s.id).length,
      sentiment: rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.sentiment, 0) / rows.length) : 0,
    };
  });

  function exportResponses() {
    if (responses.length === 0) {
      toast.toast({ title: "Nothing to export", description: "No survey responses match the filter.", variant: "info" });
      return;
    }
    const rows: (string | number | null)[][] = [
      ["Survey", "Submitted At", "Sentiment"],
      ...responses.map((r) => [r.surveyTitle, r.submittedAt.slice(0, 10), r.sentiment]),
    ];
    downloadCsv("survey-responses.csv", rows);
    toast.toast({
      title: "Export ready",
      description: `${responses.length} responses exported to CSV.`,
      variant: "success",
    });
  }

  function runAnalysis() {
    setAnalyzing(true);
    // Deterministic local analysis — no external calls.
    window.setTimeout(() => {
      setInsights(buildInsights());
      setAnalyzing(false);
      toast.toast({
        title: "AI analysis complete",
        description: "Insights are ready below.",
        variant: "success",
      });
    }, 600);
  }

  function buildInsights(): string[] {
    const out: string[] = [];
    if (responses.length === 0) {
      return [
        "No responses available yet, so engagement cannot be measured.",
        "Publish an active survey and collect at least a few responses to unlock sentiment insights.",
      ];
    }
    const avg = avgSentiment ?? 0;
    const level =
      avg >= 30 ? "strongly positive" : avg >= 10 ? "positive" : avg > -10 ? "neutral / mixed" : "negative";
    out.push(
      `Analyzed ${responses.length} responses — overall sentiment is ${level} (${avg >= 0 ? "+" : ""}${avg} on a -100..100 scale).`
    );
    out.push(
      `${distribution[0].value} positive · ${distribution[1].value} neutral · ${distribution[2].value} negative responses (${positiveRate}% positive rate).`
    );
    const withMonths = trend.filter((t) => t.sentiment !== null);
    if (withMonths.length >= 2) {
      const first = withMonths[0]!.sentiment ?? 0;
      const last = withMonths[withMonths.length - 1]!.sentiment ?? 0;
      const direction = last > first ? "improving" : last < first ? "declining" : "stable";
      out.push(`Sentiment is ${direction}: ${first >= 0 ? "+" : ""}${first} → ${last >= 0 ? "+" : ""}${last} across the observed months.`);
    }
    const best = [...bySurvey].sort((a, b) => b.sentiment - a.sentiment)[0];
    if (best && bySurvey.length > 1) {
      out.push(`"${best.name}" has the strongest sentiment (${best.sentiment >= 0 ? "+" : ""}${best.sentiment}) with ${best.responses} responses.`);
    }
    out.push(
      scored.length < 5
        ? "Sample size is small — treat these signals as directional and keep collecting responses."
        : "Recommendation: double down on the drivers behind positive feedback and follow up on the themes in negative responses."
    );
    return out;
  }

  const latest = [...responses].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 1)[0];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Survey Analytics"
        subtitle="AI-powered employee engagement insights"
        actions={
          <>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-[200px]" aria-label="Filter by survey">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surveys</SelectItem>
                {data.surveys.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {truncate(s.title, 24)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportResponses}>
              <Download aria-hidden="true" />
              Export
            </Button>
            <Button onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles aria-hidden="true" />
              )}
              Run AI Analysis
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Responses" value={responses.length} />
        <StatCard
          label="Avg Sentiment"
          value={avgSentiment === null ? "0%" : `${avgSentiment > 0 ? "+" : ""}${avgSentiment}%`}
        />
        <StatCard label="Active Surveys" value={activeSurveys} />
        <StatCard label="Positive Rate" value={`${positiveRate}%`} />
      </div>

      {insights ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
              AI Insights
            </CardTitle>
            <CardDescription>
              {latest ? `Last response ${formatDate(latest.submittedAt)}` : "No responses yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {insights.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {data.surveys.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="No surveys yet"
              description="Create a survey and collect responses to unlock sentiment analytics."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Positive, neutral and negative response counts</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <EmptyState title="No data yet" description="No responses match the selected survey." />
                ) : (
                  <SentimentDistributionBar data={distribution} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend Over Time</CardTitle>
                <CardDescription>Average sentiment per month (-100 to 100)</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <EmptyState title="No data yet" description="Responses will plot the trend here." />
                ) : (
                  <SentimentTrendLine data={trend} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response Count &amp; Avg Sentiment by Survey</CardTitle>
              <CardDescription>Participation and sentiment side by side</CardDescription>
            </CardHeader>
            <CardContent>
              {bySurvey.every((s) => s.responses === 0) ? (
                <EmptyState title="No data yet" description="Surveys without responses appear once feedback arrives." />
              ) : (
                <SurveyComparisonBar data={bySurvey} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
