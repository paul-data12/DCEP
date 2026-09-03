'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield, ArrowLeft, Plus, Upload, Trash2, Pencil, CheckCircle2,
  CircleSlash, BookOpen, Filter
} from 'lucide-react';

type Question = {
  id: string;
  domain_topic: string | null;
  question_type: string | null;
  question_text: string;
  is_verified: boolean;
  source: string | null;
  created_at: string;
  _count: { options: number };
};

export default function QuestionBankPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [examTitle, setExamTitle] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchQuestions = () => {
    const params = new URLSearchParams({ examId });
    if (filterVerified === 'true') params.set('verified', 'true');
    if (filterVerified === 'false') params.set('verified', 'false');
    if (filterDomain !== 'all') params.set('domain', filterDomain);

    fetch(`/api/admin/questions?${params}`)
      .then(r => r.json())
      .then(data => { setQuestions(data.questions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Fetch exam title
    fetch('/api/admin/exams')
      .then(r => r.json())
      .then(data => {
        const exam = data.exams?.find((e: any) => e.id === examId);
        if (exam) setExamTitle(exam.title);
      });
  }, [examId]);

  useEffect(() => {
    fetchQuestions();
  }, [examId, filterVerified, filterDomain]);

  const domains = [...new Set(questions.map(q => q.domain_topic).filter(Boolean))];

  const handleDelete = async (qId: string) => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    setDeleting(qId);
    await fetch(`/api/admin/questions/${qId}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== qId));
    setDeleting(null);
  };

  const toggleVerified = async (q: Question) => {
    await fetch(`/api/admin/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_verified: !q.is_verified }),
    });
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_verified: !x.is_verified } : x));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold tracking-tight">DCEP Admin</span>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to Site</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb + Title */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors mb-3">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{examTitle || 'Question Bank'}</h1>
          <p className="text-sm text-slate-500 mt-1">{questions.length} questions in bank</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link
            href={`/admin/exam/${examId}/add`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Question
          </Link>
          <Link
            href={`/admin/exam/${examId}/bulk`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterVerified}
              onChange={e => setFilterVerified(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <select
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="all">All Domains</option>
              {domains.map(d => <option key={d} value={d!}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No questions in this bank yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add individual questions or use bulk import to load a dump.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-8">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Question</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Domain</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Source</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-medium leading-snug line-clamp-2">{q.question_text}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{q._count.options} options</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {q.domain_topic && (
                          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                            {q.domain_topic}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{q.question_type?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{q.source || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleVerified(q)} title="Toggle verified">
                          {q.is_verified
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            : <CircleSlash className="w-5 h-5 text-slate-300 mx-auto hover:text-amber-500 transition-colors" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/exam/${examId}/add?edit=${q.id}`}
                            className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-brand-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
