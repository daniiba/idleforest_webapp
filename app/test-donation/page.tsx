'use client';

import { useState, FormEvent } from 'react';

interface ApiResponse {
  message?: string;
  error?: string;
  treesPlanted?: number;
  companyName?: string;
  treeNationDetails?: any;
  details?: any; // For API error details
}

export default function TestDonationPage() {
  const [companyName, setCompanyName] = useState('');
  const [amountSpent, setAmountSpent]/*  */ = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/donate-trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyName,
          amountSpent: parseFloat(amountSpent),
        }),
      });

      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error submitting donation test:', error);
      setResponse({ error: 'Failed to fetch. Check browser console for more details.' });
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Test Tree Donation API</h1>
     {/*  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label htmlFor="companyName">Company Name:</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label htmlFor="amountSpent">Amount Spent (€):</label>
          <input
            type="number"
            id="amountSpent"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            required
            step="0.01"
            min="0"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '10px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isLoading ? 'Processing...' : 'Donate Trees'}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: response.error ? '#ffebee' : '#e8f5e9' }}>
          <h2>API Response:</h2>
          {response.message && <p><strong>Message:</strong> {response.message}</p>}
          {response.error && <p style={{ color: 'red' }}><strong>Error:</strong> {response.error}</p>}
          {response.treesPlanted !== undefined && <p><strong>Trees Planted:</strong> {response.treesPlanted}</p>}
          {response.companyName && <p><strong>Company:</strong> {response.companyName}</p>}
          {(response.treeNationDetails || response.details) && (
            <div>
              <strong>Details:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
                {JSON.stringify(response.treeNationDetails || response.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
