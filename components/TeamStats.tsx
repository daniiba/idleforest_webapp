import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { PointsHistoryChart } from "@/components/PointsHistoryChart"

interface TeamStatsProps {
    team: {
        total_points: number
        created_at: string
    }
    memberCount: number
    historicalData: any[]
}

export function TeamStats({ team, memberCount, historicalData }: TeamStatsProps) {
    return (
        <div className="grid gap-8">
            {/* Team Points History */}
            {historicalData.length > 0 ? (
                <PointsHistoryChart
                    data={historicalData}
                    title="Team Points History"
                    showMemberCount={true}
                />
            ) : (
                <div className="p-8 text-center bg-white border-2 border-black border-dashed">
                    <p className="text-gray-500">No historical data available yet.</p>
                </div>
            )}
        </div>
    )
}
