"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface DayPoint {
  day: string; // "1".."31"
  present: number;
  late: number;
  absent: number;
}

export interface HourBucket {
  hour: string; // "08:00"
  count: number;
}

export function DailyAttendanceTrend({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={0} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ClockInDistribution({ data }: { data: HourBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={0} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Bar dataKey="count" name="Clock-ins" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
