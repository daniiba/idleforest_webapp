"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Clock3, DollarSign, Radio, Sprout, TrendingUp, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
}

type DailyImpactRow = {
  key: string
  date: Date
  requests: number | null
  activeNodes: number
  earnings: number | null
  actualTrees: number
  estimatedTrees: number | null
  snapshotCount: number
  totalRequests: number
  totalEarnings: number
}

const TREE_COST_USD = 0.55
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

const buildDailyRows = (data: HistoricalData[]) => {
  const snapshotsByDay = new Map<string, HistoricalData[]>()
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
        activeNodes: latest.active_nodes ?? 0,
        totalEarnings: latest.earnings ?? 0,
      }] as const
    }))

  const allKeys = Array.from(new Set([...Array.from(dailySnapshots.keys()), ...Array.from(actualTreesByDay.keys())])).sort()
  let previousSnapshot: { totalRequests: number; totalEarnings: number } | undefined

  return allKeys.map((key) => {
    const snapshot = dailySnapshots.get(key)
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
      activeNodes: snapshot?.activeNodes ?? 0,
      totalEarnings: snapshot?.totalEarnings ?? 0,
      requests,
      earnings,
      actualTrees: actualTreesByDay.get(key) ?? 0,
      estimatedTrees: earnings === null ? null : earnings / TREE_COST_USD,
    }
  })
}

