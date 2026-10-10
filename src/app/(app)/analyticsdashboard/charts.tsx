"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatSar } from "@/lib/utils";

export interface MonthPoint {
  label: string; // "May 26"
  hires: number;
  attendance: number;
  leave: number;
  expenses: number; // minor units
}

export interface Slice {
  name: string;
  value: number;
}

export const PIE_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

/**
 * Session 12 (R11-R) — chart types and heights live-measured on the
 * reference's stacked layout:
 *   full-width "Hiring Trend"      → AREA  260
 *   2-col  "Attendance vs Leave"   → BAR   240 (two series)
 *   2-col  "Monthly Expense Trend" → LINE  240
 *   3-col  distribution pies       → PIE   220
 */
export function HiringTrendArea({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Area type="monotone" dataKey="hires" name="New employees" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AttendanceVsLeaveBar({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Legend />
        <Bar dataKey="attendance" name="Attendance" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="leave" name="Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseTrendLine({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis width={72} tickFormatter={(v: number) => (v >= 100000 ? `${Math.round(v / 100000)}k` : `${Math.round(v / 100)}`)} />
        <Tooltip formatter={(value) => [formatSar(Number(value)), "Expenses"]} />
        <Line type="monotone" dataKey="expenses" name="Expenses (SAR)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DistributionPie({
  data,
  name,
  height = 220,
}: {
  data: Slice[];
  name: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={2}
          label={({ name: label, value }) => `${label}: ${value}`}
        >
          {data.map((slice, idx) => (
            <Cell key={slice.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
