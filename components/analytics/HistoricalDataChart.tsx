"use client"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useMemo, useState } from "react"
import { plantingsData } from "@/lib/plantings"
import { useTranslations } from "next-intl"

interface HistoricalDataProps {
  data: {
    created_at: string;
    requests_total: number;
    active_nodes: number;
    earnings: number;
    total_users?: number;
  }[];
  userHistory?: {
    date: string;
    total_users: number;
  }[];
}

type MetricKey = "requests" | "nodes" | "earnings" | "trees"
type Granularity = "daily" | "weekly" | "monthly"

// One validated categorical slot per metric. Each metric gets its own chart and
// its own scale, so identity never depends on color alone (the title names it).
const COLORS: Record<MetricKey, string> = {
  requests: "#2a78d6",
  nodes: "#4a3aa7",
  earnings: "#1baf7a",
  trees: "#008300",
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

function formatMetric(key: MetricKey, value: number) {
  if (key === "earnings") return `$${compact.format(value)}`
  return compact.format(Math.round(value))
}

function formatMetricExact(key: MetricKey, value: number) {
  if (key === "earnings") return `$${value.toFixed(2)}`
  return Math.round(value).toLocaleString()
}

export const HistoricalDataChart = ({ data, userHistory = [] }: HistoricalDataProps) => {
  const t = useTranslations('Report')
  const [granularity, setGranularity] = useState<Granularity>("weekly")

  // Helpers to build stable YYYY-MM-DD keys WITHOUT timezone jumps
  const dateKeyFromDate = (dt: Date) => {
    const y = dt.getFullYear()
    const m = `${dt.getMonth() + 1}`.padStart(2, "0")
    const d = `${dt.getDate()}`.padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const toDateKey = (d: string) => dateKeyFromDate(new Date(d))

  const toWeekKey = (d: string) => {
    const dt = new Date(d)
    dt.setHours(0, 0, 0, 0)
    const day = dt.getDay() || 7
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

  const totalUsersByDate = useMemo(
    () => new Map(userHistory.map((entry) => [entry.date, entry.total_users])),
    [userHistory]
  )

  const getTotalUsersForDate = (dateValue: string, fallback: number) => {
    const dateKey = toDateKey(dateValue)
    const matchingKey = Array.from(totalUsersByDate.keys())
      .filter((key) => key <= dateKey)
      .sort()
      .pop()

    return matchingKey ? totalUsersByDate.get(matchingKey) ?? fallback : fallback
  }

  const chartData = useMemo(() => {
    // Aggregate donations (trees) by chosen bucket
    const treesByDate = plantingsData.events.reduce<Record<string, number>>((acc, evt) => {
      const key = keyFor(evt.date)
      acc[key] = (acc[key] ?? 0) + (evt.trees ?? 0)
      return acc
    }, {})

    const byDate = new Map<string, { requests: number; nodesSum: number; nodesCount: number; earnings: number; trees: number }>()

    for (const entry of data) {
      const key = keyFor(entry.created_at)
      const prev = byDate.get(key) ?? { requests: 0, nodesSum: 0, nodesCount: 0, earnings: 0, trees: 0 }
      prev.requests += entry.requests_total
      prev.nodesSum += getTotalUsersForDate(entry.created_at, entry.total_users ?? entry.active_nodes ?? 0)
      prev.nodesCount += 1
      prev.earnings += entry.earnings
      byDate.set(key, prev)
    }

    for (const [key, trees] of Object.entries(treesByDate)) {
      const prev = byDate.get(key) ?? { requests: 0, nodesSum: 0, nodesCount: 0, earnings: 0, trees: 0 }
      prev.trees += trees
      byDate.set(key, prev)
    }

    const sorted = Array.from(byDate.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    let runningTrees = 0
    return sorted.map(([key, vals]) => {
      runningTrees += vals.trees
      // requests_total and earnings are cumulative snapshots, so a bucket shows the average snapshot
      const divisor = vals.nodesCount || 1
      return {
        key,
        period:
          granularity === "monthly"
            ? new Date(key).toLocaleDateString(undefined, { month: "short", year: "numeric" })
            : new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }),
        requests: granularity === "daily" ? vals.requests : vals.requests / divisor,
        nodes: vals.nodesCount ? vals.nodesSum / vals.nodesCount : 0,
        earnings: granularity === "daily" ? vals.earnings : vals.earnings / divisor,
        trees: runningTrees,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, granularity, totalUsersByDate])

  const metrics: Array<{ key: MetricKey; label: string; note: string }> = [
    { key: "requests", label: t('total_requests'), note: "cumulative" },
    { key: "nodes", label: t('total_users'), note: "total" },
    { key: "earnings", label: t('total_earnings'), note: "cumulative" },
    { key: "trees", label: t('trees_planted_chart'), note: "cumulative" },
  ]

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="history-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id="history-title" className="text-xl font-extrabold tracking-tight text-brand-navy sm:text-2xl">{t('historical_title')}</h3>
          <p className="mt-1 max-w-xl text-sm text-neutral-600">{t('historical_desc')}</p>
        </div>
        <div className="inline-flex shrink-0 rounded-full bg-neutral-100 p-1" role="group" aria-label={t('granularity')}>
          {(["daily", "weekly", "monthly"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              aria-pressed={granularity === g}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                granularity === g ? "bg-brand-navy text-white" : "text-neutral-600 hover:text-brand-navy"
              }`}
            >
              {t(g)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {metrics.map(({ key, label, note }) => (
          <MetricChart key={key} metricKey={key} label={label} note={note} data={chartData} />
        ))}
      </div>
    </section>
  )
}

function MetricChart({
  metricKey,
  label,
  note,
  data,
}: {
  metricKey: MetricKey
  label: string
  note: string
  data: Array<Record<string, any>>
}) {
  const color = COLORS[metricKey]
  const gradientId = `fill-${metricKey}`
  const last = data[data.length - 1]
  const latest = last ? (last[metricKey] as number) : 0

  return (
    <figure className="rounded-2xl border border-neutral-200 p-4">
      <figcaption className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            {label}
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-brand-navy">{formatMetric(metricKey, latest)}</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">{note}</span>
      </figcaption>

      <div className="mt-3 h-[170px]" role="img" aria-label={`${label}: latest ${formatMetricExact(metricKey, latest)}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(11,16,31,0.07)" strokeDasharray="3 4" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={48}
              tickMargin={8}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={42}
              tickCount={3}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(v) => formatMetric(metricKey, Number(v))}
              domain={[0, "auto"]}
            />
            <Tooltip
              cursor={{ stroke: "rgba(11,16,31,0.25)", strokeWidth: 1 }}
              content={({ active, payload, label: period }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg">
                    <p className="text-xs font-medium text-neutral-500">{period}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-sm font-bold text-brand-navy">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                      {formatMetricExact(metricKey, Number(payload[0].value))}
                    </p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey={metricKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4.5, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
