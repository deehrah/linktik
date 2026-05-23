'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    try {
      setError('');
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('No token found. Please login first.');
        return;
      }

      console.log('Token:', token.substring(0, 20));

      const response = await fetch('http://localhost:5000/api/links', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(JSON.stringify(data, null, 2));
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Test Page</h1>
        
        <button
          onClick={testAPI}
          className="px-6 py-3 bg-[#28C88C] text-white rounded-xl font-semibold mb-4"
        >
          Test API Connection
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
            <h3 className="text-red-500 font-bold mb-2">Error:</h3>
            <pre className="text-red-400 text-sm overflow-auto">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-[#1E293B] border border-[#28C88C] rounded-xl p-4">
            <h3 className="text-[#28C88C] font-bold mb-2">Success! Data received:</h3>
            <pre className="text-white text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <h3 className="text-white font-bold mb-2">Debug Info:</h3>
          <p className="text-[#8E9CB1] text-sm">
            Token exists: {localStorage.getItem('accessToken') ? 'Yes' : 'No'}
          </p>
          <p className="text-[#8E9CB1] text-sm">
            API URL: http://localhost:5000/api/links
          </p>
        </div>
      </div>
    </div>
  );
}
