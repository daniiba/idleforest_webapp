import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export const revalidate = 3600

type CreatedAtRow = {
    created_at: string | null
}

const PAGE_SIZE = 1000

const dateKeyFromDate = (date: Date) => {
    const year = date.getUTCFullYear()
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
    const day = `${date.getUTCDate()}`.padStart(2, "0")
    return `${year}-${month}-${day}`
}

async function fetchCreatedAtRows(
    table: "profiles" | "nodes",
    filterAnonymousNodes = false
) {
    const supabase = createAdminClient()
    const rows: CreatedAtRow[] = []
    let from = 0

    while (true) {
        let query = supabase
            .from(table)
            .select("created_at")
            .order("created_at", { ascending: true })
            .range(from, from + PAGE_SIZE - 1)

        if (filterAnonymousNodes) {
            query = query.is("user_id", null)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        rows.push(...(data ?? []))

        if (!data || data.length < PAGE_SIZE) {
            break
        }

        from += PAGE_SIZE
    }

    return rows
}

export async function GET() {
    try {
        const [profileRows, anonymousNodeRows] = await Promise.all([
            fetchCreatedAtRows("profiles"),
            fetchCreatedAtRows("nodes", true),
        ])

        const dailyAdds = new Map<string, number>()

        for (const row of [...profileRows, ...anonymousNodeRows]) {
            if (!row.created_at) continue

            const date = new Date(row.created_at)
            if (Number.isNaN(date.getTime())) continue

            const key = dateKeyFromDate(date)
            dailyAdds.set(key, (dailyAdds.get(key) ?? 0) + 1)
        }

        let runningTotal = 0
        const history = Array.from(dailyAdds.entries())
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([date, adds]) => {
                runningTotal += adds
                return {
                    date,
                    total_users: runningTotal,
                }
            })

        return NextResponse.json(
            { history },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
                },
            }
        )
    } catch (error) {
        console.error("Failed to build report user history:", error)
        return NextResponse.json({ history: [] }, { status: 500 })
    }
}
