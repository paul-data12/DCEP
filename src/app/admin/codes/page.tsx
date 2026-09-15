'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Key, Copy, Plus } from 'lucide-react';

type AccessCode = {
  id: string;
  code: string;
  exam: { title: string; code: string };
  is_used: boolean;
  used_by?: { email: string };
  used_at?: string;
  created_at: string;
};

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedExam, setSelectedExam] = useState('');
  const [count, setCount] = useState('10');

  useEffect(() => {
    fetchCodes();
    fetch('/api/admin/exams')
      .then(r => r.json())
      .then(data => { setExams(data.exams || []); setSelectedExam(data.exams?.[0]?.id || ''); });
  }, []);

  const fetchCodes = () => {
    fetch('/api/admin/codes')
      .then(r => r.json())
      .then(data => { setCodes(data.codes || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam, count: parseInt(count) })
      });
      fetchCodes();
    } catch (err) {
      alert('Failed to generate codes');
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="text-sm font-bold tracking-tight">DCEP Admin</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-slate-400 hover:text-white">Questions</Link>
              <span className="text-white font-medium border-b-2 border-brand-500 py-4">Access Codes</span>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">← Back to Site</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Access Codes</h1>
            <p className="text-sm text-slate-500">Generate and manage exam vouchers</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Generate New Codes</h2>
          <form onSubmit={handleGenerate} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Exam</label>
              <select 
                value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {exams.map(e => <option key={e.id} value={e.id}>{e.code} - {e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
              <input 
                type="number" min="1" max="100" value={count} onChange={e => setCount(e.target.value)}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button 
              type="submit" disabled={generating}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate Codes'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Exam</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Used By</th>
                <th className="px-6 py-3">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Loading...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">No codes generated yet</td></tr>
              ) : codes.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-3 font-mono text-slate-900 font-medium">
                    <div className="flex items-center gap-2">
                      {c.code}
                      <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-slate-400 hover:text-brand-600">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{c.exam.code}</td>
                  <td className="px-6 py-3">
                    {c.is_used ? (
                      <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">USED</span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {c.is_used ? c.used_by?.email : '-'}
                  </td>
                  <td className="px-6 py-3 text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
