'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Card } from "@/components/ui/card"
import { Users, Trophy, UserPlus, Copy, Check, Loader2, Trash2, Link as LinkIcon, LogOut, AlertTriangle, Download, Chrome, Apple, Info, RefreshCw, Pencil, Upload, X, Share2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

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
}

interface Team {
	id: string
	name: string
	description: string | null
	image_url: string | null
	created_at: string
	created_by: string
	total_points: number
}

interface Invite {
	id: string
	invite_code: string
	uses_remaining: number | null
	expires_at: string | null
	created_at: string
	total_uses?: number
	new_signups?: number
}

// Install Banner Component with platform detection
function InstallBanner({
	teamName,
	onCheckConnection,
	isChecking
}: {
	teamName: string,
	onCheckConnection: () => void,
	isChecking: boolean
}) {
	const [platform, setPlatform] = useState<'windows' | 'mac' | 'other'>('other')
	const [hasClickedInstall, setHasClickedInstall] = useState(false)

	useEffect(() => {
		const platformString = navigator.platform.toLowerCase()
		if (platformString.includes('win')) {
			setPlatform('windows')
		} else if (platformString.includes('mac')) {
			setPlatform('mac')
		}
	}, [])

	const handleInstallClick = () => {
		setHasClickedInstall(true)
	}

	// Direct download URLs
	const windowsUrl = 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe'
	const macUrl = 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip'
	const extensionUrl = 'https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk'

	return (
		<div className="mb-8">
			<div className="bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 z-10 relative transition-all duration-300">
				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					<div className="bg-brand-navy p-3 border-2 border-black">
						<Download className="w-6 h-6 text-brand-yellow" />
					</div>
					<div className="flex-1">
						<h3 className="font-bold text-lg text-black">Start Earning Points for Your Team!</h3>
						<p className="text-neutral-700 text-sm">Install IdleForest to contribute to {teamName}'s tree planting efforts.</p>
					</div>
					<div className="flex gap-2 flex-wrap">
						{platform === 'windows' && (
							<Link
								href={windowsUrl}
								target="_blank"
								onClick={handleInstallClick}
								className="flex items-center gap-2 px-5 py-3 bg-brand-navy text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
							>
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg> Download for Windows
							</Link>
						)}
						{platform === 'mac' && (
							<Link
								href={macUrl}
								target="_blank"
								onClick={handleInstallClick}
								className="flex items-center gap-2 px-5 py-3 bg-brand-navy text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
							>
								<Apple className="w-4 h-4" /> Download for Mac
							</Link>
						)}
						{platform === 'other' && (
							<Link
								href={extensionUrl}
								target="_blank"
								onClick={handleInstallClick}
								className="flex items-center gap-2 px-5 py-3 bg-brand-navy text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
							>
								<Chrome className="w-4 h-4" /> Get Browser Extension
							</Link>
						)}
						{/* Secondary option */}
						{platform !== 'other' && (
							<Link
								href={extensionUrl}
								target="_blank"
								onClick={handleInstallClick}
								className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
							>
								<Chrome className="w-4 h-4" /> Extension
							</Link>
						)}
					</div>
				</div>

				{/* Connection Status - Integrated inside */}
				<div className={`
					overflow-hidden transition-all duration-500 ease-in-out
					${hasClickedInstall ? 'max-h-[300px] opacity-100 mt-6 pt-6 border-t-2 border-black/10' : 'max-h-0 opacity-0'}
				`}>
					<div className="bg-white/50 border-2 border-black/20 p-4 rounded-lg">
						<div className="flex items-start gap-3 mb-3">
							<Info className="w-5 h-5 text-brand-navy flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-bold text-brand-navy">
									Important: Log in after installing
								</p>
								<p className="text-sm text-neutral-800 mt-1">
									After installing, open the app or extension and <strong>log in with your account</strong>.
									We'll automatically detect when you're connected.
								</p>
							</div>
						</div>
						<div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
							<div className="flex items-center gap-2 text-sm text-brand-navy font-medium">
								<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
								Waiting for connection...
							</div>
							<button
								onClick={onCheckConnection}
								disabled={isChecking}
								className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border-2 border-black hover:bg-neutral-50 disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
							>
								<RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
								Check Connection
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

// Create client once outside component
const supabase = createClient()

export default function TeamPage() {
	const [team, setTeam] = useState<Team | null>(null)
	const [members, setMembers] = useState<TeamMember[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
	const [isMember, setIsMember] = useState(false)
	const [showInviteSection, setShowInviteSection] = useState(false)
	const [invites, setInvites] = useState<Invite[]>([])
	const [creatingInvite, setCreatingInvite] = useState(false)
	const [copiedCode, setCopiedCode] = useState<string | null>(null)
	const [leavingTeam, setLeavingTeam] = useState(false)
	const [deletingTeam, setDeletingTeam] = useState(false)
	const [joiningTeam, setJoiningTeam] = useState(false)
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showJoinConfirm, setShowJoinConfirm] = useState(false)
	const [existingTeam, setExistingTeam] = useState<{ id: string; name: string } | null>(null)
	const [isCurrentTeamOwner, setIsCurrentTeamOwner] = useState(false)
	const [joinError, setJoinError] = useState<string | null>(null)
	const [hasNode, setHasNode] = useState<boolean | null>(null)
	const [isCheckingConnection, setIsCheckingConnection] = useState(false)
	// Edit team state
	const [showEditModal, setShowEditModal] = useState(false)
	const [editingTeam, setEditingTeam] = useState(false)
	const [editDescription, setEditDescription] = useState('')
	const [editError, setEditError] = useState('')
	const [editImageFile, setEditImageFile] = useState<File | null>(null)
	const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
	const [uploadingImage, setUploadingImage] = useState(false)
	const params = useParams()
	const router = useRouter()

	useEffect(() => {
		checkCurrentUser()
		fetchTeamData()
		fetchNodeStatus()
	}, [params.id])

	// Poll for node status every 5 seconds when user logs in and doesn't have a node yet
	useEffect(() => {
		// Only poll if we've checked status (hasNode !== null) and user doesn't have a node (hasNode === false)
		// and user is logged in (currentUser !== null)
		if (hasNode !== false || !currentUser) return

		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch('/api/user/node-status')
				if (response.ok) {
					const data = await response.json()
					if (data.hasNode) {
						setHasNode(true)
						// Optional: refresh team data to update member platform icons if needed
						fetchTeamData()
					}
				}
			} catch (error) {
				console.error('Polling error:', error)
			}
		}, 5000)

		return () => clearInterval(pollInterval)
	}, [hasNode, currentUser])

	const fetchNodeStatus = async () => {
		try {
			const response = await fetch('/api/user/node-status')
			if (response.ok) {
				const data = await response.json()
				setHasNode(data.hasNode)
			}
		} catch (error) {
			console.error('Error fetching node status:', error)
		}
	}

	const refetchNodeStatus = async () => {
		setIsCheckingConnection(true)
		try {
			const response = await fetch('/api/user/node-status')
			if (response.ok) {
				const data = await response.json()
				setHasNode(data.hasNode)
				if (data.hasNode) {
					fetchTeamData()
				}
			}
		} catch (error) {
			console.error('Error checking connection:', error)
		} finally {
			setIsCheckingConnection(false)
		}
	}

	const checkCurrentUser = async () => {
		const { data: { user } } = await supabase.auth.getUser()
		setCurrentUser(user)
	}

	const fetchTeamData = async () => {
		setIsLoading(true)

		// Get team data
		const { data: teamData } = await supabase
			.from('teams')
			.select('*')
			.eq('id', params.id)
			.single()

		if (teamData) {
			setTeam(teamData)

			// Get team members
			const { data: membersData } = await supabase
				.from('team_members')
				.select(`
					id,
					user_id,
					team_id,
					joined_at,
					contribution_points
				`)
				.eq('team_id', teamData.id)

			if (membersData) {
				// Check if current user is a member
				const { data: { user } } = await supabase.auth.getUser()
				if (user) {
					const userIsMember = membersData.some(m => m.user_id === user.id)
					setIsMember(userIsMember)
				}

				// Get profile and node information for each member
				const membersWithProfiles = await Promise.all(
					membersData.map(async (member) => {
						const { data: profileData } = await supabase
							.from('profiles')
							.select('display_name')
							.eq('user_id', member.user_id)
							.single()

						// Fetch nodes to determine platforms
						const { data: nodesData } = await supabase
							.from('nodes')
							.select('platform')
							.eq('user_id', member.user_id)

						// Determine platforms from nodes
						const platforms: string[] = []
						if (nodesData) {
							if (nodesData.some(n => n.platform === 'win32')) platforms.push('windows')
							if (nodesData.some(n => n.platform === 'darwin')) platforms.push('mac')
							if (nodesData.some(n => n.platform === null)) platforms.push('extension')
						}

						return {
							...member,
							profile: profileData || { display_name: 'Anonymous' },
							platforms
						}
					})
				)

				// Sort members by contribution points (highest first)
				const sortedMembers = membersWithProfiles.sort(
					(a, b) => (b.contribution_points || 0) - (a.contribution_points || 0)
				)

				setMembers(sortedMembers)
			}
		}

		setIsLoading(false)
	}

	const fetchInvites = async () => {
		try {
			const response = await fetch(`/api/teams/invite?teamId=${params.id}`)
			const data = await response.json()
			if (data.invites) {
				setInvites(data.invites)
			}
		} catch (error) {
			console.error('Error fetching invites:', error)
		}
	}

	const handleCreateInvite = async () => {
		setCreatingInvite(true)
		try {
			const response = await fetch('/api/teams/invite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					teamId: params.id,
					usesRemaining: null, // Unlimited
					expiresInDays: null  // Never expires
				})
			})

			const data = await response.json()
			if (data.inviteUrl) {
				// Copy to clipboard immediately
				await navigator.clipboard.writeText(data.inviteUrl)
				setCopiedCode(data.invite.invite_code)
				setTimeout(() => setCopiedCode(null), 2000)
				// Refresh invites list
				fetchInvites()
			}
		} catch (error) {
			console.error('Error creating invite:', error)
		} finally {
			setCreatingInvite(false)
		}
	}

	const handleCopyInvite = async (inviteCode: string) => {
		const inviteUrl = `https://idleforest.com/invite/${inviteCode}`
		await navigator.clipboard.writeText(inviteUrl)
		setCopiedCode(inviteCode)
		setTimeout(() => setCopiedCode(null), 2000)
	}

	const handleDeleteInvite = async (inviteId: string) => {
		try {
			await fetch(`/api/teams/invite?inviteId=${inviteId}`, {
				method: 'DELETE'
			})
			fetchInvites()
		} catch (error) {
			console.error('Error deleting invite:', error)
		}
	}

	const toggleInviteSection = () => {
		if (!showInviteSection) {
			fetchInvites()
		}
		setShowInviteSection(!showInviteSection)
	}

	const handleLeaveTeam = async () => {
		setLeavingTeam(true)
		try {
			const response = await fetch('/api/teams/leave', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ teamId: params.id })
			})

			if (response.ok) {
				router.push('/teams')
			} else {
				const data = await response.json()
				alert(data.error || 'Failed to leave team')
			}
		} catch (error) {
			console.error('Error leaving team:', error)
			alert('Failed to leave team')
		} finally {
			setLeavingTeam(false)
			setShowLeaveConfirm(false)
		}
	}

	const handleDeleteTeam = async () => {
		setDeletingTeam(true)
		try {
			const response = await fetch(`/api/teams/delete?teamId=${params.id}`, {
				method: 'DELETE'
			})

			if (response.ok) {
				router.push('/teams')
			} else {
				const data = await response.json()
				alert(data.error || 'Failed to delete team')
			}
		} catch (error) {
			console.error('Error deleting team:', error)
			alert('Failed to delete team')
		} finally {
			setDeletingTeam(false)
			setShowDeleteConfirm(false)
		}
	}

	const handleJoinTeam = async (confirmSwitch = false) => {
		if (!currentUser) {
			router.push('/auth/user/login?redirect=/teams/' + params.id)
			return
		}

		setJoiningTeam(true)
		setJoinError(null)
		try {
			const response = await fetch('/api/teams/join-direct', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ teamId: params.id, confirmSwitch })
			})

			const data = await response.json()

			if (!response.ok) {
				if (response.status === 409) {
					if (data.requiresConfirmation && data.currentTeam) {
						setExistingTeam(data.currentTeam)
						setShowJoinConfirm(true)
						setJoiningTeam(false)
						return
					}
				}
				if (response.status === 403 && data.isOwner) {
					setIsCurrentTeamOwner(true)
					setJoinError('You own your current team. Delete it before joining a new one.')
					setJoiningTeam(false)
					return
				}
				throw new Error(data.error || 'Failed to join team')
			}

			// Success - refresh the page
			window.location.reload()

		} catch (err) {
			setJoinError(err instanceof Error ? err.message : 'Failed to join team')
		} finally {
			setJoiningTeam(false)
		}
	}

	const handleConfirmJoin = () => {
		setShowJoinConfirm(false)
		handleJoinTeam(true)
	}

	const isOwner = currentUser && team && currentUser.id === team.created_by

	const openEditModal = () => {
		setEditDescription(team?.description || '')
		setEditImagePreview(team?.image_url || null)
		setEditImageFile(null)
		setEditError('')
		setShowEditModal(true)
	}

	const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
			if (!allowedTypes.includes(file.type)) {
				setEditError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
				return
			}
			if (file.size > 2 * 1024 * 1024) {
				setEditError('File too large. Maximum size is 2MB')
				return
			}
			setEditImageFile(file)
			setEditImagePreview(URL.createObjectURL(file))
			setEditError('')
		}
	}

	const removeEditImage = () => {
		setEditImageFile(null)
		setEditImagePreview(null)
	}

	const handleUpdateTeam = async () => {
		setEditingTeam(true)
		setEditError('')

		try {
			let finalImageUrl = editImagePreview

			// Upload new image if one is selected
			if (editImageFile) {
				setUploadingImage(true)
				const formData = new FormData()
				formData.append('file', editImageFile)

				const uploadResponse = await fetch('/api/teams/upload-image', {
					method: 'POST',
					body: formData
				})

				const uploadData = await uploadResponse.json()
				setUploadingImage(false)

				if (!uploadResponse.ok) {
					setEditError(uploadData.error || 'Failed to upload image')
					setEditingTeam(false)
					return
				}

				finalImageUrl = uploadData.url
			}

			const response = await fetch('/api/teams/update', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					teamId: team?.id,
					description: editDescription.trim() || null,
					imageUrl: finalImageUrl
				})
			})

			const data = await response.json()

			if (response.ok && data.team) {
				setTeam(data.team)
				setShowEditModal(false)
			} else {
				setEditError(data.error || 'Failed to update team')
			}
		} catch (error) {
			console.error('Error updating team:', error)
			setEditError('Failed to update team')
		} finally {
			setEditingTeam(false)
			setUploadingImage(false)
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto p-4 pt-24">
				<div className="max-w-4xl mx-auto">
					<p className="text-center text-gray-400">Loading team information...</p>
				</div>
			</div>
		)
	}

	if (!team) {
		return (
			<div className="container mx-auto p-4 pt-24">
				<div className="max-w-4xl mx-auto">
					<Card className="p-6 bg-gray-950 border-2 border-brand-yellow">
						<h2 className="text-2xl font-bold text-white mb-4">Team Not Found</h2>
						<p className="text-gray-400 mb-6">The team you're looking for doesn't exist or has been removed.</p>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-4 pt-32">
			<div className="max-w-4xl mx-auto">
				{/* Team Header Card */}
				<div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 mb-8">
					<div className="flex flex-col md:flex-row gap-6">
						{/* Team Image */}
						{team.image_url ? (
							<div className="flex-shrink-0">
								<img
									src={team.image_url}
									alt={`${team.name} logo`}
									className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
								/>
							</div>
						) : (
							<div className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-brand-yellow to-yellow-300 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
								<Users className="w-12 h-12 md:w-16 md:h-16 text-black/60" />
							</div>
						)}

						{/* Team Info */}
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl md:text-5xl font-extrabold font-rethink-sans text-black uppercase tracking-tight mb-2">
								{team.name}
							</h1>

							{/* Contribution Status Badge */}
							{isMember && hasNode && (
								<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white border-2 border-black font-bold uppercase text-xs tracking-wider mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
									<div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
									Contributing
								</div>
							)}

							{/* Team Description */}
							{team.description && (
								<p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
									{team.description}
								</p>
							)}

							{/* Action Buttons */}
							<div className="flex flex-wrap items-center gap-2 mt-auto">
								{/* Join Team - for non-members */}
								{!isMember && currentUser && (
									<button
										onClick={() => handleJoinTeam()}
										disabled={joiningTeam}
										className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
									>
										{joiningTeam ? (
											<><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
										) : (
											<><UserPlus className="w-4 h-4" /> Join Team</>
										)}
									</button>
								)}

								{isMember && (
									<button
										onClick={toggleInviteSection}
										className="flex items-center gap-2 px-4 py-2 bg-brand-yellow border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
									>
										<UserPlus className="w-4 h-4" />
										Invite
									</button>
								)}

								{/* Leave Team - for non-owner members */}
								{isMember && !isOwner && (
									<button
										onClick={() => setShowLeaveConfirm(true)}
										className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
									>
										<LogOut className="w-4 h-4" />
										Leave
									</button>
								)}

								{/* Edit Team - for owner only */}
								{isOwner && (
									<button
										onClick={openEditModal}
										className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
									>
										<Pencil className="w-4 h-4" />
										Edit
									</button>
								)}

								{/* Delete Team - for owner only */}
								{isOwner && (
									<button
										onClick={() => setShowDeleteConfirm(true)}
										className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
									>
										<Trash2 className="w-4 h-4" />
										Delete
									</button>
								)}

								{/* Share Team Stats */}
								<Link
									href={`/share/team/${params.id}`}
									className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
								>
									<Share2 className="w-4 h-4" />
									Share
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Leave Team Confirmation Modal */}
				{showLeaveConfirm && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<Card className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-4">
							<h3 className="text-xl font-bold mb-4">Leave Team?</h3>
							<p className="text-gray-600 mb-6">Are you sure you want to leave <strong>{team.name}</strong>? You will lose your contribution points for this team.</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowLeaveConfirm(false)}
									className="flex-1 px-4 py-2 bg-gray-100 border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleLeaveTeam}
									disabled={leavingTeam}
									className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
								>
									{leavingTeam ? <><Loader2 className="w-4 h-4 animate-spin" /> Leaving...</> : 'Leave Team'}
								</button>
							</div>
						</Card>
					</div>
				)}

				{/* Delete Team Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<Card className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-4">
							<h3 className="text-xl font-bold mb-4 text-red-600">Delete Team?</h3>
							<p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone. All team members and invite links will be removed.</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className="flex-1 px-4 py-2 bg-gray-100 border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleDeleteTeam}
									disabled={deletingTeam}
									className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
								>
									{deletingTeam ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete Team'}
								</button>
							</div>
						</Card>
					</div>
				)}

				{/* Join Team Confirmation Modal */}
				{showJoinConfirm && existingTeam && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
						<Card className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md mx-4">
							<div className="flex items-center gap-3 mb-4">
								<AlertTriangle className="w-6 h-6 text-orange-500" />
								<h3 className="text-xl font-bold">Switch Teams?</h3>
							</div>
							<p className="text-gray-600 mb-6">
								You are currently a member of <strong>{existingTeam.name}</strong>.
								Joining <strong>{team?.name}</strong> will remove you from your current team.
							</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowJoinConfirm(false)}
									className="flex-1 px-4 py-2 bg-gray-100 border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleConfirmJoin}
									disabled={joiningTeam}
									className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
								>
									{joiningTeam ? <><Loader2 className="w-4 h-4 animate-spin" /> Switching...</> : 'Switch Teams'}
								</button>
							</div>
						</Card>
					</div>
				)}

				{/* Edit Team Modal */}
				{showEditModal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
							<h2 className="text-2xl font-extrabold uppercase mb-4">Edit Team</h2>
							<p className="text-neutral-600 mb-6">Update your team&apos;s description and image.</p>

							{/* Image Upload */}
							<div className="mb-4">
								<label className="block text-sm font-bold text-neutral-600 mb-2">Team Image</label>
								{editImagePreview ? (
									<div className="relative inline-block">
										<img
											src={editImagePreview}
											alt="Team preview"
											className="w-24 h-24 object-cover border-2 border-black"
										/>
										<button
											type="button"
											onClick={removeEditImage}
											className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600 transition-colors"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								) : (
									<label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-400 cursor-pointer hover:border-brand-yellow hover:bg-gray-50 transition-colors">
										<Upload className="w-5 h-5 text-gray-500" />
										<span className="text-gray-500 text-sm">Click to upload image (max 2MB)</span>
										<input
											type="file"
											accept="image/jpeg,image/png,image/gif,image/webp"
											onChange={handleEditImageChange}
											className="hidden"
										/>
									</label>
								)}
							</div>

							<textarea
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								placeholder="Team description (optional)"
								maxLength={500}
								rows={4}
								className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-4 resize-none"
							/>
							<p className="text-xs text-gray-500 mb-4">{editDescription.length}/500 characters</p>

							{editError && (
								<p className="text-red-600 text-sm mb-4">{editError}</p>
							)}

							<div className="flex gap-3">
								<button
									onClick={() => {
										setShowEditModal(false)
										setEditDescription('')
										setEditImageFile(null)
										setEditImagePreview(null)
										setEditError('')
									}}
									className="flex-1 py-3 font-bold uppercase tracking-wider bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleUpdateTeam}
									disabled={editingTeam}
									className="flex-1 flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
								>
									{editingTeam ? (
										<><Loader2 className="w-4 h-4 animate-spin" /> {uploadingImage ? 'Uploading...' : 'Saving...'}</>
									) : (
										'Save Changes'
									)}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Join Error Message */}
				{joinError && (
					<div className="bg-red-50 border-2 border-red-400 p-4 mb-8">
						<div className="flex items-center gap-3">
							<AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
							<p className="text-red-700">{joinError}</p>
						</div>
					</div>
				)}

				{/* Install Banner - for members without nodes */}
				{isMember && hasNode === false && (
					<InstallBanner
						teamName={team?.name || 'your team'}
						onCheckConnection={refetchNodeStatus}
						isChecking={isCheckingConnection}
					/>
				)}

				{/* Invite Section - Expandable */}
				{showInviteSection && isMember && (
					<Card className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="bg-brand-yellow p-2 border-2 border-black">
									<LinkIcon className="w-5 h-5 text-black" />
								</div>
								<div>
									<h3 className="font-bold text-lg">Your Invite Link</h3>
									<p className="text-sm text-gray-600">Share your personal link to invite people to the team</p>
								</div>
							</div>
							{invites.length === 0 && (
								<button
									onClick={handleCreateInvite}
									disabled={creatingInvite}
									className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
								>
									{creatingInvite ? (
										<><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
									) : (
										<><UserPlus className="w-4 h-4" /> Create Invite Link</>
									)}
								</button>
							)}
						</div>

						{invites.length > 0 ? (
							<div className="space-y-2">
								{invites.map((invite) => (
									<div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200">
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-3">
												<code className="text-sm bg-white px-2 py-1 border border-gray-300 font-mono">
													https://idleforest.com/invite/{invite.invite_code}
												</code>
											</div>
											<div className="flex items-center gap-4 text-xs text-gray-500">
												<span>Created {new Date(invite.created_at).toLocaleDateString()}</span>
												<span className="font-medium text-brand-navy">
													{invite.total_uses || 0} uses
												</span>
												<span className="font-medium text-green-600">
													{invite.new_signups || 0} new accounts
												</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleCopyInvite(invite.invite_code)}
												className="p-2 hover:bg-gray-200 transition-colors"
												title="Copy link"
											>
												{copiedCode === invite.invite_code ? (
													<Check className="w-4 h-4 text-green-600" />
												) : (
													<Copy className="w-4 h-4 text-gray-600" />
												)}
											</button>
											<button
												onClick={() => handleDeleteInvite(invite.id)}
												className="p-2 hover:bg-red-100 transition-colors"
												title="Delete invite"
											>
												<Trash2 className="w-4 h-4 text-red-600" />
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-center text-gray-500 py-4">No active invite links. Create one to invite members!</p>
						)}
					</Card>
				)}

				<div className="grid gap-8">
					<Card className="p-6 bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
						<div className="flex items-center gap-4 mb-6">
							<div className="bg-brand-yellow p-3 rounded-lg">
								<Trophy className="w-6 h-6 text-brand-navy" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-white">Team Stats</h2>
								<p className="text-gray-400">Team performance metrics</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<p className="text-sm text-gray-400">Total Points</p>
								<p className="text-3xl font-bold text-brand-yellow">{team.total_points.toLocaleString()}</p>
							</div>
							<div>
								<p className="text-sm text-gray-400">Members</p>
								<p className="text-3xl font-bold text-brand-yellow">{members.length}</p>
							</div>
							<div>
								<p className="text-sm text-gray-400">Created On</p>
								<p className="text-xl font-bold text-white">{new Date(team.created_at).toLocaleDateString()}</p>
							</div>
						</div>
					</Card>

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
													{member.user_id === team.created_by && (
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
				</div>
			</div>
		</div>
	)
}