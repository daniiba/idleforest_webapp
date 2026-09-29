'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Link } from "@/navigation";
import { Trophy, Search, Users, Award, TrendingUp, Flame, Zap, Calendar, MessageSquare, Plus, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { isHiddenTopTeamSlug } from "@/lib/team-visibility"

interface Team {
	id: string
	slug: string
	name: string
	created_at: string
	created_by: string
	total_points: number
	image_url: string | null
	discord_guild_id?: string | null
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
			.select('id, slug, name, created_at, created_by, total_points, image_url, discord_guild_id')
			.order('total_points', { ascending: false })

		if (teamsData) {
			setTeams(teamsData.filter(team => !isHiddenTopTeamSlug(team.slug)))
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
				.limit(40)

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
					limit_count: 40
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
			.filter(team => team.team_slug && !isHiddenTopTeamSlug(team.team_slug))
			.slice(0, 20)

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
			.filter(team => team.team_slug && !isHiddenTopTeamSlug(team.team_slug))
			.slice(0, 20)

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

	const pill = (active: boolean) =>
		`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active
			? 'bg-brand-navy text-white'
			: 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-100'
		}`

	const Avatar = ({ src, alt }: { src?: string | null; alt?: string }) =>
		src ? (
			// eslint-disable-next-line @next/next/no-img-element
			<img src={src} alt={alt || ''} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
		) : (
			<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-brand-navy">
				<Users className="h-4 w-4" aria-hidden="true" />
			</span>
		)

	const RankRow = ({ href, rank, title, subtitle, image, showAvatar, label, value, valueClass }: {
		href: string
		rank: number
		title: string
		subtitle?: string
		image?: string | null
		showAvatar?: boolean
		label: string
		value: string
		valueClass?: string
	}) => (
		<Link href={href} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-neutral-50 sm:px-6">
			<div className="flex min-w-0 items-center gap-3">
				<span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${rank === 1 ? 'bg-brand-yellow text-brand-navy' : rank <= 3 ? 'bg-neutral-200 text-brand-navy' : 'text-neutral-500'}`}>
					{rank}
				</span>
				{showAvatar && <Avatar src={image} alt={title} />}
				<div className="min-w-0">
					<h3 className="truncate text-base font-semibold text-brand-navy">{title}</h3>
					{subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
				</div>
			</div>
			<div className="shrink-0 text-right">
				<p className="text-[11px] font-medium text-neutral-500">{label}</p>
				<p className={`text-base font-bold tabular-nums ${valueClass || 'text-brand-navy'}`}>{value}</p>
			</div>
		</Link>
	)

	const listCard = 'overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100'
	const emptyRow = (text: string) => <p className="p-8 text-center text-sm font-medium text-neutral-500">{text}</p>
	const listTitle = (text: string) => <p className="text-center text-sm font-semibold text-neutral-500">{text}</p>

	return (
		<div className="min-h-screen bg-[#F7F7F2] px-4 py-8 text-brand-navy sm:py-12">
			<div className="mx-auto max-w-5xl space-y-8">
				{/* Header */}
				<section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
					<div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
						<div className="max-w-2xl">
							<span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-navy">
								<Users className="h-3.5 w-3.5" aria-hidden="true" />
								{t('hero_badge')}
							</span>
							<h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{t('hero_title')}</h1>
							<p className="mt-3 text-base text-neutral-600">{t('hero_description')}</p>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
							<Link
								href="/create-team"
								className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:brightness-95"
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								{t('create_team_cta')}
							</Link>
							<button
								onClick={() => setActiveTab('teams')}
								className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
							>
								{t('find_team_cta')}
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					</div>
					<dl className="mt-8 grid gap-3 sm:grid-cols-3">
						{[
							{ value: teams.length, label: t('active_teams') },
							{ value: periodTopTeams.length, label: t('teams_active_today') },
							{ value: fastestGrowingTeams.length, label: t('growing_this_period') },
						].map(stat => (
							<div key={stat.label} className="rounded-2xl bg-neutral-50 p-4">
								<dd className="text-2xl font-extrabold tabular-nums">{stat.value.toLocaleString()}</dd>
								<dt className="mt-0.5 text-xs font-medium text-neutral-500">{stat.label}</dt>
							</div>
						))}
					</dl>
				</section>

				{/* Tabs */}
				<div className="flex justify-center">
					<div className="inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-neutral-200" role="tablist">
						<button role="tab" aria-selected={activeTab === 'rankings'} onClick={() => setActiveTab('rankings')} className={pill(activeTab === 'rankings')}>
							<Award className="h-4 w-4" aria-hidden="true" />
							Rankings
						</button>
						<button role="tab" aria-selected={activeTab === 'teams'} onClick={() => setActiveTab('teams')} className={pill(activeTab === 'teams')}>
							<Users className="h-4 w-4" aria-hidden="true" />
							Teams
						</button>
					</div>
				</div>

				{/* Teams Tab */}
				{activeTab === 'teams' && (
					<>
						<div className="flex justify-center">
							<div className="relative w-full max-w-xl">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} aria-hidden="true" />
								<input
									placeholder={t('placeholder_search')}
									aria-label={t('placeholder_search')}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full rounded-full border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-brand-navy placeholder:text-neutral-400 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-yellow"
								/>
							</div>
						</div>

						{isLoading ? (
							<div className="flex min-h-[200px] items-center justify-center">
								<p className="text-sm font-medium text-neutral-500">{t('loading_teams')}</p>
							</div>
						) : filteredTeams.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{filteredTeams.map((team) => (
									<Link href={`/teams/${team.slug}`} key={team.id} className="block min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
										<div className="flex w-full items-center gap-3">
											<Avatar src={team.image_url} alt={team.name} />
											<div className="min-w-0 flex-1">
												<div className="flex min-w-0 items-center gap-2">
													<h2 className="truncate text-base font-bold">{team.name}</h2>
													{team.discord_guild_id && (
														<span title="Discord team" aria-label="Discord team" className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5865F2] text-white">
															<MessageSquare className="h-3 w-3" aria-hidden="true" />
														</span>
													)}
												</div>
												<p className="mt-0.5 text-xs text-neutral-500">{t('created')} {formatCreated(team.created_at)}</p>
											</div>
											<span className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-sm font-bold tabular-nums">
												<Trophy size={13} aria-hidden="true" />
												{formatPoints(team.total_points)}
											</span>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
								<h2 className="mb-1 text-lg font-bold">{t('no_teams')}</h2>
								<p className="text-sm text-neutral-500">
									{searchQuery ? t('no_teams_search') : t('create_team_prompt')}
								</p>
							</div>
						)}
					</>
				)}

				{/* Rankings Tab */}
				{activeTab === 'rankings' && (
					<div className="mx-auto max-w-3xl space-y-5">
						<div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
							<div className="flex flex-wrap justify-center gap-2 lg:justify-start">
								{rankingCategories.map(({ key, label, icon: Icon }) => (
									<button key={key} onClick={() => setRankingCategory(key)} className={pill(rankingCategory === key)}>
										<Icon className="h-4 w-4" aria-hidden="true" />
										{label}
									</button>
								))}
							</div>

							{rankingCategory !== 'allTime' && (
								<div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white p-1 ring-1 ring-neutral-200">
									<Calendar className="ml-2 h-4 w-4 text-neutral-400" aria-hidden="true" />
									{timePeriods.map(({ key, label }) => (
										<button
											key={key}
											onClick={() => setTimePeriod(key)}
											className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${timePeriod === key ? 'bg-brand-yellow text-brand-navy' : 'text-neutral-600 hover:text-brand-navy'}`}
										>
											{label}
										</button>
									))}
								</div>
							)}
						</div>

						{isLoading ? (
							<div className="flex min-h-[200px] items-center justify-center">
								<p className="text-sm font-medium text-neutral-500">{t('loading_rankings')}</p>
							</div>
						) : (
							<>
								{rankingCategory === 'allTime' && (
									<>
										{listTitle(t('all_time_rankings_label'))}
										<div className={listCard}>
											{profiles.map(profile => (
												<RankRow key={profile.user_id} href={`/profile/${profile.display_name}`} rank={profile.rank} title={profile.display_name} label={t('points')} value={formatPoints(profile.total_points)} />
											))}
											{profiles.length === 0 && emptyRow(t('no_users'))}
										</div>
									</>
								)}

								{rankingCategory === 'users' && (
									<>
										{listTitle(`${t('top_earners_label')} - ${getPeriodLabel()}`)}
										<div className={listCard}>
											{periodTopUsers.map((user, idx) => (
												<RankRow key={user.user_id} href={`/profile/${user.display_name}`} rank={idx + 1} title={user.display_name || ''} label={getPeriodLabel()} value={`+${formatPoints(user.points_gained)}`} valueClass="text-green-600" />
											))}
											{periodTopUsers.length === 0 && emptyRow(t('no_data'))}
										</div>
									</>
								)}

								{rankingCategory === 'teams' && (
									<>
										{listTitle(`${t('top_teams_label')} - ${getPeriodLabel()}`)}
										<div className={listCard}>
											{periodTopTeams.map((team, idx) => (
												<RankRow key={team.team_id} href={`/teams/${team.team_slug}`} rank={idx + 1} title={team.team_name || ''} image={team.team_image} showAvatar label={getPeriodLabel()} value={`+${formatPoints(team.points_gained)}`} valueClass="text-green-600" />
											))}
											{periodTopTeams.length === 0 && emptyRow(t('no_data'))}
										</div>
									</>
								)}

								{rankingCategory === 'fastestGrowing' && (
									<>
										{listTitle(`${t('fastest_growing_label')} - ${getPeriodLabel()}`)}
										<div className={listCard}>
											{fastestGrowingTeams.map((team, idx) => (
												<RankRow key={team.team_id} href={`/teams/${team.team_slug}`} rank={idx + 1} title={team.team_name || ''} subtitle={`${team.member_count} ${t('members_total')}`} image={team.team_image} showAvatar label={t('new_members')} value={`+${team.member_growth || 0}`} valueClass="text-purple-600" />
											))}
											{fastestGrowingTeams.length === 0 && emptyRow(t('no_teams_gained'))}
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
