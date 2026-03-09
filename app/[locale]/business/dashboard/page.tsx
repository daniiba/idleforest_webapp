'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// --- Component for Creating a Company ---
const CreateCompanyForm = ({ onCompanyCreated }: { onCompanyCreated: () => void }) => {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch('/api/business/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, website }),
    });

    if (response.ok) {
      onCompanyCreated(); // Reload dashboard data
    } else {
      const { error } = await response.json();
      setError(error || 'Failed to create company.');
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Business Profile</h2>
      <p className="text-center text-sm text-gray-600">Complete your registration by creating a company profile. This will give you access to your API key and dashboard.</p>
      <form onSubmit={handleCreateCompany} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="website" className="text-sm font-medium text-gray-700">Website (Optional)</label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button type="submit" disabled={submitting} className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create Company'}
        </button>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
};

// --- Main Dashboard Page Component ---
interface Company {
  id: string;
  name: string;
  website: string;
  api_key: string;
}

interface Donation {
  id: string;
  trees_planted: number;
  created_at: string;
}

export default function BusinessDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If a company exists, set it and fetch donations
    if (companyData) {
      setCompany(companyData);
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (donationError) {
        setError('Could not retrieve donation history.');
      } else {
        setDonations(donationData || []);
      }
    } else if (companyError && companyError.code !== 'PGRST116') {
      // An actual error occurred, not just 'no rows found'
      setError('Could not retrieve company information.');
    }
    // If no company and no error, the form will be shown.

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  // --- Render Logic ---
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please log in or sign up to view the business dashboard.</p>
          <div className="space-x-4">
            <Link href="/auth/business/login" legacyBehavior>
              <a className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Login
              </a>
            </Link>
            <Link href="/auth/business/signup" legacyBehavior>
              <a className="px-6 py-2 font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Up
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  // If user is logged in but has no company, show the creation form
  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <CreateCompanyForm onCompanyCreated={fetchDashboardData} />
      </div>
    );
  }

  // If user has a company, show the dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{company.name} Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Company Details</h2>
            <p className="text-gray-600"><span className="font-medium">Name:</span> {company.name}</p>
            {company.website && (
              <p className="text-gray-600"><span className="font-medium">Website:</span> <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{company.website}</a></p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your API Key</h2>
            <p className="text-gray-600 mb-4">Use this key in the Idleforest desktop app to track your company's rewards.</p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
              {company.api_key}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trees Planted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.length > 0 ? (
                  donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(donation.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.trees_planted}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No donations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
