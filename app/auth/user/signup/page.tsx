'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Users } from 'lucide-react';
import { trackPinterestEvent } from '@/lib/pinterest/client';
import { trackOnboardingEvent } from '@/lib/onboarding-events';
import { getCanonicalCompanySlug, isWastefreeCompanySlug } from '@/lib/company-partners';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface InviteInfo {
  teamName: string;
  inviterName: string;
}

interface ReferralInfo {
  code: string;
  inviterName: string;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileRef = useRef<TurnstileInstance>();
  const urlInviteCode = searchParams.get('invite');
  const urlReferralCode = searchParams.get('referral');
  const referralErrorParam = searchParams.get('referral_error');
  const companySlugParam = searchParams.get('company');
  const companySlug = companySlugParam ? getCanonicalCompanySlug(companySlugParam) : null;

  // Check cookie for company_invite if no URL param
  const [cookieInviteCode, setCookieInviteCode] = useState<string | null>(null);

  useEffect(() => {
    // Basic cookie parsing to find company_invite
    const match = document.cookie.match(new RegExp('(^| )company_invite=([^;]+)'));
    if (match) {
      setCookieInviteCode(match[2]);
    }
  }, []);

  const inviteCode = urlInviteCode || (companySlug && isWastefreeCompanySlug(companySlug) ? null : cookieInviteCode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  // Resolve both explicit referral links and the 30-day referral cookie before
  // allowing a direct signup, so a fast submission cannot lose attribution.
  const [validatingReferral, setValidatingReferral] = useState(!urlInviteCode && !companySlug);
  const [referralValidationError, setReferralValidationError] = useState<string | null>(
    referralErrorParam ? 'That invite link is no longer valid. You can still create an account.' : null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ name: string; slug: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const fetchInviteInfo = useCallback(async () => {
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
  }, [inviteCode]);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('name, slug')
        .eq('slug', companySlug)
        .single();

      if (company) {
        setCompanyInfo(company);
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
    }
  }, [companySlug]);

  // Fetch invite info if there's an invite code
  useEffect(() => {
    if (inviteCode) {
      fetchInviteInfo();
    }
  }, [inviteCode, fetchInviteInfo]);

  useEffect(() => {
    if (companySlug && !inviteCode) {
      fetchCompanyInfo();
    }
  }, [companySlug, inviteCode, fetchCompanyInfo]);

