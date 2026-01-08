'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function BusinessSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: `${window.location.origin}/auth/callback`, // Or your specific callback URL
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      setError('Signup successful, but no user data returned. Please try logging in.');
      setLoading(false);
      return;
    }

    // 2. Create the company profile via API
    // We pass the user_id from the signup response to associate the company
    const companyPayload = {
      userId: signUpData.user.id,
      companyName,
      website,
    };

    try {
      const response = await fetch('/api/business/create', { // Using existing endpoint, may need adjustment
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Attempt to delete the user if company creation fails to avoid orphaned users
        // This requires admin privileges and a separate backend function.
        // For now, we'll just show an error.
        // await supabase.auth.admin.deleteUser(signUpData.user.id) // Example, DO NOT use directly on client
        setError(result.error || 'Failed to create company profile after signup. Please contact support.');
      } else {
        setMessage('Signup successful! Please check your email to confirm your account. Then you can log in.');
        // Optionally, clear the form or redirect to a success/login page
        // router.push('/auth/business/login');
      }
    } catch (apiError: any) {
      setError(`An error occurred while creating your company profile: ${apiError.message}`);
    }

    setLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create Business Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <hr className="my-6" />
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input id="companyName" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Company Website (Optional)</label>
            <input id="website" name="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          {message && <p className="text-sm text-center text-green-600">{message}</p>}

          <div>
            <button type="submit" disabled={loading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/business/login" legacyBehavior>
            <a className="font-medium text-indigo-600 hover:text-indigo-500">Log in</a>
          </Link>
        </p>
      </div>
    </main>
  );
}
