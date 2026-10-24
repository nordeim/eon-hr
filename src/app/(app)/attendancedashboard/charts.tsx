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

/* Session 88 (R88-B2): the recharts 2.x adaptive-interval mimic. The
 * REF's X cadence (live-measured on the 31-day October at the shared
 * zero-data state) is the first 8 days CONSECUTIVE, then every OTHER
 * day (the evens 10..30) — 19 ticks. recharts 3.x's own default
 * interval renders [1-9, 11-31 odds]; the explicit ticks pin the REF's
 * cadence deterministically. */
export function attendanceTickCadence(dayCount: number): string[] {
  const ticks: string[] = [];
  for (let d = 1; d <= Math.min(8, dayCount); d++) ticks.push(String(d));
  for (let d = 10; d <= dayCount; d += 2) ticks.push(String(d));
  return ticks;
}

export function DailyAttendanceTrend({ data }: { data: DayPoint[] }) {
  /* Session 87 (R87-N): the chart type re-measured by the full-registry
   * cross-side pixel-diff — the REF renders a grouped BAR chart (the
   * Present/Late/Absent legend order; itemSorter={null} neutralizes
   * recharts 3.x's VALUE-sorting Legend which rendered
   * AbsentLatePresent at the all-zero state).
   *
   * Session 88 (R88-B2): the geometry re-measured — the REF's plot is
   * [65,493]x[5,201]: margin {top:5, right:5, left:5, bottom:5} + the
   * YAxis at the DEFAULT width 60 (the axis line lands at 5+60=65; the
   * legend wrapper insets by the margins — [5,493] local, matching the
   * REF's [318,806] page read) + the
   * XAxis band pinned at height={30} (recharts 3.x AUTO-GROWS the band
   * to ~54px for the 16px inherited tick font — squeezing the plot to
   * bottom 177; the REF's 2.x uses the fixed 30px default band), the
   * YAxis width 65, and the 16px INHERITED tick font (no explicit tick
   * fontSize — the REF's computed tick style; the old
   * tick={{fontSize:11}} rendered 11px) + the explicit tick cadence
   * with interval={0} (3.x's fit-pruning dropped the odd days 1-7 from
   * the 19-tick ladder — the received read [2,4,6,...] evens).
   * Session 88 (the residual pass): recharts 3.x reserves the LEGEND's
   * 24px INSIDE the svg (2.x renders it as a sibling BELOW) — the
   * margin bottom 29 + 30 (axis) + 24 (legend) squeezed the plot to
   * bottom 177; the REF's 2.x layout: 29 + 30 = 59 → 201. The 3.x
   * equivalent: bottom 5 (5 + 30 + 24 = 59). */
  return (
    /* Session 89 (R89-A2): the REF's authored card-body structure — the
     * chart rides inside div.overflow-x-auto > div.w-full.text-sm (the
     * live-measured REF chain: p-6 pt-0 > overflow-x-auto > w-full
     * text-sm > recharts-responsive-container). */
    <div className="overflow-x-auto">
      <div className="w-full text-sm">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* Session 89 (R89-A1): the XAxis tick font RESTORED to the
             * REF's measured 11px (live-verified both themes, 3×
             * reload-stable; the r88-B2 comment's 16px claim was a
             * measurement error in that parallel round — the pin it
             * retired was correct). The 16px inherited form widened the
             * chart's min-content 31px (493 vs 462) and pushed the
             * page past the wrap threshold — the Export Report button
             * landed OFF-CANVAS at mobile (x=376 on the 390 viewport).
             * ONE root cause, THREE symptoms. */}
            <XAxis
              dataKey="day"
              interval={0}
              height={30}
              tick={{ fontSize: 11 }}
              ticks={attendanceTickCadence(data.length)}
            />
            {/* Session 89 (R89-A1, the companion pin): the YAxis ticks stay
             * at the REF's 16px (its measured form — the XAxis 11px / YAxis
             * 16px MIX; the text-sm wrapper would otherwise inherit 14px
             * down to the Y ticks). */}
            <YAxis allowDecimals={false} tick={{ fontSize: 16 }} />
            <Tooltip />
            {/* Session 87 (R87-N): recharts 3.x's Legend sorts its items by
            VALUE by default — itemSorter={null} renders the payload in
            declaration order (the REF's live-read Present/Late/Absent
            order). */}
            <Legend itemSorter={null} />
            <Bar dataKey="present" name="Present" fill="#10b981" />
            <Bar dataKey="late" name="Late" fill="#f59e0b" />
            <Bar dataKey="absent" name="Absent" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ClockInDistribution({ data }: { data: HourBucket[] }) {
  /* Session 88 (R88-B3): the REF renders this chart GRID-ONLY — no
   * XAxis/YAxis layers at all (the raw-svg census: [title, desc, defs,
   * grid]), the 4-line plot border at [65,493]x[5,225] on the 498x260
   * surface: margin {top:5, right:5, left:65, bottom:35} with no axes
   * declared. The old declared-axes form rendered 2 axis lines + the
   * [36,482]x[8,226] plot. */
  return (
    <div className="overflow-x-auto">
      <div className="w-full text-sm">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 65, bottom: 35 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Bar dataKey="count" name="Clock-ins" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
