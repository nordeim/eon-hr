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

export function HiringTrendBar({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Bar dataKey="hires" name="New employees" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceVsLeaveLine({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="leave" name="Leave" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ExpenseTrendArea({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis width={72} tickFormatter={(v: number) => (v >= 100000 ? `${Math.round(v / 100000)}k` : `${Math.round(v / 100)}`)} />
        <Tooltip formatter={(value) => [formatSar(Number(value)), "Expenses"]} />
        <Area type="monotone" dataKey="expenses" name="Expenses (SAR)" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DistributionPie({
  data,
  name,
  height = 260,
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
          outerRadius={85}
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
