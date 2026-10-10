"use client";

import * as React from "react";
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
import { formatSar } from "@/lib/utils";

export interface HeadcountPoint {
  month: string;
  headcount: number;
}

export interface DeptCount {
  name: string;
  employees: number;
}

export interface PayrollPoint {
  month: string;
  payroll: number; // minor units
}

const DEPT_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

export function HeadcountTrendLine({ data }: { data: HeadcountPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Line type="monotone" dataKey="headcount" name="Headcount" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DepartmentDistributionBar({ data }: { data: DeptCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Bar dataKey="employees" name="Employees" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PayrollTrendLine({ data }: { data: PayrollPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis
          width={72}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100000)}k` : `${Math.round(v / 100)}`)}
        />
        <Tooltip formatter={(value) => [formatSar(Number(value)), "Payroll"]} />
        <Legend />
        <Line type="monotone" dataKey="payroll" name="Payroll (SAR)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
