'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from "next/link"
import { Trophy, Search, Users, Award, TrendingUp, Flame, Zap, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"

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
	const t = useTranslations('Teams')
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
			// For weekly/monthly, use server-side aggregation via RPC
			const { data: periodUsers, error } = await supabase
				.rpc('get_top_users_by_period', {
					start_date: startDate,
					end_date: endDate,
					limit_count: 20
				})

			console.log('RPC get_top_users_by_period:', { startDate, endDate, periodUsers, error })

			if (periodUsers && periodUsers.length > 0) {
				const userIds = periodUsers.map((u: { user_id: string }) => u.user_id)
				const { data: userProfiles } = await supabase
					.from('profiles')
					.select('user_id, display_name')
					.in('user_id', userIds)

				const profileMap = new Map(userProfiles?.map(p => [p.user_id, p.display_name]) || [])
				setPeriodTopUsers(periodUsers.map((u: { user_id: string, points_gained: number }) => ({
					user_id: u.user_id,
					points_gained: Number(u.points_gained), // Ensure it's a number
					display_name: profileMap.get(u.user_id) || 'Unknown'
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
			// For weekly/monthly, use server-side aggregation via RPC
			const { data: periodTeams, error } = await supabase
				.rpc('get_top_teams_by_period', {
					start_date: startDate,
					end_date: endDate,
					limit_count: 20
				})

			console.log('RPC get_top_teams_by_period:', { startDate, endDate, periodTeams, error })

			if (periodTeams && periodTeams.length > 0) {
				const teamIds = periodTeams.map((t: { team_id: string }) => t.team_id)

				// Fetch the EARLIEST member counts within the period for each team
				// (using order by date asc and getting distinct per team)
				const { data: periodStats, error: statsError } = await supabase
					.from('team_daily_stats')
					.select('team_id, member_count, date')
					.gte('date', startDate)
					.lte('date', endDate)
					.in('team_id', teamIds)
					.order('date', { ascending: true })

				console.log('Period stats query:', { startDate, endDate, periodStats, statsError })

				// Build maps with earliest and latest member counts per team
				const startMap = new Map<string, number>()
				const endMap = new Map<string, number>()

				if (periodStats) {
					for (const stat of periodStats) {
						// First occurrence (earliest date) sets the start count
						if (!startMap.has(stat.team_id)) {
							startMap.set(stat.team_id, stat.member_count)
						}
						// Always update end count (last occurrence will be latest date)
						endMap.set(stat.team_id, stat.member_count)
					}
				}

				console.log('Member count maps:', {
					startMap: Object.fromEntries(startMap),
					endMap: Object.fromEntries(endMap)
				})

				const teamData = periodTeams.map((t: { team_id: string, points_gained: number, member_count: number }) => {
					const startMembers = startMap.get(t.team_id)
					const endMembers = endMap.get(t.team_id)
					// Only calculate growth if we have both start and end data
					const memberGrowth = (startMembers !== undefined && endMembers !== undefined)
						? endMembers - startMembers
						: 0

					console.log(`Team ${t.team_id}: start=${startMembers}, end=${endMembers}, growth=${memberGrowth}`)

					return {
						team_id: t.team_id,
						points_gained: Number(t.points_gained), // Ensure it's a number
						member_count: endMembers || t.member_count,
						member_growth: memberGrowth
					}
				})

				await enrichTeamDataWithGrowth(teamData)
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
		{ key: 'allTime', label: t('all_time'), icon: Trophy },
		{ key: 'users', label: t('top_users'), icon: Flame },
		{ key: 'teams', label: t('top_teams_label'), icon: Zap },
		{ key: 'fastestGrowing', label: t('fastest_growing'), icon: TrendingUp },
	] as const

	const timePeriods = [
		{ key: 'daily', label: t('period_today') },
		{ key: 'weekly', label: t('period_week') },
		{ key: 'monthly', label: t('period_month') },
	] as const

	const getPeriodLabel = () => {
		switch (timePeriod) {
			case 'daily': return t('period_today')
			case 'weekly': return t('period_week')
			case 'monthly': return t('period_month')
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
									placeholder={t('placeholder_search')}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-4 border-2 border-black bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
								/>
							</div>
						</div>

						{/* Grid */}
						{isLoading ? (
							<div className="flex justify-center items-center min-h-[200px]">
								<p className="text-neutral-500 font-bold">{t('loading_teams')}</p>
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
													<p className="mt-1 text-xs text-neutral-500">{t('created')} {formatCreated(team.created_at)}</p>
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
								<h2 className="text-xl font-bold mb-2 text-black">{t('no_teams')}</h2>
								<p className="text-neutral-500">
									{searchQuery ? t('no_teams_search') : t('create_team_prompt')}
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
								<p className="text-neutral-500 font-bold">{t('loading_rankings')}</p>
							</div>
						) : (
							<>
								{/* All Time User Rankings */}
								{rankingCategory === 'allTime' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{t('all_time_rankings_label')}</p>
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
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{t('points')}</p>
															<p className="text-base md:text-lg font-extrabold text-black tabular-nums">{formatPoints(profile.total_points)}</p>
														</div>
													</div>
												</Link>
											))}
											{profiles.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">{t('no_users')}</p>
											)}
										</div>
									</>
								)}

								{/* Period User Rankings */}
								{rankingCategory === 'users' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{t('top_earners_label')} - {getPeriodLabel()}</p>
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
												<p className="text-neutral-500 text-center p-6 font-bold">{t('no_data')}</p>
											)}
										</div>
									</>
								)}

								{/* Period Team Rankings */}
								{rankingCategory === 'teams' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{t('top_teams_label')} - {getPeriodLabel()}</p>
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
												<p className="text-neutral-500 text-center p-6 font-bold">{t('no_data')}</p>
											)}
										</div>
									</>
								)}

								{/* Fastest Growing Teams */}
								{rankingCategory === 'fastestGrowing' && (
									<>
										<div className="text-center">
											<p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{t('fastest_growing_label')} - {getPeriodLabel()}</p>
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
																<p className="text-xs text-neutral-500 font-medium">{team.member_count} {t('members_total')}</p>
															</div>
														</div>
														<div className="text-right shrink-0">
															<p className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{t('new_members')}</p>
															<p className="text-base md:text-lg font-extrabold text-purple-600 tabular-nums">
																+{team.member_growth || 0}
															</p>
														</div>
													</div>
												</Link>
											))}
											{fastestGrowingTeams.length === 0 && (
												<p className="text-neutral-500 text-center p-6 font-bold">{t('no_teams_gained')}</p>
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
