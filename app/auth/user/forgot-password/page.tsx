'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://idleforest.com/auth/confirm?type=recovery',
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <Link
                    href="/auth/user/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-black transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <h1 className="text-4xl font-extrabold text-center font-candu uppercase mb-4">
                    Reset Password
                </h1>
                <p className="text-center text-neutral-600 mb-8">
                    Enter your email and we&apos;ll send you a link to reset your password.
                </p>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-100 border-2 border-green-500 text-green-700 font-bold text-center">
                            <p className="text-lg mb-2">Check your email!</p>
                            <p className="text-sm font-normal">
                                We&apos;ve sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>
                        <Link
                            href="/auth/user/login"
                            className="block w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-center"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
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
                                    <><Loader2 className="h-5 w-5 mr-2 animate-spin text-black" /> Sending...</>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
