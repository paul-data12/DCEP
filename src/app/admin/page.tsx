'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Database, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

type ExamStat = {
  id: string;
  title: string;
  code: string;
  total_questions: number;
  questionCount: number;
  verifiedCount: number;
};

export default function AdminDashboard() {
  const [exams, setExams] = useState<ExamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/exams')
      .then(r => r.json())
      .then(data => { setExams(data.exams || []); setLoading(false); })
      .catch(() => { setExams([]); setLoading(false); });
  }, []);

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

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Question Bank</h1>
        <p className="text-sm text-slate-500 mb-8">Manage exam dumps and verified past questions for each certification.</p>

        {loading ? (
          <div className="text-sm text-slate-400">Loading exams…</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map(exam => (
              <Link
                key={exam.id}
                href={`/admin/exam/${exam.id}`}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                <h3 className="text-base font-bold text-slate-900">{exam.code}</h3>
                <p className="text-xs text-slate-400 mb-4">{exam.title}</p>

                <div className="mt-auto flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {exam.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {exam.verifiedCount} verified
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: exam.questionCount > 0 ? `${(exam.verifiedCount / exam.questionCount) * 100}%` : '0%' }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
