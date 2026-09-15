'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, BookOpen, Clock, Activity } from 'lucide-react';

type UserData = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  entitlements: { exam: { code: string } }[];
  exam_attempts: { id: string; score: number; end_time: string; exam: { code: string } }[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      <nav className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="text-sm font-bold tracking-tight">DCEP Admin</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">Questions</Link>
              <Link href="/admin/codes" className="text-slate-400 hover:text-white transition-colors">Access Codes</Link>
              <span className="text-white font-medium border-b-2 border-brand-500 py-4">Users & Scores</span>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to Site</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Student Progress</h1>
            <p className="text-sm text-slate-500">Monitor all students, their unlocked exams, and their performance.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading students...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-slate-500 bg-white p-8 rounded-xl border border-slate-200">No students have signed up yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Unlocked Exams</th>
                    <th className="px-6 py-4">Total Attempts</th>
                    <th className="px-6 py-4">Last Exam Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => {
                    const attempts = user.exam_attempts;
                    const latestAttempt = attempts[0];
                    const unlocked = user.entitlements.map(e => e.exam.code);

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          {unlocked.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {unlocked.map(code => (
                                <span key={code} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-xs font-semibold">
                                  {code}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-md text-xs">
                            {attempts.length} attempts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {latestAttempt ? (
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-2">
                                {latestAttempt.exam.code}
                                <span className={\`text-xs px-2 py-0.5 rounded \${latestAttempt.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}\`}>
                                  {(latestAttempt.score * 10).toFixed(0)} / 1000
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(latestAttempt.end_time).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Hasn't taken an exam</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