  useEffect(() => {
    if (inviteCode || companySlug) {
      setValidatingReferral(false);
      return;
    }

    let cancelled = false;
    const hasExplicitReferral = Boolean(urlReferralCode);
    const referralQuery = urlReferralCode
      ? `?code=${encodeURIComponent(urlReferralCode)}`
      : '';

    fetch(`/api/referrals/resolve${referralQuery}`)
      .then(async response => {
        if (!response.ok) throw new Error('Invalid referral code');
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        if (!data.valid) {
          if (hasExplicitReferral) {
            setReferralValidationError('That invite link is no longer valid. You can still create an account.');
          }
          return;
        }
        setReferralInfo({
          code: data.code,
          inviterName: data.inviterName,
        });
        setReferralValidationError(null);
      })
      .catch(() => {
        if (!cancelled && hasExplicitReferral) {
          setReferralInfo(null);
          setReferralValidationError('That invite link is no longer valid. You can still create an account.');
        }
      })
      .finally(() => {
        if (!cancelled) setValidatingReferral(false);
      });

    return () => {
      cancelled = true;
    };
  }, [companySlug, inviteCode, urlReferralCode]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!turnstileToken) {
      setError('Please complete the verification challenge.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: turnstileToken,
        data: {
          display_name: displayName,
          // Referral links are validated server-side before the code reaches auth metadata.
          referral_code: inviteCode || companySlug ? undefined : (referralInfo?.code || undefined),
          invite_code: inviteCode || undefined,
          company_slug: inviteCode ? undefined : companySlug || undefined,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      resetTurnstile();
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      // User is signed up and logged in
      setMessage('Signup successful!');
      trackPinterestEvent({
        eventName: 'signup',
        email,
        externalId: data.user.id,
        customData: { lead_type: 'User Signup Complete' },
      });
      trackOnboardingEvent('signup_created', {
        source: inviteCode
          ? 'invite_signup'
          : companySlug
            ? 'company_signup'
            : referralInfo
              ? 'referral_signup'
              : 'direct_signup',
        metadata: {
          hasInvite: Boolean(inviteCode),
          hasReferral: Boolean(referralInfo),
          companySlug,
        }
      });

      if (referralInfo) {
        await fetch('/api/referrals/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: referralInfo.code }),
        }).catch(() => {
          // Attribution is retried from auth metadata after the user logs in.
        });
      }

      // If there's an invite code, join the team/company
      if (inviteCode || companySlug) {
        setMessage('Signup successful! Joining...');
        try {
          const response = await fetch('/api/teams/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteCode, companySlug, isNewSignup: true }),
          });

          if (response.ok) {
            const joinData = await response.json();
            setMessage('Successfully joined! Redirecting...');

            // Redirect to appropriate welcome page for progressive engagement
            if (joinData.team?.isCompany) {
              router.push(`/en/welcome/c/${joinData.team?.slug || joinData.team?.id || ''}`);
            } else {
              router.push(`/en/welcome/team/${joinData.team?.slug || joinData.team?.id || ''}`);
            }
            setLoading(false);
            return;
          } else {
            // Join failed but signup succeeded - log the error but continue
            console.error('Failed to join team/company after signup');
          }
        } catch (err) {
          console.error('Error joining team after signup:', err);
        }
      }

      // Redirect to desktop-first onboarding so new users connect the app before landing in profile.
      router.push('/en/welcome');
    } else if (data.user && !data.session) {
      // This is the normal response when email confirmation is enabled.
      setMessage('Account created. Check your email to confirm your address, then log in to continue.');
      resetTurnstile();
    } else {
      setError('Signup failed. Please try again or contact support.');
      resetTurnstile();
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-black shadow-none p-8">
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

      {companyInfo && !inviteInfo && (
        <div className="mb-6 p-4 bg-brand-navy text-white border-2 border-black">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-brand-yellow" />
            <span className="text-xs uppercase tracking-wider text-gray-300">{companySlug && isWastefreeCompanySlug(companySlug) ? 'Joining the clean-ocean fund' : 'Joining Company Forest'}</span>
          </div>
          <p className="font-bold text-lg">{companyInfo.name}</p>
          <p className="text-sm text-gray-400">{companySlug && isWastefreeCompanySlug(companySlug) ? 'Create your account, then set up your computer or email yourself a setup link.' : 'No invite required'}</p>
        </div>
      )}

      {referralInfo && !inviteInfo && !companyInfo && (
        <div className="mb-6 border-2 border-black bg-brand-yellow p-4 text-black">
          <div className="mb-1 flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-wider">Personal invite</span>
          </div>
          <p className="font-bold text-lg">{referralInfo.inviterName} invited you to grow IdleForest together.</p>
          <p className="mt-1 text-sm font-semibold text-neutral-700">Your referral is counted after your node starts contributing real impact.</p>
        </div>
      )}

      {validatingReferral && !inviteInfo && !companyInfo && (
        <div className="mb-6 flex items-center gap-2 border-2 border-black bg-neutral-100 p-4 text-sm font-bold">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your invite…
        </div>
      )}

      {referralValidationError && !validatingReferral && (
        <div className="mb-6 border-2 border-amber-500 bg-amber-50 p-3 text-sm font-bold text-amber-900">
          {referralValidationError}
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-center font-candu uppercase mb-8 leading-none">
        {inviteInfo || companyInfo ? 'Create Account' : <>Join the <br /><span className="bg-brand-yellow px-2">Forest</span></>}
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
            className="w-full px-4 py-3 border-2 border-black focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
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
            className="w-full px-4 py-3 border-2 border-black focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
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
            className="w-full px-4 py-3 border-2 border-black focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current transition-all font-mono placeholder:text-neutral-400 bg-neutral-50 text-black"
            placeholder="••••••••"
          />
        </div>
        {error && <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm text-center">{error}</div>}
        {message && <div className="p-3 bg-green-100 border-2 border-green-500 text-green-700 font-bold text-sm text-center">{message}</div>}

        <div className="flex justify-center pt-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            onTimeout={() => setTurnstileToken(null)}
            options={{ action: 'user_signup' }}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || validatingReferral || !turnstileToken}
            className="w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-none hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          <Link href={companySlug ? `/auth/user/login?redirect=${encodeURIComponent(`/en/join/company/${companySlug}`)}` : "/auth/user/login"} className="text-black underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow transition-colors">
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
    <div className="w-full max-w-md bg-white border-2 border-black shadow-none p-8 text-center">
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
