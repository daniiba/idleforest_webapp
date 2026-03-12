'use client'

import { useState } from 'react'
import { Settings, Save, RefreshCw, PanelRightClose, PanelRightOpen, Copy, Check } from 'lucide-react'
import { updateCompany, type UpdateCompanyInput } from './actions'
import { useRouter } from 'next/navigation'

export default function CompanySettingsPanel({
    company,
    memberCount,
    totalPoints
}: {
    company: any
    memberCount: number
    totalPoints: number
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState<UpdateCompanyInput>({
        name: company.name || '',
        slug: company.slug || '',
        invite_code: company.invite_code || '',
        theme_color: company.theme_color || '#10B981',
        website: company.website || '',
        video_url: company.video_url || '',
        logo_url: company.logo_url || '',
        description: company.description || '',
        is_invite_only: company.is_invite_only ?? true
    })

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)
        try {
            const result = await updateCompany(company.id, formData)
            if (result.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully' })
                router.refresh()
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' })
        } finally {
            setIsSaving(false)
        }
    }

    const copyEmbedCode = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://idleforest.io'
        const code = `<iframe src="${origin}/en/widget/c/${company.slug}" width="350px" height="450px" style="border:none; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" title="Plant trees with ${company.name}"></iframe>`
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }


    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-[100]">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-14 h-14 bg-black text-white hover:bg-brand-yellow hover:text-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all border-2 border-transparent hover:border-black group"
                    title="Open Company Settings"
                >
                    <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] lg:w-[800px] bg-white border-l-4 border-black shadow-[-8px_0_0_0_rgba(0,0,0,0.5)] z-[100] flex flex-col transition-transform transform translate-x-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-brand-yellow">
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-black" />
                    <h2 className="text-2xl font-extrabold font-candu uppercase text-black tracking-wide">Company Owner Settings</h2>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                    <PanelRightClose className="w-6 h-6 text-black" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 flex flex-col lg:flex-row gap-8">

                {/* Left Column: Form Settings */}
                <div className="flex-1 space-y-6">
                    {/* Stats Block */}
                    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-around">
                        <div className="text-center">
                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Active Members</p>
                            <p className="text-3xl font-extrabold font-candu text-black">{memberCount}</p>
                        </div>
                        <div className="w-0.5 h-12 bg-neutral-200"></div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Points Generated</p>
                            <p className="text-3xl font-extrabold font-candu text-brand-leaf">{totalPoints.toLocaleString()}</p>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold border-b-2 border-black pb-2 pt-4">Edit Details</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-black block">Company Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-black block">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy bg-neutral-100 font-mono text-sm"
                                    disabled // Slug usually shouldn't be changed easily to avoid breaking links
                                    title="Contact support to change your slug"
                                />
                                <p className="text-xs text-neutral-500">Contact support to change slug</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-black block">Invite Code</label>
                                <input
                                    type="text"
                                    value={formData.invite_code}
                                    onChange={e => setFormData({ ...formData, invite_code: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-mono text-sm"
                                />
                            </div>
                        </div>


                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-black block">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-black block">Logo URL</label>
                            <input
                                type="text"
                                value={formData.logo_url || ''}
                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-black block">Theme Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.theme_color}
                                        onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                                        className="h-10 w-10 border-2 border-black p-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.theme_color}
                                        onChange={e => setFormData({ ...formData, theme_color: e.target.value })}
                                        className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-black block">Invite Only</label>
                                <div className="flex items-center h-10 gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_invite_only}
                                        onChange={e => setFormData({ ...formData, is_invite_only: e.target.checked })}
                                        className="w-5 h-5 border-2 border-black accent-black focus:ring-0"
                                    />
                                    <span className="text-sm">Require invite code?</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-black block">Explainer Video URL (YouTube)</label>
                            <input
                                type="text"
                                value={formData.video_url || ''}
                                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & HTML Code */}
                <div className="w-full lg:w-[350px] space-y-6 flex flex-col">
                    <h3 className="text-xl font-bold border-b-2 border-black pb-2">Widget Preview</h3>

                    <div className="flex-1 relative bg-neutral-200 border-4 border-black rounded-2xl overflow-hidden flex items-center justify-center p-4">
                        <iframe
                            key={isSaving ? 'saving' : formData.slug} // Force reload on save if needed, but using live URL usually
                            src={`/en/widget/c/${formData.slug}`}
                            className="w-[318px] h-[450px] border-none bg-white rounded-xl shadow-lg"
                            title={`Preview Widget for ${formData.name}`}
                        ></iframe>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-black">Embed Code</h4>
                        <div className="relative">
                            <textarea
                                className="w-full h-24 p-2 text-xs font-mono bg-black text-green-400 border-2 border-black rounded-lg focus:outline-none resize-none"
                                readOnly
                                value={`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'https://idleforest.io'}/en/widget/c/${formData.slug}" width="350px" height="450px" style="border:none; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" title="Plant trees with ${formData.name}"></iframe>`}
                            />
                            <button
                                onClick={copyEmbedCode}
                                className="absolute top-2 right-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
                                title="Copy code"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 leading-tight">Copy this HTML and paste it into any website to embed the widget above.</p>
                    </div>

                </div>

            </div>

            {/* Footer with Save button */}
            <div className="p-4 border-t-4 border-black bg-white flex items-center justify-between">
                <div>
                    {message && (
                        <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-2 font-bold text-neutral-600 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2 bg-black text-brand-yellow hover:bg-brand-navy hover:text-white border-2 border-black rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                    >
                        {isSaving ? <Loader /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function Loader() {
    return <RefreshCw className="w-4 h-4 animate-spin" />
}
