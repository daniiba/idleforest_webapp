"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { CalendarDays, Clock3, Sprout, TrendingDown, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { plantingsData } from "@/lib/plantings"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type HistoricalData = {
  created_at: string
  requests_total: number
  active_nodes: number
  earnings: number
  total_users?: number
}

type UserHistoryData = {
  date: string
  total_users: number
}

type DailyImpactRow = {
  key: string
  date: Date
  requests: number | null
  totalUsers: number
  earnings: number | null
  actualTrees: number
  estimatedTrees: number | null
  snapshotCount: number
  totalRequests: number
  totalEarnings: number
}

const TREE_COST_USD = 0.55
const TREE_ROADMAP = [5000, 10000, 25000, 50000, 100000]
const DAY_MS = 24 * 60 * 60 * 1000

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const dateFromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const dateFromPlantingDate = (value: string) => {
  const [datePart] = value.split("T")
  const [year, month, day] = datePart.split("-").map(Number)

  if ([year, month, day].every((part) => Number.isFinite(part))) {
    return new Date(year, month - 1, day)
  }

  return new Date(value)
}

const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((unit) => `${unit}`.padStart(2, "0")).join(":")
}

const getNextExpectedUpdate = (latestDate?: Date) => {
  const now = new Date()
  const next = latestDate ? new Date(latestDate.getTime() + DAY_MS) : new Date(now)

  if (!latestDate) {
    next.setDate(now.getDate() + 1)
    next.setHours(0, 0, 0, 0)
    return next
  }

  while (next.getTime() <= now.getTime()) {
    next.setTime(next.getTime() + DAY_MS)
  }

  return next
}

const buildDailyRows = (data: HistoricalData[], userHistory: UserHistoryData[]) => {
  const snapshotsByDay = new Map<string, HistoricalData[]>()
  const totalUsersByDay = new Map(userHistory.map((entry) => [entry.date, entry.total_users]))
  const actualTreesByDay = plantingsData.events.reduce<Map<string, number>>((acc, event) => {
    const date = dateFromPlantingDate(event.date)
    if (Number.isNaN(date.getTime())) return acc

    const key = formatDateKey(date)
    acc.set(key, (acc.get(key) ?? 0) + event.trees)
    return acc
  }, new Map())

  for (const entry of data) {
    const date = new Date(entry.created_at)
    if (Number.isNaN(date.getTime())) continue

    const key = formatDateKey(date)
    const snapshots = snapshotsByDay.get(key) ?? []
    snapshots.push(entry)
    snapshotsByDay.set(key, snapshots)
  }

  const dailySnapshots = new Map(Array.from(snapshotsByDay.entries())
    .map(([key, snapshots]) => {
      const sorted = snapshots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const latest = sorted[sorted.length - 1]

      return [key, {
        key,
        date: new Date(latest.created_at),
        snapshotCount: sorted.length,
        totalRequests: latest.requests_total ?? 0,
        totalUsersFallback: latest.total_users ?? latest.active_nodes ?? 0,
        totalEarnings: latest.earnings ?? 0,
      }] as const
    }))

  const allKeys = Array.from(new Set([
    ...Array.from(dailySnapshots.keys()),
    ...Array.from(actualTreesByDay.keys()),
    ...Array.from(totalUsersByDay.keys()),
  ])).sort()
  let previousSnapshot: { totalRequests: number; totalEarnings: number } | undefined
  let latestTotalUsers = 0

  return allKeys.map((key) => {
    const snapshot = dailySnapshots.get(key)
    latestTotalUsers = totalUsersByDay.get(key) ?? latestTotalUsers
    const requests = snapshot && previousSnapshot ? Math.max(0, snapshot.totalRequests - previousSnapshot.totalRequests) : null
    const earnings = snapshot && previousSnapshot ? Math.max(0, snapshot.totalEarnings - previousSnapshot.totalEarnings) : null

    if (snapshot) {
      previousSnapshot = {
        totalRequests: snapshot.totalRequests,
        totalEarnings: snapshot.totalEarnings,
      }
    }

    return {
      key,
      date: snapshot?.date ?? dateFromKey(key),
      snapshotCount: snapshot?.snapshotCount ?? 0,
      totalRequests: snapshot?.totalRequests ?? 0,
      totalUsers: latestTotalUsers || snapshot?.totalUsersFallback || 0,
      totalEarnings: snapshot?.totalEarnings ?? 0,
      requests,
      earnings,
      actualTrees: actualTreesByDay.get(key) ?? 0,
      estimatedTrees: earnings === null ? null : earnings / TREE_COST_USD,
    }
  })
}

