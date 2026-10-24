"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  /* Session 87 (R87-N): the chart type re-measured by the full-registry
   * cross-side pixel-diff — the REF renders a grouped BAR chart (90
   * zero-height bars at zero data: 30 days × 3 series, live-read; the
   * Present/Late/Absent legend order; recharts' default tick interval —
   * the forced interval={0} showed all 31 ticks where the REF shows the
   * default cadence). The LineChart rendered no marks at zero data. */
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        {/* Session 87 (R87-N): recharts 3.x's Legend sorts its items by
            VALUE by default — itemSorter={null} renders the payload in
            declaration order (the REF's live-read Present/Late/Absent
            order; the default sort rendered AbsentLatePresent at the
            all-zero seeded state). */}
        <Legend itemSorter={null} />
        <Bar dataKey="present" name="Present" fill="#10b981" />
        <Bar dataKey="late" name="Late" fill="#f59e0b" />
        <Bar dataKey="absent" name="Absent" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ClockInDistribution({ data }: { data: HourBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={0} />
        <YAxis allowDecimals={false} width={36} />
        <Tooltip />
        <Bar dataKey="count" name="Clock-ins" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
