'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Trophy, Search, Users, Award, TrendingUp, Flame, Zap, Calendar } from "lucide-react"

interface Team {
	id: string
	name: string
	created_at: string
	created_by: string
	total_points: number
	image_url: string | null
}

interface RankedProfile {
	rank: number
	user_id: string
	display_name: string
	total_points: number
}

interface PeriodUserStat {
	user_id: string
	points_gained: number
	display_name?: string
}

interface PeriodTeamStat {
	team_id: string
	points_gained: number
	member_count: number
	team_name?: string
	team_image?: string | null
	member_growth?: number
}

type TimePeriod = 'daily' | 'weekly' | 'monthly'
type RankingCategory = 'allTime' | 'users' | 'teams' | 'fastestGrowing'

// Create client once outside component
const supabase = createClient()

export default function TeamsPage() {
	const [teams, setTeams] = useState<Team[]>([])
	const [profiles, setProfiles] = useState<RankedProfile[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<'teams' | 'rankings'>('rankings')
	const [rankingCategory, setRankingCategory] = useState<RankingCategory>('allTime')
	const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily')
	const [periodTopUsers, setPeriodTopUsers] = useState<PeriodUserStat[]>([])
	const [periodTopTeams, setPeriodTopTeams] = useState<PeriodTeamStat[]>([])
	const [fastestGrowingTeams, setFastestGrowingTeams] = useState<PeriodTeamStat[]>([])

	useEffect(() => {
		fetchBaseData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (rankingCategory !== 'allTime') {
			fetchPeriodData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timePeriod, rankingCategory])

	const getDateRange = (period: TimePeriod) => {
		const today = new Date()
		const endDate = today.toISOString().split('T')[0]
		let startDate: string

		if (period === 'daily') {
			startDate = endDate
		} else if (period === 'weekly') {
			const weekAgo = new Date(today)
			weekAgo.setDate(weekAgo.getDate() - 7)
			startDate = weekAgo.toISOString().split('T')[0]
		} else {
			const monthAgo = new Date(today)
			monthAgo.setDate(monthAgo.getDate() - 30)
			startDate = monthAgo.toISOString().split('T')[0]
		}

		return { startDate, endDate }
	}

	const fetchBaseData = async () => {
		setIsLoading(true)

		// Fetch teams with image_url
		const { data: teamsData } = await supabase
			.from('teams')
			.select('id, name, created_at, created_by, total_points, image_url')
			.order('total_points', { ascending: false })

		if (teamsData) {
			setTeams(teamsData)
		}

		// Fetch all-time user rankings
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

		// Fetch initial period data
		await fetchPeriodData()

		setIsLoading(false)
	}

	const fetchPeriodData = async () => {
		const { startDate, endDate } = getDateRange(timePeriod)

		// Fetch period top users - aggregate points over the period
		if (timePeriod === 'daily') {
			const { data: periodUsers } = await supabase
				.from('user_daily_stats')
				.select('user_id, points_gained_that_day')
				.eq('date', endDate)
				.order('points_gained_that_day', { ascending: false })
				.limit(20)

			if (periodUsers && periodUsers.length > 0) {
				const userIds = periodUsers.map(u => u.user_id)
				const { data: userProfiles } = await supabase
					.from('profiles')
					.select('user_id, display_name')
					.in('user_id', userIds)

				const profileMap = new Map(userProfiles?.map(p => [p.user_id, p.display_name]) || [])
				setPeriodTopUsers(periodUsers.map(u => ({
					user_id: u.user_id,
					points_gained: u.points_gained_that_day,
					display_name: profileMap.get(u.user_id) || 'Unknown'
				})))
			} else {
				setPeriodTopUsers([])
			}
		} else {
			// For weekly/monthly, we need to aggregate
			const { data: periodUsers } = await supabase
				.from('user_daily_stats')
				.select('user_id, points_gained_that_day')
				.gte('date', startDate)
				.lte('date', endDate)

			if (periodUsers && periodUsers.length > 0) {
				// Aggregate by user
				const userTotals = new Map<string, number>()
				periodUsers.forEach(u => {
					userTotals.set(u.user_id, (userTotals.get(u.user_id) || 0) + u.points_gained_that_day)
				})

				// Sort and get top 20
				const sorted = Array.from(userTotals.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 20)

				const userIds = sorted.map(([id]) => id)
				const { data: userProfiles } = await supabase
					.from('profiles')
					.select('user_id, display_name')
					.in('user_id', userIds)

				const profileMap = new Map(userProfiles?.map(p => [p.user_id, p.display_name]) || [])
				setPeriodTopUsers(sorted.map(([user_id, points_gained]) => ({
					user_id,
					points_gained,
					display_name: profileMap.get(user_id) || 'Unknown'
				})))
			} else {
				setPeriodTopUsers([])
			}
		}

		// Fetch period top teams
		if (timePeriod === 'daily') {
			const { data: periodTeams } = await supabase
				.from('team_daily_stats')
				.select('team_id, points_gained_that_day, member_count')
				.eq('date', endDate)
				.order('points_gained_that_day', { ascending: false })
				.limit(20)

			if (periodTeams && periodTeams.length > 0) {
				await enrichTeamData(periodTeams.map(t => ({
					team_id: t.team_id,
					points_gained: t.points_gained_that_day,
					member_count: t.member_count
				})), endDate)
			} else {
				setPeriodTopTeams([])
				setFastestGrowingTeams([])
			}
		} else {
			// For weekly/monthly, aggregate
			const { data: periodTeams } = await supabase
				.from('team_daily_stats')
				.select('team_id, points_gained_that_day, member_count, date')
				.gte('date', startDate)
				.lte('date', endDate)

			if (periodTeams && periodTeams.length > 0) {
				// Aggregate points and get latest member count
				const teamData = new Map<string, { points: number, member_count: number, start_members: number }>()

				// Sort by date to get proper start/end member counts
				const sortedByDate = [...periodTeams].sort((a, b) => a.date.localeCompare(b.date))

				sortedByDate.forEach(t => {
					const existing = teamData.get(t.team_id)
					if (existing) {
						existing.points += t.points_gained_that_day
						existing.member_count = t.member_count // Keep updating to get latest
					} else {
						teamData.set(t.team_id, {
							points: t.points_gained_that_day,
							member_count: t.member_count,
							start_members: t.member_count // First entry is start count
						})
					}
				})

				const sorted = Array.from(teamData.entries())
					.map(([team_id, data]) => ({
						team_id,
						points_gained: data.points,
						member_count: data.member_count,
						member_growth: data.member_count - data.start_members
					}))
					.sort((a, b) => b.points_gained - a.points_gained)
					.slice(0, 20)

				await enrichTeamDataWithGrowth(sorted)
			} else {
				setPeriodTopTeams([])
				setFastestGrowingTeams([])
			}
		}
	}

	const enrichTeamData = async (teamData: { team_id: string, points_gained: number, member_count: number }[], currentDate: string) => {
		const teamIds = teamData.map(t => t.team_id)

		const { data: teamInfo } = await supabase
			.from('teams')
			.select('id, name, image_url')
			.in('id', teamIds)

		// Get previous day's member counts for growth calculation
		const yesterday = new Date(currentDate)
		yesterday.setDate(yesterday.getDate() - 1)
		const yesterdayStr = yesterday.toISOString().split('T')[0]

		const { data: yesterdayStats } = await supabase
			.from('team_daily_stats')
			.select('team_id, member_count')
			.eq('date', yesterdayStr)
			.in('team_id', teamIds)

		const yesterdayMap = new Map(yesterdayStats?.map(t => [t.team_id, t.member_count]) || [])
		const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url }]) || [])

		const enrichedTeams = teamData.map(t => {
			const yesterdayCount = yesterdayMap.get(t.team_id) || 0
			return {
				...t,
				team_name: teamMap.get(t.team_id)?.name || 'Unknown',
				team_image: teamMap.get(t.team_id)?.image || null,
				member_growth: t.member_count - yesterdayCount
			}
		})

		setPeriodTopTeams(enrichedTeams)

		const fastestGrowing = [...enrichedTeams]
			.sort((a, b) => (b.member_growth || 0) - (a.member_growth || 0))
			.filter(t => (t.member_growth || 0) > 0)
		setFastestGrowingTeams(fastestGrowing)
	}

	const enrichTeamDataWithGrowth = async (teamData: { team_id: string, points_gained: number, member_count: number, member_growth: number }[]) => {
		const teamIds = teamData.map(t => t.team_id)

		const { data: teamInfo } = await supabase
			.from('teams')
			.select('id, name, image_url')
			.in('id', teamIds)

		const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url }]) || [])

		const enrichedTeams = teamData.map(t => ({
			...t,
			team_name: teamMap.get(t.team_id)?.name || 'Unknown',
			team_image: teamMap.get(t.team_id)?.image || null,
		}))

		setPeriodTopTeams(enrichedTeams)

		const fastestGrowing = [...enrichedTeams]
			.sort((a, b) => (b.member_growth || 0) - (a.member_growth || 0))
			.filter(t => (t.member_growth || 0) > 0)
		setFastestGrowingTeams(fastestGrowing)
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

	const rankingCategories = [
		{ key: 'allTime', label: 'All Time', icon: Trophy },
		{ key: 'users', label: 'Top Users', icon: Flame },
		{ key: 'teams', label: 'Top Teams', icon: Zap },
		{ key: 'fastestGrowing', label: 'Fastest Growing', icon: TrendingUp },
	] as const

	const timePeriods = [
		{ key: 'daily', label: 'Today' },
		{ key: 'weekly', label: 'This Week' },
		{ key: 'monthly', label: 'This Month' },
	] as const

	const getPeriodLabel = () => {
		switch (timePeriod) {
			case 'daily': return 'Today'
			case 'weekly': return 'This Week'
			case 'monthly': return 'This Month'
		}
	}

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
										<div className="flex items-center gap-4 w-full">
											{/* Team Image */}
											{team.image_url ? (
												<img
													src={team.image_url}
													alt={team.name}
													className="w-12 h-12 rounded-lg object-cover border-2 border-brand-yellow/50 flex-shrink-0"
												/>
											) : (
												<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-yellow to-yellow-300 flex items-center justify-center flex-shrink-0 border-2 border-brand-yellow/50">
													<Users className="w-6 h-6 text-brand-navy/60" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h2 className="text-lg md:text-xl font-semibold truncate">{team.name}</h2>
												<p className="mt-1 text-xs text-gray-400">Created {formatCreated(team.created_at)}</p>
											</div>
											<div className="flex items-center text-brand-yellow flex-shrink-0">
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
					{/* Ranking Category Selector */}
					<div className="flex flex-wrap justify-center gap-2 mb-4">
						{rankingCategories.map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								onClick={() => setRankingCategory(key)}
								className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${rankingCategory === key
									? 'bg-brand-yellow text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black'
									: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-brand-yellow'
									}`}
							>
								<Icon className="w-4 h-4" />
								{label}
							</button>
						))}
					</div>

					{/* Time Period Selector - show for non-allTime categories */}
					{rankingCategory !== 'allTime' && (
						<div className="flex justify-center gap-2 mb-6">
							<div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
								<Calendar className="w-4 h-4 text-gray-500 ml-2" />
								{timePeriods.map(({ key, label }) => (
									<button
										key={key}
										onClick={() => setTimePeriod(key)}
										className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${timePeriod === key
											? 'bg-brand-navy text-white'
											: 'text-gray-600 hover:text-black'
											}`}
									>
										{label}
									</button>
								))}
							</div>
						</div>
					)}

					{isLoading ? (
						<div className="flex justify-center items-center min-h-[200px]">
							<p className="text-gray-500">Loading rankings...</p>
						</div>
					) : (
						<>
							{/* All Time User Rankings */}
							{rankingCategory === 'allTime' && (
								<>
									<div className="text-center mb-4">
										<p className="text-sm text-gray-600">All-Time User Rankings</p>
									</div>
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
								</>
							)}

							{/* Period User Rankings */}
							{rankingCategory === 'users' && (
								<>
									<div className="text-center mb-4">
										<p className="text-sm text-gray-600">Top Earners - {getPeriodLabel()}</p>
									</div>
									<Card className="bg-brand-navy text-white border border-zinc-800 overflow-hidden">
										{periodTopUsers.map((user, idx) => (
											<Link
												key={user.user_id}
												href={`/profile/${user.display_name}`}
												className="block"
											>
												<div className={`flex items-center justify-between px-6 py-4 ${idx < periodTopUsers.length - 1 ? 'border-b border-zinc-800' : ''} hover:bg-white/5 transition-colors`}>
													<div className="flex items-center gap-4 min-w-0">
														<span className="text-lg font-bold text-brand-yellow shrink-0">#{idx + 1}</span>
														<h3 className="text-base md:text-lg font-semibold truncate">{user.display_name}</h3>
													</div>
													<div className="text-right shrink-0">
														<p className="text-[10px] uppercase tracking-wide text-gray-400">{getPeriodLabel()}</p>
														<p className="text-base md:text-lg font-bold text-green-400 tabular-nums">+{formatPoints(user.points_gained)}</p>
													</div>
												</div>
											</Link>
										))}
										{periodTopUsers.length === 0 && (
											<p className="text-gray-400 text-center p-6">No data for this period</p>
										)}
									</Card>
								</>
							)}

							{/* Period Team Rankings */}
							{rankingCategory === 'teams' && (
								<>
									<div className="text-center mb-4">
										<p className="text-sm text-gray-600">Top Teams - {getPeriodLabel()}</p>
									</div>
									<Card className="bg-brand-navy text-white border border-zinc-800 overflow-hidden">
										{periodTopTeams.map((team, idx) => (
											<Link
												key={team.team_id}
												href={`/teams/${team.team_id}`}
												className="block"
											>
												<div className={`flex items-center justify-between px-6 py-4 ${idx < periodTopTeams.length - 1 ? 'border-b border-zinc-800' : ''} hover:bg-white/5 transition-colors`}>
													<div className="flex items-center gap-4 min-w-0">
														<span className="text-lg font-bold text-brand-yellow shrink-0">#{idx + 1}</span>
														{team.team_image ? (
															<img src={team.team_image} alt={team.team_name} className="w-8 h-8 rounded object-cover" />
														) : (
															<div className="w-8 h-8 rounded bg-brand-yellow/20 flex items-center justify-center">
																<Users className="w-4 h-4 text-brand-yellow" />
															</div>
														)}
														<h3 className="text-base md:text-lg font-semibold truncate">{team.team_name}</h3>
													</div>
													<div className="text-right shrink-0">
														<p className="text-[10px] uppercase tracking-wide text-gray-400">{getPeriodLabel()}</p>
														<p className="text-base md:text-lg font-bold text-green-400 tabular-nums">+{formatPoints(team.points_gained)}</p>
													</div>
												</div>
											</Link>
										))}
										{periodTopTeams.length === 0 && (
											<p className="text-gray-400 text-center p-6">No data for this period</p>
										)}
									</Card>
								</>
							)}

							{/* Fastest Growing Teams */}
							{rankingCategory === 'fastestGrowing' && (
								<>
									<div className="text-center mb-4">
										<p className="text-sm text-gray-600">Fastest Growing (New Members) - {getPeriodLabel()}</p>
									</div>
									<Card className="bg-brand-navy text-white border border-zinc-800 overflow-hidden">
										{fastestGrowingTeams.map((team, idx) => (
											<Link
												key={team.team_id}
												href={`/teams/${team.team_id}`}
												className="block"
											>
												<div className={`flex items-center justify-between px-6 py-4 ${idx < fastestGrowingTeams.length - 1 ? 'border-b border-zinc-800' : ''} hover:bg-white/5 transition-colors`}>
													<div className="flex items-center gap-4 min-w-0">
														<span className="text-lg font-bold text-brand-yellow shrink-0">#{idx + 1}</span>
														{team.team_image ? (
															<img src={team.team_image} alt={team.team_name} className="w-8 h-8 rounded object-cover" />
														) : (
															<div className="w-8 h-8 rounded bg-brand-yellow/20 flex items-center justify-center">
																<Users className="w-4 h-4 text-brand-yellow" />
															</div>
														)}
														<div className="min-w-0">
															<h3 className="text-base md:text-lg font-semibold truncate">{team.team_name}</h3>
															<p className="text-xs text-gray-400">{team.member_count} members total</p>
														</div>
													</div>
													<div className="text-right shrink-0">
														<p className="text-[10px] uppercase tracking-wide text-gray-400">New Members</p>
														<p className="text-base md:text-lg font-bold text-purple-400 tabular-nums">
															+{team.member_growth || 0}
														</p>
													</div>
												</div>
											</Link>
										))}
										{fastestGrowingTeams.length === 0 && (
											<p className="text-gray-400 text-center p-6">No teams gained members this period</p>
										)}
									</Card>
								</>
							)}
						</>
					)}
				</div>
			)}
		</div>
	)
}
