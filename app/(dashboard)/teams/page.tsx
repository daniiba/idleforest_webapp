'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Trophy, Search, Users, Award } from "lucide-react"

interface Team {
	id: string
	name: string
	created_at: string
	created_by: string
	total_points: number
}

interface RankedProfile {
	rank: number
	user_id: string
	display_name: string
	total_points: number
}

// Create client once outside component
const supabase = createClient()

export default function TeamsPage() {
	const [teams, setTeams] = useState<Team[]>([])
	const [profiles, setProfiles] = useState<RankedProfile[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<'teams' | 'rankings'>('teams')

	useEffect(() => {
		fetchData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const fetchData = async () => {
		setIsLoading(true)

		// Fetch teams
		const { data: teamsData } = await supabase
			.from('teams')
			.select('*')
			.order('total_points', { ascending: false })

		if (teamsData) {
			setTeams(teamsData)
		}

		// Fetch rankings
		const { data: profilesData } = await supabase
			.from('profiles')
			.select('user_id, display_name, total_points')
			.order('total_points', { ascending: false })
			.limit(100)

		if (profilesData) {
			const rankedProfiles = profilesData.map((profile, index) => ({
				...profile,
				rank: index + 1
			}))
			setProfiles(rankedProfiles)
		}

		setIsLoading(false)
	}

	const filteredTeams = teams.filter(team =>
		team.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const formatCreated = (iso: string) => {
		const d = new Date(iso)
		const mm = String(d.getMonth() + 1).padStart(2, '0')
		const dd = String(d.getDate()).padStart(2, '0')
		const yyyy = d.getFullYear()
		return `${mm}.${dd}.${yyyy}`
	}

	const formatPoints = (n: number) => Math.round(n).toLocaleString()

	return (
		<div className="container mx-auto p-4 pt-24">
			{/* Title */}
			<div className="flex justify-center items-center mb-8">
				<h1 className="text-6xl md:text-7xl font-extrabold font-rethink-sans tracking-tight text-black">Teams</h1>
			</div>

			{/* Tabs */}
			<div className="flex justify-center mb-8">
				<div className="inline-flex rounded-lg bg-brand-navy/95 p-1 gap-1">
					<button
						onClick={() => setActiveTab('teams')}
						className={`px-6 py-3 rounded-md font-semibold transition-colors ${activeTab === 'teams'
							? 'bg-brand-yellow text-black'
							: 'text-white hover:text-brand-yellow'
							}`}
					>
						<Users className="inline-block mr-2 h-4 w-4" />
						Teams
					</button>
					<button
						onClick={() => setActiveTab('rankings')}
						className={`px-6 py-3 rounded-md font-semibold transition-colors ${activeTab === 'rankings'
							? 'bg-brand-yellow text-black'
							: 'text-white hover:text-brand-yellow'
							}`}
					>
						<Award className="inline-block mr-2 h-4 w-4" />
						Rankings
					</button>
				</div>
			</div>

			{/* Teams Tab */}
			{activeTab === 'teams' && (
				<>
					{/* Search */}
					<div className="flex justify-center mb-10">
						<div className="relative w-full max-w-xl">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
							<Input
								placeholder="Search Teams"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-4 py-6 rounded-full bg-brand-navy/95 text-white placeholder:text-gray-300 border border-transparent focus-visible:ring-0 focus:border-brand-yellow"
							/>
						</div>
					</div>

					{/* Grid */}
					{isLoading ? (
						<div className="flex justify-center items-center min-h-[200px]">
							<p className="text-gray-500">Loading teams...</p>
						</div>
					) : filteredTeams.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredTeams.map((team) => (
								<Link href={`/teams/${team.id}`} key={team.id}>
									<Card className="p-6 flex items-center bg-brand-navy text-white border border-zinc-800 hover:border-brand-yellow transition-colors cursor-pointer">
										<div className="flex items-center justify-between gap-4 w-full">
											<div>
												<h2 className="text-lg md:text-xl font-semibold max-w-[200px] truncate">{team.name}</h2>
												<p className="mt-1 text-xs text-gray-400">Created {formatCreated(team.created_at)}</p>
											</div>
											<div className="flex items-center text-brand-yellow">
												<Trophy size={16} className="mr-1" />
												<span className="tabular-nums">{formatPoints(team.total_points)}</span>
											</div>
										</div>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<Card className="p-6 bg-brand-navy text-white border border-zinc-800">
							<h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
							<p className="text-gray-400">
								{searchQuery ? "No teams match your search" : "Create a team to get started"}
							</p>
						</Card>
					)}
				</>
			)}

			{/* Rankings Tab */}
			{activeTab === 'rankings' && (
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-8">
						<p className="text-sm text-gray-600">User Performance Ranking</p>
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center min-h-[200px]">
							<p className="text-gray-500">Loading rankings...</p>
						</div>
					) : (
						<Card className="bg-brand-navy text-white border border-zinc-800 overflow-hidden">
							{profiles.map((profile, idx) => (
								<Link
									key={profile.user_id}
									href={`/profile/${profile.display_name}`}
									className="block"
								>
									<div className={`flex items-center justify-between px-6 py-4 ${idx < profiles.length - 1 ? 'border-b border-zinc-800' : ''} hover:bg-white/5 transition-colors`}>
										<div className="flex items-center gap-4 min-w-0">
											<span className="text-lg font-bold text-brand-yellow shrink-0">#{profile.rank}</span>
											<h3 className="text-base md:text-lg font-semibold truncate">{profile.display_name}</h3>
										</div>
										<div className="text-right shrink-0">
											<p className="text-[10px] uppercase tracking-wide text-gray-400">Points</p>
											<p className="text-base md:text-lg font-bold text-brand-yellow tabular-nums">{formatPoints(profile.total_points)}</p>
										</div>
									</div>
								</Link>
							))}

							{profiles.length === 0 && (
								<p className="text-gray-400 text-center p-6">No users found</p>
							)}
						</Card>
					)}
				</div>
			)}
		</div>
	)
}
