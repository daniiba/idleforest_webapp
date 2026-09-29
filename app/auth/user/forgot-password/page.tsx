'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const turnstileRef = useRef<TurnstileInstance>();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const resetTurnstile = () => {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!turnstileToken) {
            setError('Please complete the verification challenge.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://idleforest.com/auth/confirm?type=recovery',
            captchaToken: turnstileToken,
        });

        if (error) {
            setError(error.message);
            resetTurnstile();
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-[#F7F7F2] p-4">
            <div className="w-full max-w-md bg-white border border-neutral-200 p-8 rounded-2xl">
                <Link
                    href="/auth/user/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-black transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <h1 className="text-4xl font-extrabold text-center mb-4">
                    Reset Password
                </h1>
                <p className="text-center text-neutral-600 mb-8">
                    Enter your email and we&apos;ll send you a link to reset your password.
                </p>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-100 border border-green-500 text-green-700 font-bold text-center">
                            <p className="text-lg mb-2">Check your email!</p>
                            <p className="text-sm font-normal">
                                We&apos;ve sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>
                        <Link
                            href="/auth/user/login"
                            className="block w-full py-4 text-lg font-bold bg-brand-yellow transition-all text-center rounded-full"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-neutral-600 mb-1">
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
                                className="w-full px-4 py-3 border border-neutral-200 focus:ring-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current transition-all placeholder:text-neutral-400 bg-neutral-50 rounded-xl"
                                placeholder="forester@example.com"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 border border-red-500 text-red-700 font-bold text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                onSuccess={setTurnstileToken}
                                onExpire={() => setTurnstileToken(null)}
                                onError={() => setTurnstileToken(null)}
                                onTimeout={() => setTurnstileToken(null)}
                                options={{ action: 'password_reset' }}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !turnstileToken}
                                className="w-full py-4 text-lg font-bold bg-brand-yellow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-full"
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
