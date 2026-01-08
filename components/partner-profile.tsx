'use client'

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase/client'

interface PartnerProfile {
	company_name: string
	website: string
	contact_name: string
	company_size: string
	donate_earnings: boolean
}

export function PartnerProfile() {
	const [loading, setLoading] = useState(true)
	const [editing, setEditing] = useState(false)
	const [profile, setProfile] = useState<PartnerProfile | null>(null)

	useEffect(() => {
		loadProfile()
	}, [])

	async function loadProfile() {
		try {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) throw new Error('No user found')

			const { data, error } = await supabase
				.from('partners')
				.select('*')
				.eq('user_id', user.id)
				.single()

			if (error) throw error
			setProfile(data)
		} catch (error) {
			console.error('Error loading profile:', error)
		} finally {
			setLoading(false)
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setLoading(true)

		try {
			const formData = new FormData(event.currentTarget)
			const { data: { user } } = await supabase.auth.getUser()

			if (!user) throw new Error('No user found')

			const updates = {
				user_id: user.id,
				company_name: formData.get('company_name'),
				website: formData.get('website'),
				contact_name: formData.get('contact_name'),
				company_size: formData.get('company_size'),
				donate_earnings: formData.get('donate_earnings') === 'true'
			}

			const { error } = await supabase
				.from('partners')
				.update(updates)
				.eq('user_id', user.id)

			if (error) throw error

			setProfile(updates as any)
			setEditing(false)
		} catch (error) {
			console.error('Error:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<Card className="p-6 bg-gray-900 border-brand-yellow">
			<h2 className="text-xl font-bold mb-4 text-white">Partner Profile</h2>
			{editing ? (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="company_name" className="text-sm font-medium text-gray-300">Company Name</label>
						<input
							id="company_name"
							name="company_name"
							type="text"
							defaultValue={profile?.company_name}
							required
							className="w-full px-3 py-2 border rounded-md bg-gray-950 border-brand-yellow text-white focus:border-brand-yellow focus:ring-brand-yellow"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="website" className="text-sm font-medium text-gray-300">Website</label>
						<input
							id="website"
							name="website"
							type="url"
							defaultValue={profile?.website}
							required
							className="w-full px-3 py-2 border rounded-md bg-gray-950 border-brand-yellow text-white focus:border-brand-yellow focus:ring-brand-yellow"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="contact_name" className="text-sm font-medium text-gray-300">Contact Name</label>
						<input
							id="contact_name"
							name="contact_name"
							type="text"
							defaultValue={profile?.contact_name}
							required
							className="w-full px-3 py-2 border rounded-md bg-gray-950 border-brand-yellow text-white focus:border-brand-yellow focus:ring-brand-yellow"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="company_size" className="text-sm font-medium text-gray-300">Company Size</label>
						<select
							id="company_size"
							name="company_size"
							defaultValue={profile?.company_size}
							required
							className="w-full px-3 py-2 border rounded-md bg-gray-950 border-brand-yellow text-white focus:border-brand-yellow focus:ring-brand-yellow"
						>
							<option value="1-10">1-10 employees</option>
							<option value="11-50">11-50 employees</option>
							<option value="51-200">51-200 employees</option>
							<option value="201+">201+ employees</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="flex items-center space-x-2">
							<input
								type="checkbox"
								name="donate_earnings"
								value="true"
								defaultChecked={profile?.donate_earnings}
								className="rounded border-brand-yellow bg-gray-950 text-brand-yellow focus:ring-brand-yellow"
							/>
							<span className="text-sm font-medium text-gray-300">Donate my earnings to environmental causes</span>
						</label>
					</div>

					<div className="flex gap-4">
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 text-sm font-medium text-white bg-brand-yellow hover:bg-brand-yellow rounded-lg"
						>
							Save Changes
						</button>
						<button
							type="button"
							onClick={() => setEditing(false)}
							className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
						>
							Cancel
						</button>
					</div>
				</form>
			) : (
				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-medium text-gray-400">Company Name</h3>
						<p className="mt-1 text-gray-300">{profile?.company_name}</p>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-400">Website</h3>
						<p className="mt-1 text-gray-300">{profile?.website}</p>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-400">Contact Name</h3>
						<p className="mt-1 text-gray-300">{profile?.contact_name}</p>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-400">Company Size</h3>
						<p className="mt-1 text-gray-300">{profile?.company_size}</p>
					</div>
					<div>
						<h3 className="text-sm font-medium text-gray-400">Donation Preference</h3>
						<p className="mt-1 text-gray-300">{profile?.donate_earnings ? 'Donating earnings to environmental causes' : 'Not donating earnings'}</p>
					</div>
					<button
						onClick={() => setEditing(true)}
						className="px-4 py-2 text-sm font-medium text-brand-yellow hover:text-brand-yellow"
					>
						Edit Profile
					</button>
				</div>
			)}
		</Card>
	)
}