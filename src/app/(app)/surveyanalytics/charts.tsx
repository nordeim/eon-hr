"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
        <YAxis yAxisId="count" allowDecimals={false} width={36} />
        <YAxis yAxisId="sentiment" orientation="right" domain={[-100, 100]} width={48} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="count" dataKey="responses" name="Responses" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar yAxisId="sentiment" dataKey="sentiment" name="Avg sentiment" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