export function DailyImpactTable({ data, userHistory = [], middle }: { data: HistoricalData[]; userHistory?: UserHistoryData[]; middle?: ReactNode }) {
  const t = useTranslations("Report")
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const dailyRows = useMemo(() => buildDailyRows(data, userHistory), [data, userHistory])
  const newestRows = dailyRows.slice().reverse()
  const latestRow = newestRows.find((row) => row.requests !== null) ?? newestRows[0]
  const latestPlantingRow = newestRows.find((row) => row.actualTrees > 0)
  const totalActualTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0)
  const previousRows = newestRows.filter((row) => row.requests !== null)
  const recentRows = previousRows.slice(0, 14)
  const snapshotDayCount = dailyRows.filter((row) => row.snapshotCount > 0).length
  const bestRequestDay = recentRows.reduce<DailyImpactRow | undefined>((best, row) => {
    if (!best) return row
    return (row.requests ?? 0) > (best.requests ?? 0) ? row : best
  }, undefined)

  const latestSnapshotDate = useMemo(() => {
    const validTimes = data
      .map((entry) => new Date(entry.created_at).getTime())
      .filter((time) => !Number.isNaN(time))

    return validTimes.length ? new Date(Math.max(...validTimes)) : undefined
  }, [data])
  const nextUpdate = getNextExpectedUpdate(latestSnapshotDate)
  const timeUntilUpdate = nextUpdate.getTime() - now.getTime()
  const updateProgress = 100 - Math.min(Math.max((timeUntilUpdate / DAY_MS) * 100, 0), 100)

  const formatNumber = (value: number | null) => {
    if (value === null) return t("daily_table_baseline")
    return Math.round(value).toLocaleString()
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return t("daily_table_baseline")
    return `$${value.toFixed(2)}`
  }

  const formatTrees = (value: number | null) => {
    if (value === null) return t("daily_table_baseline")
    if (value === 0) return "0"
    return value < 1 ? "<1" : Math.floor(value).toLocaleString()
  }

  const formatDate = (date: Date) => date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const latestSnapshot = data.reduce<HistoricalData | undefined>(
    (best, entry) => (!best || new Date(entry.created_at) > new Date(best.created_at) ? entry : best),
    undefined
  )
  const totalRequestsAll = latestSnapshot?.requests_total ?? 0
  const totalEarningsAll = latestSnapshot?.earnings ?? 0
  const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
  const trend = recentRows.slice().reverse()
  const previousRow = recentRows[1]
  const nextGoal = TREE_ROADMAP.find((goal) => goal > totalActualTrees) ?? TREE_ROADMAP[TREE_ROADMAP.length - 1]
  const goalProgress = Math.min(100, (totalActualTrees / nextGoal) * 100)
  const bestIndex = trend.findIndex((row) => row.key === bestRequestDay?.key)

  const totals = [
    { label: t("daily_total_users"), value: (latestRow?.totalUsers ?? 0).toLocaleString() },
    { label: t("total_requests"), value: compactNumber.format(totalRequestsAll) },
    { label: t("total_earnings"), value: `$${compactNumber.format(totalEarningsAll)}` },
    { label: t("daily_actual_trees"), value: totalActualTrees.toLocaleString() },
  ]

  const tiles = [
    {
      label: t("daily_requests"),
      value: formatNumber(latestRow?.requests ?? null),
      color: "#2a78d6",
      current: latestRow?.requests ?? null,
      previous: previousRow?.requests ?? null,
      series: trend.map((row) => row.requests ?? 0),
    },
    {
      label: t("daily_earnings"),
      value: formatCurrency(latestRow?.earnings ?? null),
      color: "#1baf7a",
      current: latestRow?.earnings ?? null,
      previous: previousRow?.earnings ?? null,
      series: trend.map((row) => row.earnings ?? 0),
    },
    {
      label: t("daily_estimated_trees"),
      value: formatTrees(latestRow?.estimatedTrees ?? null),
      color: "#008300",
      current: latestRow?.estimatedTrees ?? null,
      previous: previousRow?.estimatedTrees ?? null,
      series: trend.map((row) => row.estimatedTrees ?? 0),
    },
    {
      label: t("daily_total_users"),
      value: (latestRow?.totalUsers ?? 0).toLocaleString(),
      color: "#4a3aa7",
      current: latestRow?.totalUsers ?? null,
      previous: previousRow?.totalUsers ?? null,
      series: trend.map((row) => row.totalUsers),
    },
  ]

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white sm:p-8" aria-labelledby="overview-title">
        {/* Photo: a strip on top for small screens, a fading panel on the right for large ones */}
        <div className="relative -mx-6 -mt-6 mb-6 h-40 sm:-mx-8 sm:-mt-8 lg:hidden" aria-hidden="true">
          <Image src="/report-images/plant-to-stop-poverty.jpg" alt="" fill sizes="(min-width: 640px) 700px, 100vw" className="object-cover object-[center_35%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block" aria-hidden="true">
          <Image src="/report-images/plant-to-stop-poverty.jpg" alt="" fill sizes="480px" className="object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/35 to-transparent" />
        </div>
        <h3 id="overview-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("overview_title")}</h3>
        <p className="mt-1 max-w-md text-sm text-white/70">{t("overview_desc")}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:max-w-xl lg:max-w-[58%] lg:grid-cols-2">
          {totals.map((item) => (
            <div key={item.label}>
              <dd className="text-3xl font-extrabold tabular-nums tracking-tight text-brand-yellow sm:text-4xl">{item.value}</dd>
              <dt className="mt-1 text-sm text-white/70">{item.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="yesterday-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 id="yesterday-title" className="text-xl font-extrabold tracking-tight text-brand-navy sm:text-2xl">
              {t("daily_pulse_title")}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">{t("daily_pulse_desc")}</p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm text-neutral-600">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {t("next_update")}
            <span className="font-mono font-bold tabular-nums text-brand-navy">{formatDuration(timeUntilUpdate)}</span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl bg-neutral-50 p-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tile.color }} aria-hidden="true" />
                {tile.label}
              </dt>
              <dd className="mt-1.5 text-2xl font-extrabold tabular-nums tracking-tight text-brand-navy sm:text-3xl">{tile.value}</dd>
              <div className="mt-1 min-h-[18px]">
                <DeltaChip current={tile.current} previous={tile.previous} label={t("vs_previous_day")} />
              </div>
              <div className="mt-2">
                <Sparkline values={tile.series} color={tile.color} />
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-neutral-500">{t("daily_estimated_trees")}: {t("daily_estimated_trees_desc")}</p>
      </section>

      {middle}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {t("best_recent_day")}
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-brand-navy">
            {bestRequestDay ? formatDate(bestRequestDay.date) : t("daily_table_baseline")}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {bestRequestDay ? t("best_recent_day_desc", { count: formatNumber(bestRequestDay.requests) }) : t("daily_table_empty")}
          </p>
          <MiniBars values={trend.map((row) => row.requests ?? 0)} highlight={bestIndex} />
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
            <Sprout className="h-4 w-4" aria-hidden="true" />
            {t("daily_actual_trees")}
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-brand-navy">
            {formatTrees(totalActualTrees)} {t("trees")}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {latestPlantingRow ? t("daily_actual_trees_desc", { date: formatDate(latestPlantingRow.date) }) : t("daily_actual_trees_empty")}
          </p>
          <div className="mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100" role="progressbar" aria-valuenow={Math.round(goalProgress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[#008300]" style={{ width: `${goalProgress}%` }} />
            </div>
            <p className="mt-2 flex justify-between text-xs text-neutral-500">
              <span>{totalActualTrees.toLocaleString()}</span>
              <span>{t("trees_next_goal", { goal: nextGoal.toLocaleString() })}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm" aria-labelledby="log-title">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <div>
            <h3 id="log-title" className="text-xl font-extrabold tracking-tight text-brand-navy">{t("daily_table_title")}</h3>
            <p className="mt-0.5 text-sm text-neutral-600">{t("daily_table_desc")}</p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {t("daily_table_recent", { count: recentRows.length })}
          </span>
        </div>

        {recentRows.length > 0 ? (
          <div className="overflow-x-auto border-t border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-neutral-200 bg-neutral-50 hover:bg-neutral-50">
                  <TableHead className="font-semibold text-neutral-600">{t("daily_table_date")}</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-600">{t("daily_requests")}</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-600">{t("daily_earnings")}</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-600">{t("daily_total_users")}</TableHead>
                  <TableHead className="text-right font-semibold text-neutral-600">{t("daily_estimated_trees")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRows.map((row, index) => (
                  <TableRow key={row.key} className="border-neutral-100">
                    <TableCell className="font-semibold text-brand-navy">
                      {formatDate(row.date)}
                      {index === 0 && (
                        <span className="ml-2 rounded-full bg-brand-yellow px-2 py-0.5 text-[11px] font-bold text-brand-navy">{t("latest")}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-brand-navy">{formatNumber(row.requests)}</TableCell>
                    <TableCell className="text-right tabular-nums text-brand-navy">{formatCurrency(row.earnings)}</TableCell>
                    <TableCell className="text-right tabular-nums text-brand-navy">{row.totalUsers.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums text-brand-navy">{formatTrees(row.estimatedTrees)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border-t border-neutral-200 px-4 py-10 text-center text-sm text-neutral-600">
            {t("daily_table_empty")}
          </div>
        )}
      </section>
    </div>
  )
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const w = 120
  const h = 32
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const points = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / span) * (h - 8)] as const)
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={`${line} L${w - 3} ${h} L3 ${h} Z`} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function DeltaChip({ current, previous, label }: { current: number | null; previous: number | null; label: string }) {
  if (current === null || previous === null || previous === 0) return null
  const change = ((current - previous) / previous) * 100
  if (Math.round(change) === 0) {
    return <span className="text-xs text-neutral-500">0% {label}</span>
  }
  const up = change >= 0
  const Icon = up ? TrendingUp : TrendingDown

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-700" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? "+" : ""}
      {Math.round(change)}%
      <span className="font-normal text-neutral-500">{label}</span>
    </span>
  )
}

function MiniBars({ values, highlight }: { values: number[]; highlight: number }) {
  const max = Math.max(...values, 1)

  return (
    <div className="mt-4 flex h-14 items-end gap-1" aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${Math.max(8, (v / max) * 100)}%`, backgroundColor: i === highlight ? "#2a78d6" : "rgba(42,120,214,0.25)" }}
        />
      ))}
    </div>
  )
}
