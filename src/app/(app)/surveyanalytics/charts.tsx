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

/* Session 88 (R88-A): the REF's zero-state chart contract — measured
 * live at the shared zero-data state (both tenants 0 surveys / 0
 * responses), the REF (recharts 2.x) renders a DIFFERENT at-rest form
 * per chart than the with-data form the r61 rewrite assumed:
 *   chart 1 — a COMPLETELY empty surface (no grid, no axes, no texts);
 *   chart 2 — the -100..100 reference scale ONLY (a left YAxis + the
 *             7-line grid, NO months, no curve);
 *   chart 3 — the same reference scale on a RIGHT-orientation YAxis +
 *             the legend pair, NO XAxis, no left axis, no bars.
 * The recharts 3.x mechanism (the round's key lesson): 3.x does NOT
 * compute axis ticks for empty/all-null data even with an explicit
 * `domain` (the current chart 2 renders months but zero Y ticks) — the
 * explicit `ticks` prop bypasses the computation (combineAxisTicks maps
 * the given ticks directly over the scale, and a literal numeric domain
 * resolves without data — the recharts #7362 handling). */
const REFERENCE_TICKS = [-100, -50, 0, 50, 100];

export function SentimentDistributionBar({ data }: { data: SentimentSlice[] }) {
  const empty = data.length === 0 || data.every((d) => d.value === 0);
  return (
    <ResponsiveContainer width="100%" height={240}>
      {/* R88-A1: at the all-zero state the REF renders the empty surface —
          NO CartesianGrid/XAxis/YAxis children (the childGs census reads
          [title, desc, defs]); with data the full chart (the superset). */}
      <BarChart data={empty ? [] : data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        {!empty && <CartesianGrid strokeDasharray="3 3" />}
        {!empty && <XAxis dataKey="name" tick={{ fontSize: 12 }} />}
        {!empty && <YAxis allowDecimals={false} width={36} />}
        <Tooltip />
        <Bar dataKey="value" name="Responses" radius={[4, 4, 0, 0]} maxBarSize={64}>
          {!empty && data.map((slice) => <Cell key={slice.name} fill={slice.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SentimentTrendLine({ data }: { data: TrendPoint[] }) {
  /* R88-A2: at the all-null state the REF renders the reference scale —
   * grid + the left YAxis (width 65, domain [-100,100], the explicit
   * 5-tick ladder, the 16px INHERITED tick font — no explicit fontSize)
   * and NOTHING else. Margin {top:5, right:5, left:0, bottom:35} lands
   * the plot at [65,493]x[5,205] on the 498x240 surface; no XAxis
   * declared (no months at the zero state); no Line (no curve). */
  if (data.every((d) => d.sentiment === null)) {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={[]} margin={{ top: 5, right: 5, left: 5, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis allowDataOverflow domain={[-100, 100]} ticks={REFERENCE_TICKS} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
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
  /* R88-A3: at the empty state the REF renders the right-axis reference
   * scale — grid + the RIGHT-orientation YAxis (width 65, the axis line
   * at the 1005 plot edge, the tick texts right of the axis) + the
   * legend pair + the two Bars (the legend payload source; both on the
   * single declared default axis — no rects at data=[]) and NOTHING
   * else. Margin {top:5, right:5, left:5, bottom:35} + the hidden
   * count axis (60) + the right YAxis at the DEFAULT width 60 land the
   * plot at [65,1005]x[5,201] on the 1070x260 surface (recharts 3.x
   * reserves the LEGEND's 24px INSIDE the svg — 2.x renders it as a
   * sibling below; 35 + 24 = the REF's 59); the legend wrapper insets
   * by the margins — [5,1065] local, the REF's [318,1378] page read. */
  if (data.length === 0) {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={[]} margin={{ top: 5, right: 5, left: 5, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* the hidden count axis — the REF's implicit left default
              (width 60): it reserves the left band so the plot lands at
              5+60=65 while rendering NO layer (the REF's raw-svg census
              shows one yAxis layer only). */}
          <YAxis yAxisId="count" hide />
          <YAxis orientation="right" allowDataOverflow domain={[-100, 100]} ticks={REFERENCE_TICKS} />
          {/* Session 61 (R61-P): the payload-pinned legend (unchanged at
              the zero state — the REF renders the same pair). */}
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
          <Bar dataKey="sentiment" name="Avg Sentiment %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
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
