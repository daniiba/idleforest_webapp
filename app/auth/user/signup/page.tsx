'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Users } from 'lucide-react';
import { trackPinterestEvent } from '@/lib/pinterest/client';
import { trackOnboardingEvent } from '@/lib/onboarding-events';
import { getCanonicalCompanySlug, isWastefreeCompanySlug } from '@/lib/company-partners';
import { formatTrees } from '@/lib/referral-reward-settings';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface InviteInfo {
  teamName: string;
  imageUrl: string | null;
}

interface ReferralInfo {
  code: string;
  inviterName: string;
  reward?: { treesPerPerson: number; minActiveDays: number } | null;
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
  const [inviteLoading, setInviteLoading] = useState(Boolean(urlInviteCode));
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
        .select('team_id')
        .eq('invite_code', inviteCode)
        .single();

      if (invite) {
        const { data: team } = await supabase
          .from('teams')
          .select('name, image_url')
          .eq('id', invite.team_id)
          .single();

        if (team) {
          setInviteInfo({ teamName: team.name, imageUrl: team.image_url });
        }
      }
    } catch (err) {
      console.error('Error fetching invite info:', err);
    } finally {
      setInviteLoading(false);
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
          reward: data.reward || null,
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

      if (referralInfo && data.session) {
        // Attribution itself is written by the signup database trigger; this
        // call syncs the profile and emails the referrer. Don't hold the new
        // user on the signup page for it: keepalive lets it finish after
        // navigation, and it is retried from auth metadata on later visits.
        fetch('/api/referrals/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: referralInfo.code }),
          keepalive: true,
        }).catch(() => {});
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

  const isWastefree = Boolean(companySlug && isWastefreeCompanySlug(companySlug));

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-sm">
      {inviteInfo && (
        <div className="flex h-36 items-center justify-center bg-forest-ground">
          {inviteInfo.imageUrl ? (
            <Image
              src={inviteInfo.imageUrl}
              alt={inviteInfo.teamName}
              width={96}
              height={96}
              unoptimized
              priority
              className="h-24 w-24 rounded-2xl bg-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-yellow shadow-sm">
              <Users className="h-10 w-10" />
            </div>
          )}
        </div>
      )}

      <div className="p-6 sm:p-10">
        <div className="mb-8 text-center">
          {inviteInfo ? (
            <>
              <p className="text-sm font-bold text-neutral-500">You&apos;ve been invited to join</p>
              <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{inviteInfo.teamName}</h1>
            </>
          ) : companyInfo ? (
            <>
              <p className="text-sm font-bold text-neutral-500">{isWastefree ? 'Joining the clean-ocean fund' : 'Joining Company Forest'}</p>
              <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{companyInfo.name}</h1>
              {isWastefree && (
                <p className="mx-auto mt-3 max-w-xs text-sm text-neutral-600">Create your account, then set up your computer or email yourself a setup link.</p>
              )}
            </>
          ) : referralInfo ? (
            <>
              <p className="text-sm font-bold text-neutral-500">Personal invite</p>
              <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{referralInfo.inviterName} invited you</h1>
              <p className="mx-auto mt-3 max-w-xs text-sm text-neutral-600">Free, runs quietly in the background, and plants real trees.</p>
              {referralInfo.reward && (
                <p className="mx-auto mt-4 rounded-2xl bg-brand-yellow px-4 py-3 text-sm font-bold text-black">
                  Welcome gift: after {referralInfo.reward.minActiveDays} active days, you and {referralInfo.inviterName} each get {formatTrees(referralInfo.reward.treesPerPerson)} planted.
                </p>
              )}
            </>
          ) : inviteLoading ? (
            <div className="animate-pulse" aria-hidden="true">
              <div className="mx-auto h-4 w-40 rounded-full bg-neutral-200" />
              <div className="mx-auto mt-3 h-9 w-56 rounded-full bg-neutral-200" />
            </div>
          ) : (
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Join the <span className="rounded-lg bg-brand-yellow px-2">Forest</span>
            </h1>
          )}

          {validatingReferral && !inviteInfo && !companyInfo && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your invite…
            </p>
          )}

          {referralValidationError && !validatingReferral && (
            <p className="mx-auto mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
              {referralValidationError}
            </p>
          )}
        </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-bold text-neutral-700">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-black transition-all placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-neutral-700">
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
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-black transition-all placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-neutral-700">
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
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-black transition-all placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            placeholder="••••••••"
          />
        </div>
        {error && <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">{error}</div>}
        {message && <div className="rounded-xl bg-green-50 p-3 text-center text-sm font-bold text-green-700">{message}</div>}

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
            className="flex w-full items-center justify-center rounded-full bg-brand-yellow py-4 text-lg font-extrabold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin text-black" /> Creating...</>
            ) : (
              inviteInfo ? 'Create account & join' : 'Create Account'
            )}
          </button>
        </div>
      </form>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm font-bold text-neutral-600">
            Already have an account?{' '}
            <Link
              href={
                companySlug
                  ? `/auth/user/login?redirect=${encodeURIComponent(`/en/join/company/${companySlug}`)}`
                  : inviteCode
                    ? `/auth/user/login?redirect=${encodeURIComponent(`/invite/${inviteCode}`)}`
                    : '/auth/user/login'
              }
              className="text-black underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-black">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupFormLoading() {
  return (
    <div className="w-full max-w-md bg-white border border-neutral-200 p-8 text-center rounded-2xl">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
      <p className="mt-4 text-neutral-600 font-bold">Loading...</p>
    </div>
  );
}

export default function UserSignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[#F7F7F2] p-4">
      <Suspense fallback={<SignupFormLoading />}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