export function DailyImpactTable({ data }: { data: HistoricalData[] }) {
  const t = useTranslations("Report")
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const dailyRows = useMemo(() => buildDailyRows(data), [data])
  const newestRows = dailyRows.slice().reverse()
  const latestRow = newestRows.find((row) => row.requests !== null) ?? newestRows[0]
  const latestPlantingRow = newestRows.find((row) => row.actualTrees > 0)
  const previousRows = newestRows.filter((row) => row.requests !== null)
  const impactRows = newestRows.filter((row) => row.requests !== null || row.actualTrees > 0)
  const recentRows = impactRows.slice(0, 14)
  const bestRequestDay = previousRows.reduce<DailyImpactRow | undefined>((best, row) => {
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

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="border-2 border-black bg-brand-yellow p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-black">
                <Radio className="h-4 w-4" />
                {t("daily_pulse_label")}
              </div>
              <h3 className="mt-2 font-rethink-sans text-2xl font-extrabold text-black">
                {t("daily_pulse_title")}
              </h3>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-neutral-900">
                {t("daily_pulse_desc")}
              </p>
            </div>
            <Badge className="rounded-none border-2 border-black bg-white px-3 py-1 text-black hover:bg-white">
              {t("daily_table_days", { count: dailyRows.length })}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-2 border-black bg-white p-4">
              <TrendingUp className="mb-3 h-5 w-5 text-black" />
              <div className="text-2xl font-extrabold text-black">{formatNumber(latestRow?.requests ?? null)}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">{t("daily_requests")}</div>
            </div>
            <div className="border-2 border-black bg-white p-4">
              <DollarSign className="mb-3 h-5 w-5 text-black" />
              <div className="text-2xl font-extrabold text-black">{formatCurrency(latestRow?.earnings ?? null)}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">{t("daily_earnings")}</div>
            </div>
            <div className="border-2 border-black bg-white p-4">
              <Sprout className="mb-3 h-5 w-5 text-black" />
              <div className="text-2xl font-extrabold text-black">{formatTrees(latestPlantingRow?.actualTrees ?? 0)}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">{t("daily_actual_trees")}</div>
            </div>
            <div className="border-2 border-black bg-white p-4">
              <Users className="mb-3 h-5 w-5 text-black" />
              <div className="text-2xl font-extrabold text-black">{(latestRow?.activeNodes ?? 0).toLocaleString()}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">{t("daily_active_nodes")}</div>
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-black">
            <Clock3 className="h-4 w-4" />
            {t("next_update")}
          </div>
          <div className="mt-4 font-mono text-4xl font-black text-black sm:text-5xl">
            {formatDuration(timeUntilUpdate)}
          </div>
          <Progress
            value={updateProgress}
            className="mt-5 h-3 rounded-none border-2 border-black bg-brand-gray [&>div]:bg-brand-green"
          />
          <div className="mt-4 space-y-2 text-sm font-medium text-neutral-700">
            <div className="flex items-center justify-between gap-4">
              <span>{t("latest_snapshot")}</span>
              <span className="text-right font-bold text-black">
                {latestSnapshotDate ? formatDate(latestSnapshotDate) : t("daily_table_baseline")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{t("expected_next")}</span>
              <span className="text-right font-bold text-black">
                {nextUpdate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-2 border-black bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-neutral-600">
            <CalendarDays className="h-4 w-4 text-black" />
            {t("best_recent_day")}
          </div>
          <div className="mt-2 text-lg font-extrabold text-black">
            {bestRequestDay ? formatDate(bestRequestDay.date) : t("daily_table_baseline")}
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-700">
            {bestRequestDay
              ? t("best_recent_day_desc", { count: formatNumber(bestRequestDay.requests) })
              : t("daily_table_empty")}
          </p>
        </div>
        <div className="border-2 border-black bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-neutral-600">
            <Sprout className="h-4 w-4 text-black" />
            {t("daily_actual_trees")}
          </div>
          <div className="mt-2 text-lg font-extrabold text-black">
            {formatTrees(latestPlantingRow?.actualTrees ?? 0)} {t("trees")}
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-700">
            {latestPlantingRow
              ? t("daily_actual_trees_desc", { date: formatDate(latestPlantingRow.date) })
              : t("daily_actual_trees_empty")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden border-2 border-black bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-brand-gray/40 px-4 py-3">
          <div>
            <h3 className="font-rethink-sans text-xl font-extrabold text-black">{t("daily_table_title")}</h3>
            <p className="text-sm font-medium text-neutral-700">{t("daily_table_desc")}</p>
          </div>
          <Badge variant="outline" className="rounded-none border-2 border-black bg-white text-black">
            {t("daily_table_recent", { count: recentRows.length })}
          </Badge>
        </div>

        {recentRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black hover:bg-transparent">
                <TableHead className="font-extrabold text-black">{t("daily_table_date")}</TableHead>
                <TableHead className="text-right font-extrabold text-black">{t("daily_requests")}</TableHead>
                <TableHead className="text-right font-extrabold text-black">{t("daily_earnings")}</TableHead>
                <TableHead className="text-right font-extrabold text-black">{t("daily_actual_trees")}</TableHead>
                <TableHead className="text-right font-extrabold text-black">{t("daily_active_nodes")}</TableHead>
                <TableHead className="hidden text-right font-extrabold text-black sm:table-cell">{t("daily_estimated_trees")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRows.map((row, index) => (
                <TableRow key={row.key} className={index === 0 ? "bg-brand-yellow/20" : undefined}>
                  <TableCell className="font-bold text-black">
                    <div className="flex flex-col">
                      <span>{formatDate(row.date)}</span>
                      {index === 0 && <span className="text-xs font-extrabold uppercase text-neutral-500">{t("latest")}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-black">{formatNumber(row.requests)}</TableCell>
                  <TableCell className="text-right font-bold text-black">{formatCurrency(row.earnings)}</TableCell>
                  <TableCell className="text-right font-bold text-black">{formatTrees(row.actualTrees)}</TableCell>
                  <TableCell className="text-right font-bold text-black">{row.activeNodes.toLocaleString()}</TableCell>
                  <TableCell className="hidden text-right font-bold text-black sm:table-cell">{formatTrees(row.estimatedTrees)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-4 py-10 text-center text-sm font-medium text-neutral-700">
            {t("daily_table_empty")}
          </div>
        )}
      </div>
    </section>
  )
}
