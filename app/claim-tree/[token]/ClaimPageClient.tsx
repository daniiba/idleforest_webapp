'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Users, Zap, CheckCircle, Copy, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClaimPageClientProps {
    token: string;
    userName?: string;
    referralCode?: string; // Pre-generated referral code
    isExpired?: boolean;
    isClaimed?: boolean;
}

export default function ClaimPageClient({ token, userName, referralCode, isExpired, isClaimed }: ClaimPageClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ trees: number } | null>(null);

    // Team Form State
    const [teamMode, setTeamMode] = useState<'join' | 'create'>('join');
    const [inviteCode, setInviteCode] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');

    const handleClaim = async (action: 'quick' | 'team_join' | 'team_create', payload?: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/claim-tree', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, action, payload }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to claim trees');
            }

            setSuccessData({ trees: data.trees });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isExpired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <TreePine className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Offer Expired</h1>
                    <p className="text-zinc-400">Sorry, this tree claim offer has expired (valid for 7 days).</p>
                    <Link href="/dashboard" className="text-green-500 hover:underline">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (isClaimed && !successData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Already Claimed</h1>
                    <p className="text-zinc-400">You have already claimed your signup trees!</p>
                    <Link href="/dashboard" className="text-green-500 hover:underline">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (successData) {
        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${referralCode || 'idleforest'}`;

        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
                <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
                    <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/50">
                        <TreePine className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        You planted {successData.trees} {successData.trees === 1 ? 'tree' : 'trees'}!
                    </h1>
                    <p className="text-zinc-400">
                        Your contribution has been recorded via 1ClickImpact.
                        {successData.trees > 1 ? " Great job maximizing your impact!" : " Every tree counts."}
                    </p>

                    <div className="h-px bg-zinc-800 w-full my-6" />

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">🌱 Want to plant 3 more?</h2>
                        <p className="text-zinc-400 text-sm">
                            Share your referral link. You get 3 trees for every friend who joins.
                        </p>

                        <div className="flex gap-2 items-center bg-zinc-950 rounded-lg p-2 border border-zinc-800">
                            <code className="flex-1 text-sm text-zinc-300 truncate px-2">{shareUrl}</code>
                            <button
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
                                title="Copy Link"
                            >
                                <Copy className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    <Link
                        href="/dashboard"
                        className="block w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors mt-6"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-5xl font-bold">Claim Your Forest</h1>
                    <p className="text-zinc-400 max-w-lg mx-auto">
                        Welcome, {userName || 'Traveler'}. Choose how you want to start your reforestation journey.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-center">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Claim Option */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors flex flex-col">
                        <div className="mb-4 p-3 bg-zinc-800/50 w-fit rounded-xl">
                            <Zap className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Quick Claim</h2>
                        <div className="text-3xl font-bold text-white mb-2">1 Tree</div>
                        <p className="text-zinc-400 text-sm mb-8 flex-1">
                            Get started immediately. Plant one real tree and start browsing.
                        </p>

                        <button
                            onClick={() => handleClaim('quick')}
                            disabled={loading}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Plant 1 Tree'}
                        </button>
                    </div>

                    {/* Team Claim Option */}
                    <div className="relative bg-gradient-to-br from-green-900/20 to-zinc-900 border border-green-500/20 rounded-2xl p-6 flex flex-col overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                            RECOMMENDED
                        </div>

                        <div className="mb-4 p-3 bg-green-900/30 w-fit rounded-xl">
                            <Users className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-green-100">Team Claim</h2>
                        <div className="text-3xl font-bold text-white mb-2">2 Trees</div>
                        <p className="text-green-200/60 text-sm mb-6">
                            Join or create a team to multiply your impact.
                        </p>

                        {/* Team Sub-Options */}
                        <div className="mt-auto space-y-4">
                            <div className="flex rounded-lg bg-zinc-950/50 p-1">
                                <button
                                    onClick={() => setTeamMode('join')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${teamMode === 'join' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                >
                                    Join Existing
                                </button>
                                <button
                                    onClick={() => setTeamMode('create')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${teamMode === 'create' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                >
                                    Create New
                                </button>
                            </div>

                            {teamMode === 'join' ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Enter Invite Code"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleClaim('team_join', { inviteCode })}
                                        disabled={loading || !inviteCode}
                                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join & Plant 2 Trees'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Team Name"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (Optional)"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                                        value={teamDescription}
                                        onChange={(e) => setTeamDescription(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleClaim('team_create', { name: teamName, description: teamDescription })}
                                        disabled={loading || !teamName}
                                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Plant 2 Trees'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
