import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Users, Apple, Chrome } from "lucide-react"

interface TeamMember {
    id: string
    user_id: string
    team_id: string
    joined_at: string
    contribution_points?: number
    profile?: {
        display_name: string
        username?: string
    }
    platforms?: string[] // 'windows' | 'mac' | 'extension'
    role?: 'owner' | 'admin' | 'member'
}

interface TeamMembersProps {
    members: TeamMember[]
    teamCreatorId: string
}

export function TeamMembers({ members, teamCreatorId }: TeamMembersProps) {
    return (
        <Card className="p-6 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-yellow p-3 rounded-lg">
                    <Users className="w-6 h-6 text-brand-navy" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Team Members</h2>
                    <p className="text-gray-400">{members.length} members</p>
                </div>
            </div>
            <div className="space-y-4">
                {members.length > 0 ? (
                    members.map((member) => (
                        <Link
                            key={member.id}
                            href={`/profile/${member.profile?.display_name}`}
                            className="block"
                        >
                            <div className="flex items-center justify-between p-4 border-2 border-brand-yellow rounded-lg hover:bg-brand-yellow/30 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-white">{member.profile?.display_name || 'Anonymous'}</p>
                                        {member.user_id === teamCreatorId && (
                                            <span className="text-sm text-brand-yellow">Admin</span>
                                        )}
                                    </div>
                                    {/* Platform Icons */}
                                    {member.platforms && member.platforms.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            {member.platforms.includes('windows') && (
                                                <div className="bg-blue-500/20 p-1 rounded" title="Windows">
                                                    <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                                    </svg>
                                                </div>
                                            )}
                                            {member.platforms.includes('mac') && (
                                                <div className="bg-gray-500/20 p-1 rounded" title="Mac">
                                                    <Apple className="w-3 h-3 text-gray-300" />
                                                </div>
                                            )}
                                            {member.platforms.includes('extension') && (
                                                <div className="bg-green-500/20 p-1 rounded" title="Browser Extension">
                                                    <Chrome className="w-3 h-3 text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Points</p>
                                        <p className="text-xl font-bold text-brand-yellow">{member.contribution_points?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-400 text-center p-4">No members in this team yet</p>
                )}
            </div>
        </Card>
    )
}
