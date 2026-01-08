'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { session } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Check if user has a valid session (from reset link)
        if (session === null) {
            // No session means they didn't come from a valid reset link
            router.push('/auth/user/forgot-password');
        } else if (session !== null) {
            setCheckingSession(false);
        }
    }, [session, router]);

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/user/login');
            }, 3000);
        }
        setLoading(false);
    };

    if (checkingSession) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Verifying session...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <h1 className="text-4xl font-extrabold text-center font-candu uppercase mb-4">
                    New Password
                </h1>
                <p className="text-center text-neutral-600 mb-8">
                    Enter your new password below.
                </p>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-100 border-2 border-green-500 text-green-700 font-bold text-center">
                            <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                            <p className="text-lg mb-2">Password Updated!</p>
                            <p className="text-sm font-normal">
                                Redirecting you to login...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono placeholder:text-neutral-400 bg-neutral-50"
                                placeholder="••••••••"
                            />
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
                                className="w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <><Loader2 className="h-5 w-5 mr-2 animate-spin text-black" /> Updating...</>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t-2 border-dashed border-neutral-300 text-center">
                    <p className="text-sm text-neutral-600 font-bold">
                        Remember your password?{' '}
                        <Link href="/auth/user/login" className="text-black underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow transition-colors">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
