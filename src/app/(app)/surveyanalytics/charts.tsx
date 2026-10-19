"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  DefaultLegendContent,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface SentimentSlice {
  name: "Positive" | "Neutral" | "Negative";
  value: number;
  color: string;
}

export interface TrendPoint {
  month: string;
  sentiment: number | null;
}

export interface SurveyPoint {
  name: string;
  responses: number;
  sentiment: number; // avg, -100..100
}

export function SentimentDistributionBar({ data }: { data: SentimentSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Bar dataKey="value" name="Responses" radius={[4, 4, 0, 0]} maxBarSize={64}>
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SentimentTrendLine({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis domain={[-100, 100]} width={48} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sentiment"
          name="Avg sentiment"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SurveyComparisonBar({ data }: { data: SurveyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
        <YAxis yAxisId="sentiment" orientation="right" domain={[-100, 100]} width={48} />
        <YAxis yAxisId="count" allowDecimals={false} width={36} />
        <Tooltip />
        {/* Session 61 (R61-P): REF's legend (live-measured) — the
            Responses bar is blue-500 #3b82f6 (NOT blue-600) + the
            second series named "Avg Sentiment %" (the DOM order
            [Responses, Avg Sentiment %]). */}
        {/* Session 61 (R61-P): REF's legend (live-measured) — the
            Responses bar is blue-500 #3b82f6 (NOT blue-600) + the second
            series named "Avg Sentiment %", DOM order [Responses,
            Avg Sentiment %]. recharts 3's auto-legend order ignores the
            Bar mount order (measured both arrangements — it stayed
            [Avg …, Responses]), so the payload pins it explicitly. */}
        {/* Session 61 (R61-P): REF's legend (live-measured) — the
            Responses bar is blue-500 #3b82f6 (NOT blue-600) + the second
            series named "Avg Sentiment %", DOM order [Responses,
            Avg Sentiment %]. recharts 3's auto-legend order ignores
            BOTH the Bar mount order and the YAxis declaration order
            (measured both arrangements — it stayed [Avg …, Responses]),
            so the default renderer is reused with the payload reordered. */}
        <Legend
          content={(props) => {
            const payload = props.payload ?? [];
            const byValue = new Map(payload.map((entry) => [entry.value, entry]));
            const ordered = [byValue.get("Responses"), byValue.get("Avg Sentiment %")].filter(
              (entry): entry is NonNullable<typeof entry> => entry != null
            );
            return <DefaultLegendContent {...props} payload={ordered} />;
          }}
        />
        <Bar yAxisId="count" dataKey="responses" name="Responses" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar yAxisId="sentiment" dataKey="sentiment" name="Avg Sentiment %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
