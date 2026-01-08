'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function UserLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectToProfile = async (userId: string) => {
    // Fetch the user's profile to get their display_name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    if (profile?.display_name) {
      router.push(`/profile/${encodeURIComponent(profile.display_name)}`);
    } else {
      // Fallback to home if no profile found
      router.push('/');
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectToProfile(user.id);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      await redirectToProfile(data.user.id);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
      <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <h1 className="text-4xl font-extrabold text-center font-candu uppercase mb-8">
          Welcome Back
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
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
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50"
              placeholder="forester@example.com"
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50"
              placeholder="••••••••"
            />
            <div className="mt-2 text-right">
              <Link href="/auth/user/forgot-password" className="text-sm font-bold text-neutral-600 underline decoration-1 hover:text-black hover:decoration-brand-yellow hover:decoration-2 transition-all">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>
        <div className="mt-8 pt-6 border-t-2 border-dashed border-neutral-300 text-center">
          <p className="text-sm text-neutral-600 font-bold">
            New to IdleForest?{' '}
            <Link href="/auth/user/signup" className="text-black underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow transition-colors">
              Plant your first tree here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
