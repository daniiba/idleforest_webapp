'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Users } from 'lucide-react';

interface InviteInfo {
  teamName: string;
  inviterName: string;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);

  // Fetch invite info if there's an invite code
  useEffect(() => {
    if (inviteCode) {
      fetchInviteInfo();
    }
  }, [inviteCode]);

  const fetchInviteInfo = async () => {
    try {
      const { data: invite } = await supabase
        .from('team_invites')
        .select('team_id, created_by')
        .eq('invite_code', inviteCode)
        .single();

      if (invite) {
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', invite.team_id)
          .single();

        const { data: inviter } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', invite.created_by)
          .single();

        if (team) {
          setInviteInfo({
            teamName: team.name,
            inviterName: inviter?.display_name || 'A team member'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching invite info:', err);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          // Only set referral_code for non-invite signups (team invites tracked separately via invite_code)
          referral_code: inviteCode ? undefined : (referralCode || undefined),
          invite_code: inviteCode || undefined,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      // User is signed up and logged in
      setMessage('Signup successful!');

      // If there's an invite code, join the team
      if (inviteCode) {
        setMessage('Signup successful! Joining team...');
        try {
          const response = await fetch('/api/teams/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteCode, isNewSignup: true }),
          });

          if (response.ok) {
            const joinData = await response.json();
            setMessage('Successfully joined the team! Redirecting...');
            // Redirect to team welcome page for progressive engagement
            router.push(`/welcome/team/${joinData.team?.slug || joinData.team?.id || ''}`);
            setLoading(false);
            return;
          } else {
            // Team join failed but signup succeeded - log the error but continue
            console.error('Failed to join team after signup');
          }
        } catch (err) {
          console.error('Error joining team after signup:', err);
        }
      }

      // Redirect to profile
      router.push(`/profile/${displayName}`);
    } else if (data.user && !data.session) {
      // User created but no session - email confirmation might be required
      // or there was an issue establishing the session
      setError('Account created but login failed. Please try logging in manually.');
    } else {
      setError('Signup failed. Please try again or contact support.');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
      {/* Team Invite Banner */}
      {inviteInfo && (
        <div className="mb-6 p-4 bg-brand-navy text-white border-2 border-black">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-brand-yellow" />
            <span className="text-xs uppercase tracking-wider text-gray-300">Joining Team</span>
          </div>
          <p className="font-bold text-lg">{inviteInfo.teamName}</p>
          <p className="text-sm text-gray-400">Invited by {inviteInfo.inviterName}</p>
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-center font-candu uppercase mb-8 leading-none">
        {inviteInfo ? 'Create Account' : <>Join the <br /><span className="bg-brand-yellow px-2">Forest</span></>}
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
            placeholder="••••••••"
          />
        </div>
        {/* Only show referral input when not signing up via invite */}
        {!inviteCode && (
          <div>
            <label htmlFor="referralCode" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Referral Code <span className="text-neutral-400 font-normal normal-case">(Optional)</span>
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
              placeholder="Enter code"
            />
          </div>
        )}

        {error && <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm text-center">{error}</div>}
        {message && <div className="p-3 bg-green-100 border-2 border-green-500 text-green-700 font-bold text-sm text-center">{message}</div>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin text-black" /> Creating...</>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-neutral-300 text-center space-y-4">
        <p className="text-sm text-neutral-600 font-bold">
          Already have an account?{' '}
          <Link href="/auth/user/login" className="text-black underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow transition-colors">
            Log in here
          </Link>
        </p>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:bg-brand-yellow transition-colors text-black">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:bg-brand-yellow transition-colors text-black">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}

function SignupFormLoading() {
  return (
    <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
      <p className="mt-4 text-neutral-600 font-bold">Loading...</p>
    </div>
  );
}

export default function UserSignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
      <Suspense fallback={<SignupFormLoading />}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
