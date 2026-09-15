'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key } from 'lucide-react';

export default function UnlockExamForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/user/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Exam unlocked successfully!');
        setCode('');
        router.refresh();
      } else {
        setError(data.error || 'Failed to unlock exam');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-12">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Key className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">Unlock an Exam</h3>
          <p className="text-sm text-slate-500 mb-4">Enter your access code to permanently unlock an exam.</p>
          
          <form onSubmit={handleUnlock} className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="e.g. PL300-A7X9-B2M1"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </button>
          </form>
          {error && <p className="text-rose-500 text-xs font-semibold mt-2">{error}</p>}
          {success && <p className="text-emerald-600 text-xs font-semibold mt-2">{success}</p>}
        </div>
      </div>
    </div>
  );
}
