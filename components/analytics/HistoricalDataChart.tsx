"use client"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { plantingsData } from "@/lib/plantings"
import { useIsMobile } from "@/hooks/use-mobile"

interface HistoricalDataProps {
  data: {
    created_at: string;
    requests_total: number;
    active_nodes: number;
    earnings: number;
  }[];
}

export const HistoricalDataChart = ({ data }: HistoricalDataProps) => {
  const isMobile = useIsMobile()
  const [visibleMetrics, setVisibleMetrics] = useState({
    requests: true,
    nodes: true,
    earnings: true,
    trees: true,
  });
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("weekly")
  // Mobile-only: allow a single tap to persist the tooltip
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)

  // Helpers to build stable YYYY-MM-DD keys WITHOUT timezone jumps
  const dateKeyFromDate = (dt: Date) => {
    const y = dt.getFullYear()
    const m = `${dt.getMonth() + 1}`.padStart(2, "0")
    const d = `${dt.getDate()}`.padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const toDateKey = (d: string) => dateKeyFromDate(new Date(d))

  // Helpers for bucketing
  const toWeekKey = (d: string) => {
    const dt = new Date(d)
    // Normalize to local midnight to avoid DST surprises when adjusting days
    dt.setHours(0, 0, 0, 0)
    const day = dt.getDay() || 7 // 1..7 (Mon..Sun with Sun=7)
    const monday = new Date(dt)
    monday.setDate(dt.getDate() - (day - 1))
    monday.setHours(0, 0, 0, 0)
    return dateKeyFromDate(monday)
  }

  const toMonthKey = (d: string) => {
    const dt = new Date(d)
    dt.setHours(0, 0, 0, 0)
    const y = dt.getFullYear()
    const m = `${dt.getMonth() + 1}`.padStart(2, "0")
    return `${y}-${m}-01`
  }

  const keyFor = (d: string) => {
    if (granularity === "weekly") return toWeekKey(d)
    if (granularity === "monthly") return toMonthKey(d)
    return toDateKey(d)
  }

  // Aggregate donations (trees) by chosen bucket
  const treesByDate = plantingsData.events.reduce<Record<string, number>>((acc, evt) => {
    const key = keyFor(evt.date);
    acc[key] = (acc[key] ?? 0) + (evt.trees ?? 0);
    return acc;
  }, {});

  // Merge KPI data and donations by date key
  const byDate = new Map<string, { requests: number; nodesSum: number; nodesCount: number; earnings: number; trees: number }>();

  for (const entry of data) {
    const key = keyFor(entry.created_at);
    const prev = byDate.get(key) ?? { requests: 0, nodesSum: 0, nodesCount: 0, earnings: 0, trees: 0 };
    prev.requests += entry.requests_total;
    prev.nodesSum += entry.active_nodes;
    prev.nodesCount += 1;
    prev.earnings += entry.earnings;
    byDate.set(key, prev);
  }

  for (const [key, trees] of Object.entries(treesByDate)) {
    const prev = byDate.get(key) ?? { requests: 0, nodesSum: 0, nodesCount: 0, earnings: 0, trees: 0 };
    prev.trees += trees;
    byDate.set(key, prev);
  }

  // Build chart array, sorted by date
  const sortedEntries = Array.from(byDate.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  // Compute cumulative trees (independent of visibility)
  let runningTrees = 0;
  const chartData = sortedEntries.map(([key, vals]) => {
    runningTrees += vals.trees;
    // For weekly/monthly, average daily values within the bucket to avoid inflated sums
    const divisor = vals.nodesCount || 1; // nodesCount represents number of daily records in this bucket
    const requestsValue = granularity === "daily" ? vals.requests : vals.requests / divisor;
    const earningsValue = granularity === "daily" ? vals.earnings : vals.earnings / divisor;
    return {
      period: granularity === "monthly"
        ? new Date(key).toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : granularity === "weekly"
          ? new Date(key).toLocaleDateString()
          : new Date(key).toLocaleDateString(),
      requests: visibleMetrics.requests ? requestsValue : 0,
      nodes: visibleMetrics.nodes ? (vals.nodesCount ? vals.nodesSum / vals.nodesCount : 0) : 0,
      earnings: visibleMetrics.earnings ? earningsValue : 0,
      trees: visibleMetrics.trees ? runningTrees : 0,
    };
  });

  const config = {
    requests: {
      label: "Total Requests",
      color: "#0B101F", // brand-navy for line
      description: "Number of total requests"
    },
    nodes: {
      label: "Active Nodes",
      color: "#3A4563", // navy variant for better contrast on gray
      description: "Number of active nodes"
    },
    earnings: {
      label: "Total Earnings",
      color: "#B8C33C", // even darker brand yellow for earnings
      description: "Cumulative earnings"
    },
    trees: {
      label: "Trees Planted",
      color: "#8C9931", // darkest yellow variant to clearly differ from earnings
      description: "Number of trees planted (donations)"
    }
  };

  type ConfigKey = keyof typeof config;

  const toggleMetric = (key: ConfigKey) => {
    setVisibleMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLegendClick = (entry: any) => {
    const dataKey = Object.keys(config).find((key) => config[key as ConfigKey].label === entry.value) as ConfigKey | undefined;
    if (dataKey) toggleMetric(dataKey);
  };

  // Custom tooltip to show a colored dot next to each label
  const CustomTooltip = ({ active, label, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const formatValue = (key: keyof typeof config, value: number) => {
      if (key === "earnings") return `$${Number(value).toFixed(2)}`;
      if (key === "requests") return `${(Number(value) / 1000).toFixed(1)}k`;
      return `${Math.round(Number(value))}`;
    };

    return (
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(11,16,31,0.15)", borderRadius: 6, padding: 8 }}>
        <div style={{ color: "#0B101F", fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {payload.map((item: any) => {
            const key = item.dataKey as keyof typeof config;
            // Skip hidden series (value 0 when toggled off)
            if (item.value === 0) return null;
            const color = item.color || config[key]?.color;
            const name = config[key]?.label ?? String(key);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, color: "#0B101F" }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
                <span style={{ minWidth: 140 }}>{name}</span>
                <strong>{formatValue(key, item.value)}</strong>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Build a payload compatible with Recharts Tooltip from a datum at index
  const buildPayloadForIndex = (index: number | null) => {
    if (index == null || index < 0 || index >= chartData.length) return undefined;
    const d = chartData[index] as any;
    // Order should match the rendered series
    const series: Array<{ key: ConfigKey }> = [
      { key: "requests" },
      { key: "nodes" },
      { key: "earnings" },
      { key: "trees" },
    ];
    return series.map(({ key }) => ({
      dataKey: key,
      value: d[key],
      color: (config as any)[key]?.color,
      name: (config as any)[key]?.label,
    }));
  };

  // On mobile, a tap should pin the tooltip at the tapped index. Tap empty area to unpin.
  const handleChartClick = (e: any) => {
    if (!isMobile) return;
    if (e && typeof e.activeTooltipIndex === "number") {
      setPinnedIndex(e.activeTooltipIndex);
      setIsTooltipPinned(true);
    } else {
      setPinnedIndex(null);
      setIsTooltipPinned(false);
    }
  };

  return (
    <Card className="bg-white text-brand-navy border border-brand-navy/10 rounded-xl shadow-sm sm:shadow-md ring-1 ring-black/5">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="font-bold text-xl sm:text-2xl">Historical Performance of Idleforest</CardTitle>
        <div className="space-y-2">
          <p className="text-brand-navy/80 text-sm sm:text-base">Tracking key performance indicators over time</p>
          {/* Granularity controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-brand-navy/70">Granularity:</span>
            {(["daily","weekly","monthly"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`px-2 py-1 rounded-full border text-xs bg-white hover:bg-gray-50 transition-colors ${granularity === g ? "opacity-100" : "opacity-60"}`}
                aria-pressed={granularity === g}
                style={{ borderColor: "#3A4563", color: "#3A4563" }}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
         
          {/* Mobile compact toggles */}
          <div className="sm:hidden flex flex-wrap gap-2 pt-1">
            {Object.entries(config).map(([key, value]) => {
              const k = key as ConfigKey;
              const active = visibleMetrics[k];
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleMetric(k)}
                  className={`px-2 py-1 rounded-full border text-xs bg-white hover:bg-gray-50 transition-colors ${active ? "opacity-100" : "opacity-60"}`}
                  aria-pressed={active}
                  style={{ borderColor: value.color, color: value.color }}
                >
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-4 sm:p-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px] w-full">
            <ChartContainer config={config} className="aspect-auto h-[260px] sm:h-[420px]">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 0, top: isMobile ? 10 : 20, bottom: isMobile ? 0 : 10 }}
            className="w-full h-full"
            onClick={handleChartClick}
          >
            <CartesianGrid vertical={false} horizontal={false} stroke="rgba(11,16,31,0.08)" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={isMobile ? 20 : 8}
              tick={{ fill: "rgba(11,16,31,0.8)", fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              yAxisId="requests"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
            <YAxis 
              yAxisId="nodes"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
            <YAxis 
              yAxisId="earnings"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
            <YAxis 
              yAxisId="trees"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
          {isMobile ? (
            <Tooltip
              content={<CustomTooltip />}
              active={isTooltipPinned}
              label={isTooltipPinned && pinnedIndex != null ? chartData[pinnedIndex]?.period : undefined}
              payload={isTooltipPinned ? buildPayloadForIndex(pinnedIndex) : undefined}
            />
          ) : (
            <Tooltip content={<CustomTooltip />} />
          )}
          {!isMobile && (
            <Legend 
              onClick={handleLegendClick}
              iconType="circle"
              wrapperStyle={{ paddingTop: "1rem", color: "#0B101F", cursor: "pointer" }}
            />
          )}
          <Area
            yAxisId="requests"
            type="monotone"
            dataKey="requests"
            name={config.requests.label}
            stroke={config.requests.color}
            fill={config.requests.color}
            fillOpacity={visibleMetrics.requests ? 0.1 : 0}
            strokeOpacity={visibleMetrics.requests ? 1 : 0}
            strokeWidth={2}
          />
          <Area
            yAxisId="nodes"
            type="monotone"
            dataKey="nodes"
            name={config.nodes.label}
            stroke={config.nodes.color}
            fill={config.nodes.color}
            fillOpacity={visibleMetrics.nodes ? 0.12 : 0}
            strokeOpacity={visibleMetrics.nodes ? 1 : 0}
            strokeWidth={2.25}
          />
          <Area
            yAxisId="earnings"
            type="monotone"
            dataKey="earnings"
            name={config.earnings.label}
            stroke={config.earnings.color}
            fill={config.earnings.color}
            fillOpacity={visibleMetrics.earnings ? 0.1 : 0}
            strokeOpacity={visibleMetrics.earnings ? 1 : 0}
            strokeWidth={2}
          />
            <Area
              yAxisId="trees"
              type="monotone"
              dataKey="trees"
              name={config.trees.label}
              stroke={config.trees.color}
              fill={config.trees.color}
              fillOpacity={visibleMetrics.trees ? 0.12 : 0}
              strokeOpacity={visibleMetrics.trees ? 1 : 0}
              strokeWidth={2}
            />
        </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
