import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/app/components/LogoutButton';
import { Award, Clock, ArrowRight, Brain, BarChart3, ChevronRight } from 'lucide-react';
import { marked } from 'marked';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch all completed attempts for this user
  const attempts = await prisma.examAttempt.findMany({
    where: { 
      user_id: user.id as string,
      is_submitted: true 
    },
    orderBy: { end_time: 'desc' },
    include: {
      exam: {
        include: {
          questions: {
            include: { options: true }
          }
        }
      },
      user_responses: true,
    }
  });

  // Calculate domain stats
  const domainStats: Record<string, { total: number; correct: number }> = {};
  
  attempts.forEach(attempt => {
    attempt.user_responses.forEach(response => {
      const question = attempt.exam.questions.find(q => q.id === response.question_id);
      if (!question || !question.domain_topic) return;

      const domain = question.domain_topic;
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, correct: 0 };
      }

      // Very rough correctness check based on what is in db. 
      // (Since we don't store "isCorrect" natively per response right now, we have to re-evaluate it).
      const correctOptionIds = question.options.filter(o => o.is_correct).map(o => o.id);
      let selectedOptionIds: string[] = [];
      try {
        selectedOptionIds = JSON.parse(response.selected_option_ids || '[]');
      } catch(e){}

      let isCorrect = false;
      if (question.question_type === 'matrix' || question.question_type === 'drag_drop') {
        const meta = question.metadata ? JSON.parse(question.metadata) : {};
        const correctMapping = meta.correct_mapping || {};
        if (selectedOptionIds.length === Object.keys(correctMapping).length) {
          isCorrect = selectedOptionIds.every((sel: string) => {
            const [idx, optId] = sel.split(':');
            const selectedOpt = question.options.find(o => o.id === optId) || { option_text: optId.replace(/^synth-\d+-/, '') };
            return correctMapping[idx] === selectedOpt.option_text;
          });
        }
      } else {
        isCorrect = correctOptionIds.length > 0 &&
          correctOptionIds.length === selectedOptionIds.length &&
          correctOptionIds.every(id => selectedOptionIds.includes(id));
      }

      domainStats[domain].total++;
      if (isCorrect) {
        domainStats[domain].correct++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">DCEP</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-medium text-brand-600 hover:text-brand-700 mr-4">Take an Exam</Link>
            <span className="font-medium text-slate-700 hidden sm:block">{user.email as string}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="mt-2 text-slate-500 text-lg">Track your progress and identify areas for improvement.</p>
        </div>

        {/* Domain Weaknesses */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-500" />
            Performance by Domain
          </h2>
          {Object.keys(domainStats).length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-sm">
              <p className="text-slate-500">Take an exam to see your domain breakdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(domainStats).map(([domain, stats]) => {
                const percentage = Math.round((stats.correct / stats.total) * 100);
                let colorClass = 'text-emerald-600 bg-emerald-50 ring-emerald-200';
                let barClass = 'bg-emerald-500';
                if (percentage < 50) {
                  colorClass = 'text-red-600 bg-red-50 ring-red-200';
                  barClass = 'bg-red-500';
                } else if (percentage < 70) {
                  colorClass = 'text-amber-600 bg-amber-50 ring-amber-200';
                  barClass = 'bg-amber-500';
                }

                return (
                  <div key={domain} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-tight mb-2">{domain}</h3>
                      <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>{stats.correct} / {stats.total} correct</span>
                        <span className={`px-2 py-0.5 rounded-full ring-1 font-semibold text-xs ${colorClass}`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barClass}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Historical Results */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Past Exam Attempts
          </h2>
          <div className="space-y-4">
            {attempts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-sm">
                <p className="text-slate-500">No completed exams yet.</p>
              </div>
            ) : (
              attempts.map(attempt => {
                const date = attempt.end_time ? new Date(attempt.end_time).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : 'Unknown Date';
                
                const score = attempt.score !== null ? parseFloat(attempt.score.toString()) : 0;
                const passed = score >= (attempt.exam.passing_score || 700);

                return (
                  <Link 
                    key={attempt.id} 
                    href={`/exam/${attempt.exam.id}/result/${attempt.id}`}
                    className="block group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-900">{attempt.exam.code}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm">Completed on {date}</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-black tracking-tight text-slate-900">
                            {score.toFixed(0)} <span className="text-sm font-medium text-slate-400">/ 1000</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
