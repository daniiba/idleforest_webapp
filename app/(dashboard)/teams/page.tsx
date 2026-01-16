'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from "next/link"
import { Trophy, Search, Users, Award, TrendingUp, Flame, Zap, Calendar } from "lucide-react"

interface Team {
	id: string
	slug: string
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
	team_slug?: string
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
	// const [topDailyTeams, setTopDailyTeams] = useState<PeriodTeamStat[]>([]) // Moved to layout

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
			.select('id, slug, name, created_at, created_by, total_points, image_url')
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
		// await fetchTopDailyTeams() // Moved to layout

		setIsLoading(false)
	}

	/* Moved to layout
	const fetchTopDailyTeams = async () => {
		...
	}
	*/

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
			.select('id, name, image_url, slug')
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
		const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url, slug: t.slug }]) || [])

		const enrichedTeams = teamData.map(t => {
			const yesterdayCount = yesterdayMap.get(t.team_id) || 0
			return {
				...t,
				team_slug: teamMap.get(t.team_id)?.slug,
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
			.select('id, name, image_url, slug')
			.in('id', teamIds)

		const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url, slug: t.slug }]) || [])

		const enrichedTeams = teamData.map(t => ({
			...t,
			team_slug: teamMap.get(t.team_id)?.slug,
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
		<div className="min-h-screen bg-brand-gray p-4 font-rethink-sans">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Top 3 Daily Banner - MOVED TO LAYOUT */}

				{/* Header */}


				{/* Tabs */}
				<div className="flex justify-center">
					<div className="inline-flex bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 gap-1">
						<button
							onClick={() => setActiveTab('rankings')}
							className={`px-6 py-3 font-bold uppercase text-sm transition-all ${activeTab === 'rankings'
								? 'bg-brand-yellow text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
								: 'text-neutral-600 hover:text-black hover:bg-gray-100'
								}`}
						>
							<Award className="inline-block mr-2 h-4 w-4" />
							Rankings
						</button>
						<button
							onClick={() => setActiveTab('teams')}
							className={`px-6 py-3 font-bold uppercase text-sm transition-all ${activeTab === 'teams'
								? 'bg-brand-yellow text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
								: 'text-neutral-600 hover:text-black hover:bg-gray-100'
								}`}
						>
							<Users className="inline-block mr-2 h-4 w-4" />
							Teams
						</button>
					</div>
				</div>

				{/* Teams Tab */}
				{activeTab === 'teams' && (
					<>
						{/* Search */}
						<div className="flex justify-center">
							<div className="relative w-full max-w-xl">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
								<input
									placeholder="Search Teams"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-4 border-2 border-black bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
								/>
							</div>
						</div>

						{/* Grid */}
						{isLoading ? (
							<div className="flex justify-center items-center min-h-[200px]">
								<p className="text-neutral-500 font-bold">Loading teams...</p>
							</div>
						) : filteredTeams.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{filteredTeams.map((team) => (
									<Link href={`/teams/${team.slug}`} key={team.id} className="block min-w-0">
										<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
											<div className="flex items-center gap-4 w-full">
												{/* Team Image */}
												{team.image_url ? (
													<img
														src={team.image_url}
														alt={team.name}
														className="w-12 h-12 object-cover border-2 border-black flex-shrink-0"
													/>
												) : (
													<div className="w-12 h-12 bg-brand-yellow border-2 border-black flex items-center justify-center flex-shrink-0">
														<Users className="w-6 h-6 text-black" />
													</div>
												)}
												<div className="flex-1 min-w-0">
													<h2 className="text-lg font-bold truncate text-black">{team.name}</h2>
													<p className="mt-1 text-xs text-neutral-500">Created {formatCreated(team.created_at)}</p>
												</div>
												<div className="flex items-center bg-brand-yellow border-2 border-black px-2 py-1 flex-shrink-0">
													<Trophy size={14} className="mr-1 text-black" />
													<span className="tabular-nums font-bold text-sm text-black">{formatPoints(team.total_points)}</span>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
								<h2 className="text-xl font-bold mb-2 text-black">No Teams Found</h2>
								<p className="text-neutral-500">
									{searchQuery ? "No teams match your search" : "Create a team to get started"}
								</p>
							</div>
						)}
					</>
				)}

				{/* Rankings Tab */}
				{activeTab === 'rankings' && (
					<div className="max-w-3xl mx-auto space-y-6">
						{/* Filters Bar */}
						<div className="flex flex-col lg:flex-row justify-between items-center gap-4">
							{/* Ranking Category Selector */}
							<div className="flex flex-wrap justify-center lg:justify-start gap-2">
								{rankingCategories.map(({ key, label, icon: Icon }) => (
									<button
										key={key}
										onClick={() => setRankingCategory(key)}
										className={`flex items-center gap-2 px-3 py-2 font-bold text-xs md:text-sm uppercase transition-all ${rankingCategory === key
											? 'bg-brand-yellow text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
											: 'bg-white text-neutral-600 border-2 border-black hover:bg-gray-100'
											}`}
									>
										<Icon className="w-4 h-4" />
										{label}
									</button>
								))}
							</div>

							{/* Time Period Selector */}
							{rankingCategory !== 'allTime' && (
								<div className="inline-flex items-center gap-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1 flex-shrink-0">
									<Calendar className="w-4 h-4 text-neutral-500 ml-2" />
									{timePeriods.map(({ key, label }) => (
										<button
											key={key}
											onClick={() => setTimePeriod(key)}
											className={`px-3 py-1.5 text-xs md:text-sm font-bold uppercase transition-all ${timePeriod === key
												? 'bg-black text-white'
												: 'text-neutral-600 hover:text-black'
												}`}
										>
											{label}
										</button>
									))}
								</div>
							)}
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center min-h-[200px]">
								<p className="text-neutral-500 font-bold">Loading rankings...</p>
							</div>
						) : (
							<>
								{/* All Time User Rankings */}
								{rankingCategory === 'allTime' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">All-Time User Rankings</p>
										</div>
										<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
											{profiles.map((profile, idx) => (
												<Link
													key={profile.user_id}
													href={`/profile/${profile.display_name}`}
													className="block"
												>
													<div className={`flex items-center justify-between px-6 py-4 ${idx < profiles.length - 1 ? 'border-b-2 border-black' : ''} hover:bg-brand-yellow/10 transition-colors`}>
														<div className="flex items-center gap-4 min-w-0">
															<span className="text-lg font-extrabold text-black bg-brand-yellow border-2 border-black px-2 py-0.5 shrink-0">#{profile.rank}</span>
															<h3 className="text-base md:text-lg font-bold truncate text-black">{profile.display_name}</h3>
														</div>
														<div className="text-right shrink-0">
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">Points</p>
															<p className="text-base md:text-lg font-extrabold text-black tabular-nums">{formatPoints(profile.total_points)}</p>
														</div>
													</div>
												</Link>
											))}
											{profiles.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">No users found</p>
											)}
										</div>
									</>
								)}

								{/* Period User Rankings */}
								{rankingCategory === 'users' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Top Earners - {getPeriodLabel()}</p>
										</div>
										<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
											{periodTopUsers.map((user, idx) => (
												<Link
													key={user.user_id}
													href={`/profile/${user.display_name}`}
													className="block"
												>
													<div className={`flex items-center justify-between px-6 py-4 ${idx < periodTopUsers.length - 1 ? 'border-b-2 border-black' : ''} hover:bg-brand-yellow/10 transition-colors`}>
														<div className="flex items-center gap-4 min-w-0">
															<span className="text-lg font-extrabold text-black bg-brand-yellow border-2 border-black px-2 py-0.5 shrink-0">#{idx + 1}</span>
															<h3 className="text-base md:text-lg font-bold truncate text-black">{user.display_name}</h3>
														</div>
														<div className="text-right shrink-0">
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{getPeriodLabel()}</p>
															<p className="text-base md:text-lg font-extrabold text-green-600 tabular-nums">+{formatPoints(user.points_gained)}</p>
														</div>
													</div>
												</Link>
											))}
											{periodTopUsers.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">No data for this period</p>
											)}
										</div>
									</>
								)}

								{/* Period Team Rankings */}
								{rankingCategory === 'teams' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Top Teams - {getPeriodLabel()}</p>
										</div>
										<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
											{periodTopTeams.map((team, idx) => (
												<Link
													key={team.team_id}
													href={`/teams/${team.team_slug}`}
													className="block"
												>
													<div className={`flex items-center justify-between px-6 py-4 ${idx < periodTopTeams.length - 1 ? 'border-b-2 border-black' : ''} hover:bg-brand-yellow/10 transition-colors`}>
														<div className="flex items-center gap-4 min-w-0">
															<span className="text-lg font-extrabold text-black bg-brand-yellow border-2 border-black px-2 py-0.5 shrink-0">#{idx + 1}</span>
															{team.team_image ? (
																<img src={team.team_image} alt={team.team_name} className="w-8 h-8 object-cover border-2 border-black" />
															) : (
																<div className="w-8 h-8 bg-brand-yellow border-2 border-black flex items-center justify-center">
																	<Users className="w-4 h-4 text-black" />
																</div>
															)}
															<h3 className="text-base md:text-lg font-bold truncate text-black">{team.team_name}</h3>
														</div>
														<div className="text-right shrink-0">
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{getPeriodLabel()}</p>
															<p className="text-base md:text-lg font-extrabold text-green-600 tabular-nums">+{formatPoints(team.points_gained)}</p>
														</div>
													</div>
												</Link>
											))}
											{periodTopTeams.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">No data for this period</p>
											)}
										</div>
									</>
								)}

								{/* Fastest Growing Teams */}
								{rankingCategory === 'fastestGrowing' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Fastest Growing (New Members) - {getPeriodLabel()}</p>
										</div>
										<div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
											{fastestGrowingTeams.map((team, idx) => (
												<Link
													key={team.team_id}
													href={`/teams/${team.team_slug}`}
													className="block"
												>
													<div className={`flex items-center justify-between px-6 py-4 ${idx < fastestGrowingTeams.length - 1 ? 'border-b-2 border-black' : ''} hover:bg-brand-yellow/10 transition-colors`}>
														<div className="flex items-center gap-4 min-w-0">
															<span className="text-lg font-extrabold text-black bg-brand-yellow border-2 border-black px-2 py-0.5 shrink-0">#{idx + 1}</span>
															{team.team_image ? (
																<img src={team.team_image} alt={team.team_name} className="w-8 h-8 object-cover border-2 border-black" />
															) : (
																<div className="w-8 h-8 bg-brand-yellow border-2 border-black flex items-center justify-center">
																	<Users className="w-4 h-4 text-black" />
																</div>
															)}
															<div className="min-w-0">
																<h3 className="text-base md:text-lg font-bold truncate text-black">{team.team_name}</h3>
																<p className="text-xs text-neutral-500 font-medium">{team.member_count} members total</p>
															</div>
														</div>
														<div className="text-right shrink-0">
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">New Members</p>
															<p className="text-base md:text-lg font-extrabold text-purple-600 tabular-nums">
																+{team.member_growth || 0}
															</p>
														</div>
													</div>
												</Link>
											))}
											{fastestGrowingTeams.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">No teams gained members this period</p>
											)}
										</div>
									</>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
