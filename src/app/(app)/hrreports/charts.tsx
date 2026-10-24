"use client";

import {
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

export interface GroupPoint {
  name: string;
  count: number;
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

export type ReportChartType = "bar" | "pie" | "line";

export function ReportChart({ data, type }: { data: GroupPoint[]; type: ReportChartType }) {
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((slice, idx) => (
              <Cell key={slice.name} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
          <YAxis allowDecimals={false} width={36} />
          <Tooltip />
          <Line type="monotone" dataKey="count" name="Employees" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      {/* Session 88 (R88-E1): the REF renders the (default bar) report
          chart GRID-ONLY — no XAxis/YAxis layers at all (the raw-svg
          census: [title, desc, defs, grid]), the 4-line plot border at
          [65,1081]x[5,255] on the 1086x320 surface: margin {top:5,
          right:5, left:65, bottom:65}. The old declared-axes form
          rendered 2 axis lines + the [36,1070]x[8,286] plot. */}
      <BarChart data={data} margin={{ top: 5, right: 5, left: 65, bottom: 65 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
