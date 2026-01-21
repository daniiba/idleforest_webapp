'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Users, Zap, CheckCircle, Copy, Loader2, Search, ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Simple debounce hook implementation
function useDebounce<T>(value: T, delay: number): [T] {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return [debouncedValue];
}

// Define fonts class names based on app/page.tsx usage if they are global classes
// Assuming font-candu and font-rethink-sans are available via util classes or global css
// If not, we might need to import them but usually they are in layout.

interface ClaimPageClientProps {
    token: string;
    userName?: string;
    referralCode?: string;
    isExpired?: boolean;
    isClaimed?: boolean;
}

interface Team {
    id: string;
    name: string;
    member_count: number; // We might need to fetch this or count it
    total_points: number;
    image_url: string | null;
}

export default function ClaimPageClient({ token, userName, referralCode, isExpired, isClaimed }: ClaimPageClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ trees: number; inviteCode?: string } | null>(null);

    // Team Selection State
    const [teams, setTeams] = useState<Team[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Create Team State
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchTeams();
    }, [debouncedSearch]);

    const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
            let query = supabase
                .from('teams')
                .select('id, name, total_points, image_url, team_members(count)'); // Need to check if simple count works or we need separate query

            if (debouncedSearch) {
                query = query.ilike('name', `%${debouncedSearch}%`);
            }

            query = query.order('total_points', { ascending: false }).limit(20);

            const { data, error } = await query;

            if (error) throw error;

            // Process data to get member count safely
            const formatted: Team[] = data.map((t: any) => ({
                id: t.id,
                name: t.name,
                total_points: t.total_points,
                image_url: t.image_url,
                member_count: t.team_members ? t.team_members[0]?.count : 0 // Supabase count tricky with joining
            }));

            // Standard count query might need adjusting. For now let's try this or just fetch members length if small
            // Better approach for count: 
            // .select('*, team_members(count)') might return array of objects.
            // Let's assume for now we just show points. Or do a separate member count heuristic.
            // Actually, `team_members(count)` is standard PostgREST for exact count if utilizing head/count opts, but within select it returns an array of {count: n}.

            const processed = data?.map((t: any) => ({
                id: t.id,
                name: t.name,
                total_points: t.total_points,
                image_url: t.image_url,
                member_count: t.team_members?.[0]?.count ?? 0
            })) || [];

            setTeams(processed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTeams(false);
        }
    };

    const handleClaim = async (action: 'quick' | 'team_join_and_invite' | 'team_create', payload?: any) => {
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

            setSuccessData({ trees: data.trees, inviteCode: data.inviteCode });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isExpired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-gray text-black p-4 font-rethink-sans">
                <div className="max-w-md text-center space-y-4 border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
                        <TreePine className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-candu uppercase">Offer Expired</h1>
                    <p className="text-neutral-600">Sorry, this tree claim offer has expired (valid for 7 days).</p>
                    <Link href="/dashboard" className="block w-full py-3 bg-brand-navy text-brand-yellow font-bold uppercase border-2 border-black hover:translate-y-[2px] hover:translate-x-[2px] transition-all">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (isClaimed && !successData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-gray text-black p-4 font-rethink-sans">
                <div className="max-w-md text-center space-y-4 border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-2 border-black">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-candu uppercase">Already Claimed</h1>
                    <p className="text-neutral-600">You have already claimed your signup trees!</p>
                    <Link href="/dashboard" className="block w-full py-3 bg-brand-navy text-brand-yellow font-bold uppercase border-2 border-black hover:translate-y-[2px] hover:translate-x-[2px] transition-all">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (successData) {
        const inviteCodeToUse = successData.inviteCode; // Use the one returned from API
        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inviteCodeToUse || referralCode || 'idleforest'}`;
        const justJoinedTeam = successData.trees === 2;

        return (
            <div className="min-h-screen bg-brand-gray text-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-700 font-rethink-sans">
                <div className="max-w-xl w-full bg-white border-2 border-black p-8 text-center space-y-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mx-auto w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <TreePine className="w-12 h-12 text-black" />
                    </div>

                    <h1 className="text-4xl font-extrabold font-candu uppercase leading-tight">
                        You planted {successData.trees} {successData.trees === 1 ? 'tree' : 'trees'}!
                    </h1>
                    <p className="text-neutral-800 text-lg">
                        {justJoinedTeam
                            ? "You've joined the team and created your personal invite link."
                            : "Your contribution has been recorded via 1ClickImpact."}
                    </p>

                    <div className="h-0.5 bg-black w-full my-6 opacity-20" />

                    {inviteCodeToUse && (
                        <div className="space-y-4 bg-brand-navy p-6 border-2 border-black">
                            <div className="flex items-center justify-center gap-2 text-brand-yellow mb-2">
                                <Users className="w-6 h-6" />
                                <h2 className="text-xl font-extrabold font-candu uppercase">Your Team Invite Link</h2>
                            </div>
                            <p className="text-white text-sm">
                                Share this link to grow your team. You get credit for their impact!
                            </p>

                            <div className="flex gap-2 items-center bg-black/30 rounded-none p-2 border-2 border-brand-yellow/50">
                                <code className="flex-1 text-sm text-brand-yellow truncate px-2 font-mono">{shareUrl}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                                    className="p-2 hover:bg-brand-yellow hover:text-black text-brand-yellow border border-transparent hover:border-black transition-colors rounded-none"
                                    title="Copy Link"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/dashboard"
                        className="block w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors mt-6 text-lg border-2 border-transparent hover:border-black"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-gray text-black flex flex-col items-center justify-center p-4 font-rethink-sans">
            <div className="max-w-5xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold font-candu uppercase tracking-tight">
                        Claim Your Forest
                    </h1>
                    <p className="text-xl text-neutral-800 max-w-2xl mx-auto font-medium">
                        Welcome, {userName || 'Traveler'}. Choose how you want to start your reforestation journey.
                    </p>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto p-4 bg-red-100 border-2 border-red-500 text-red-800 text-center font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Quick Claim Option */}
                    <div className="bg-white border-2 border-black p-8 hover:translate-y-[-2px] transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border-2 border-black px-4 py-1 text-sm font-bold uppercase tracking-wider">
                            Basic
                        </div>
                        <div className="mb-6 mx-auto p-4 bg-brand-navy w-fit border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Zap className="w-8 h-8 text-brand-yellow" />
                        </div>
                        <h2 className="text-3xl font-extrabold font-candu uppercase text-center mb-2">Quick Claim</h2>
                        <div className="text-6xl font-extrabold text-center mb-4 text-neutral-900">1 Tree</div>
                        <p className="text-neutral-600 text-center mb-8 flex-1">
                            Plant one tree immediately and explore the dashboard on your own.
                        </p>

                        <button
                            onClick={() => handleClaim('quick')}
                            disabled={loading}
                            className="w-full py-4 bg-white border-2 border-black text-black font-bold uppercase tracking-wider hover:bg-neutral-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Plant 1 Tree'}
                        </button>
                    </div>

                    {/* Team Claim Option */}
                    <div className="bg-brand-yellow border-2 border-black p-8 hover:translate-y-[-2px] transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full relative">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-navy text-brand-yellow border-2 border-black px-4 py-1 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Flame className="w-4 h-4" /> Recommended
                        </div>

                        <div className="mb-6 mx-auto p-4 bg-brand-navy w-fit border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Users className="w-8 h-8 text-brand-yellow" />
                        </div>
                        <h2 className="text-3xl font-extrabold font-candu uppercase text-center mb-1 text-black">Team Claim</h2>
                        <div className="text-6xl font-extrabold text-center mb-2 text-black">2 Trees</div>
                        <p className="text-neutral-800 font-bold text-center mb-6 text-sm">
                            Join a team & create your invite link to double your impact.
                        </p>

                        {/* Team Selection UI */}
                        <div className="flex-1 bg-white border-2 border-black p-4 mb-6">
                            {!isCreatingTeam ? (
                                <>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Search teams..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border-2 border-neutral-200 focus:border-black outline-none font-bold placeholder:font-normal"
                                        />
                                    </div>

                                    <div className="h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {loadingTeams ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="animate-spin h-6 w-6 text-neutral-400" />
                                            </div>
                                        ) : (
                                            teams.map(team => (
                                                <div
                                                    key={team.id}
                                                    onClick={() => setSelectedTeam(team.id)}
                                                    className={`p-3 border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedTeam === team.id
                                                        ? 'border-black bg-brand-yellow/20'
                                                        : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {team.image_url ? (
                                                            <img src={team.image_url} className="w-8 h-8 object-cover border border-black" alt="" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-brand-navy flex items-center justify-center border border-black text-brand-yellow"><Users size={14} /></div>
                                                        )}
                                                        <div className="text-left">
                                                            <div className="font-bold text-sm leading-tight">{team.name}</div>
                                                            <div className="text-xs text-neutral-500">{team.total_points.toLocaleString()} pts</div>
                                                        </div>
                                                    </div>
                                                    {selectedTeam === team.id && <CheckCircle className="w-5 h-5 text-black" />}
                                                </div>
                                            ))
                                        )}
                                        {!loadingTeams && teams.length === 0 && (
                                            <div className="text-center py-4 text-sm text-neutral-500">No teams found.</div>
                                        )}
                                    </div>

                                    <div className="text-center mt-3 pt-3 border-t border-neutral-200">
                                        <button onClick={() => setIsCreatingTeam(true)} className="text-xs font-bold underline hover:text-brand-navy">
                                            Or create your own team
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-sm uppercase">New Team Details</h3>
                                        <button onClick={() => setIsCreatingTeam(false)} className="text-xs underline text-neutral-500">Cancel</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Team Name"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-neutral-200 focus:border-black outline-none font-bold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (Optional)"
                                        value={newTeamDesc}
                                        onChange={(e) => setNewTeamDesc(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-neutral-200 focus:border-black outline-none text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (isCreatingTeam) {
                                    handleClaim('team_create', { name: newTeamName, description: newTeamDesc });
                                } else {
                                    handleClaim('team_join_and_invite', { teamId: selectedTeam });
                                }
                            }}
                            disabled={loading || (!isCreatingTeam && !selectedTeam) || (isCreatingTeam && !newTeamName)}
                            className="w-full py-4 bg-brand-navy text-brand-yellow border-2 border-black font-bold uppercase tracking-wider hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                isCreatingTeam ? 'Create & Plant 2 Trees' : 'Join & Generate Invite'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
