import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, BookOpen, ArrowLeft } from 'lucide-react';

export default async function ResultPage({ params }: { params: { id: string; attemptId: string } }) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { options: true }
          }
        }
      },
      user_responses: true
    }
  });

  if (!attempt || attempt.user_id !== user.id || !attempt.is_submitted) {
    redirect('/');
  }

  const exam = attempt.exam;
  const questions = exam.questions;
  
  // Re-run the scoring logic to generate diagnostic (similar to submit route)
  let correctCount = 0;
  const diagnostic = [];

  for (const question of questions) {
    const response = attempt.user_responses.find(r => r.question_id === question.id);
    if (!response) continue; // Only process questions that were part of this attempt

    let correctOptionIds = question.options.filter(o => o.is_correct).map(o => o.id);
    let selectedOptionIds: string[] = [];
    
    if (response.selected_option_ids) {
      try { selectedOptionIds = JSON.parse(response.selected_option_ids); } catch (e) {}
    }

    let isCorrect = false;

    if (question.question_type === 'matrix' || question.question_type === 'drag_drop') {
      const meta = question.metadata ? JSON.parse(question.metadata) : {};
      const correctMapping = meta.correct_mapping || {};
      const requiredKeys = Object.keys(correctMapping);
      
      correctOptionIds = requiredKeys.map((idx) => {
        const opt = question.options.find(o => o.option_text === correctMapping[idx]);
        return opt ? `${idx}:${opt.id}` : null;
      }).filter(Boolean) as string[];

      if (requiredKeys.length > 0 && selectedOptionIds.length === requiredKeys.length) {
        isCorrect = selectedOptionIds.every((sel: string) => {
          const [idx, optId] = sel.split(':');
          const selectedOpt = question.options.find(o => o.id === optId);
          if (!selectedOpt) return false;
          return correctMapping[idx] === selectedOpt.option_text;
        });
      }
    } else {
      isCorrect = 
        correctOptionIds.length > 0 &&
        correctOptionIds.length === selectedOptionIds.length &&
        correctOptionIds.every(id => selectedOptionIds.includes(id));
    }

    if (isCorrect) correctCount++;

    diagnostic.push({
      question,
      isCorrect,
      correctOptionIds,
      selectedOptionIds,
    });
  }

  const passed = (attempt.score || 0) >= exam.passing_score;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-display">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-900">{exam.title} — Attempt Report</span>
        </div>
      </nav>

      <div className="flex-1 p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className={`px-8 py-8 text-center shrink-0 ${passed ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
              <span className="text-3xl font-black">{((attempt.score || 0) * 10).toFixed(0)}<span className="text-lg opacity-70"> / 1000</span></span>
            </div>
            <h2 className="text-2xl font-bold">{passed ? 'Congratulations, You Passed!' : 'Exam Not Passed'}</h2>
            <p className="text-sm opacity-80 mt-1">Taken on {new Date(attempt.end_time!).toLocaleDateString()}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6 flex-1 bg-slate-50">
            {diagnostic.map((d: any, i: number) => {
              const q = d.question;
              
              const renderAnswers = (optionIds: string[]) => {
                if (!optionIds || optionIds.length === 0) return <span className="text-slate-400 italic">No answer provided</span>;
                
                if (q.question_type === 'matrix' || q.question_type === 'drag_drop') {
                  return (
                    <ul className="list-disc pl-4 space-y-1">
                      {optionIds.map((sel: string) => {
                        const [idx, optId] = sel.split(':');
                        const opt = q.options.find((o: any) => o.id === optId);
                        const meta = q.metadata ? JSON.parse(q.metadata) : {};
                        const rowText = (meta.rows || meta.dropZones || [])[parseInt(idx)] || `Item ${idx}`;
                        return <li key={sel}><strong>{rowText}:</strong> {opt?.option_text || optId}</li>;
                      })}
                    </ul>
                  );
                } else {
                  return (
                    <ul className="list-disc pl-4 space-y-1">
                      {optionIds.map((id: string) => {
                        const opt = q.options.find((o: any) => o.id === id);
                        return <li key={id}>{opt?.option_text || id}</li>;
                      })}
                    </ul>
                  );
                }
              };

              return (
                <div key={q.id} className={`bg-white rounded-xl border p-5 sm:p-6 shadow-sm ${d.isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                    {d.isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    }
                    <span className="text-sm font-bold text-slate-800">Question {i + 1}</span>
                    <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{q.domain_topic}</span>
                  </div>
                  
                  <div className="prose prose-sm prose-slate max-w-none mb-6 font-medium" dangerouslySetInnerHTML={{ __html: q.question_text }} />

                  <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="font-bold text-slate-700 mb-2">Your Answer:</p>
                      <div className="text-slate-600">
                        {renderAnswers(d.selectedOptionIds)}
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <p className="font-bold text-emerald-800 mb-2">Correct Answer:</p>
                      <div className="text-emerald-700">
                        {renderAnswers(d.correctOptionIds)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Explanation
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-slate-200 bg-white text-center shrink-0">
            <Link href="/" className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
