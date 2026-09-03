'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '@/hooks/useTimer';
import {
  Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  BookOpen, Clock, AlertTriangle, ShieldCheck, Timer, Send,
  CircleDot, SquareCheck, Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── Pre-Exam Briefing Screen ──────────────────────────────────── */
function ExamBriefing({ examTitle, durationMinutes, onStart }: { examTitle: string; durationMinutes: number; onStart: () => void }) {
  const rules = [
    { icon: Timer, title: `${durationMinutes} Minute Time Limit`, desc: 'The countdown begins the moment you click "Start". It cannot be paused or extended. The exam auto-submits when time runs out.' },
    { icon: ShieldCheck, title: 'Proctored Environment', desc: 'Tab switches, copy attempts, and right-clicks are monitored and logged. Stay on this tab at all times.' },
    { icon: CheckCircle2, title: 'Auto-Save Enabled', desc: 'Every answer you select is synced to the server in real time. You will not lose progress.' },
    { icon: Flag, title: 'Flag & Review', desc: 'Unsure about a question? Flag it and come back later. Use the navigator or the review screen before submitting.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-brand-600 px-8 py-6 text-white">
            <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">Exam Briefing</p>
            <h1 className="text-2xl font-bold">{examTitle}</h1>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              {rules.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onStart}
                className="w-full h-12 rounded-lg bg-brand-600 text-white font-semibold text-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(79,70,229,1)] hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Start Exam
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">By starting, you agree to the exam terms and proctoring policy.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Question Navigator Drawer (Mobile) ─────────────────────── */
function MobileNavigator({ 
  open, onClose, questions, responses, currentIndex, showReview, onChange, onReview
}: {
  open: boolean; onClose: () => void; questions: any[]; responses: Record<string, any>;
  currentIndex: number; showReview: boolean; onChange: (i: number) => void; onReview: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-white border-l border-slate-200 z-50 flex flex-col"
          >
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4">
              <span className="text-sm font-bold text-slate-900">Navigator</span>
              <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavigatorGrid questions={questions} responses={responses} currentIndex={currentIndex} showReview={showReview} onChange={(i) => { onChange(i); onClose(); }} />
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => { onReview(); onClose(); }} className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                Review & Submit
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Shared Navigator Grid ──────────────────────────────────── */
function NavigatorGrid({ questions, responses, currentIndex, showReview, onChange }: {
  questions: any[]; responses: Record<string, any>; currentIndex: number; showReview: boolean; onChange: (i: number) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, idx) => {
          const r = responses[q.id];
          const answered = r && r.selected.length > 0;
          const isCurrent = currentIndex === idx && !showReview;
          const isFlagged = r?.flagged;

          return (
            <button
              key={q.id}
              onClick={() => onChange(idx)}
              className={`
                relative h-9 rounded text-xs font-bold transition-all border
                ${isCurrent ? 'ring-2 ring-brand-600 ring-offset-1' : ''}
                ${answered
                  ? 'bg-brand-600 text-white border-brand-600'
                  : isFlagged
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }
              `}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-5 space-y-1.5 text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-brand-600" /> Answered</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-slate-50 border border-slate-200" /> Unanswered</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Flagged</div>
      </div>
    </>
  );
}

/* ─── Main Exam Client ───────────────────────────────────────── */
export default function ExamClient({ examId, durationMinutes, examTitle }: { examId: string; durationMinutes: number; examTitle: string }) {
  const [phase, setPhase] = useState<'briefing' | 'starting' | 'exam' | 'result'>('briefing');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { selected: string[]; flagged: boolean }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const router = useRouter();

  /* ── Start exam ── */
  const handleStartExam = async () => {
    setPhase('starting');
    try {
      const res = await fetch('/api/exams/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      const data = await res.json();
      if (data.attemptId) {
        setAttemptId(data.attemptId);
        setQuestions(data.exam.questions);
        
        // Brief professional loading transition
        setTimeout(() => {
          setPhase('exam');
        }, 1500);
      } else {
        setPhase('briefing');
        alert(data.error || 'Failed to start exam.');
      }
    } catch {
      alert('Failed to start exam. Please reload.');
      setPhase('briefing');
    }
  };

  /* ── Timer — only ticks during exam phase ── */
  const handleExpire = useCallback(() => {
    if (!isSubmitting && attemptId) submitExam();
  }, [isSubmitting, attemptId]);

  const timerActive = phase === 'exam';
  const secondsLeft = useTimer(durationMinutes * 60, handleExpire, timerActive);

  /* ── Tab-switch detection ── */
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden' && attemptId && phase === 'exam')
        alert('WARNING: Tab switch detected. This has been recorded.');
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [attemptId, phase]);

  /* ── Sync ── */
  const syncProgress = (qId: string, selected: string[], flagged: boolean) => {
    if (!attemptId) return;
    fetch('/api/exams/sync', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, questionId: qId, selectedOptionIds: selected, isFlagged: flagged }),
    }).catch(console.error);
  };

  const handleOptionToggle = (optionId: string, isMulti: boolean) => {
    const qId = questions[currentIndex].id;
    const curr = responses[qId]?.selected || [];
    const newSel = isMulti
      ? curr.includes(optionId) ? curr.filter(id => id !== optionId) : [...curr, optionId]
      : [optionId];
    const flagged = responses[qId]?.flagged || false;
    setResponses(prev => ({ ...prev, [qId]: { selected: newSel, flagged } }));
    syncProgress(qId, newSel, flagged);
  };

  const handleComplexToggle = (complexId: string, type: 'matrix' | 'drag_drop') => {
    const qId = questions[currentIndex].id;
    const curr = responses[qId]?.selected || [];
    let newSel = [...curr];

    if (type === 'matrix') {
      const [rowIdx] = complexId.split(':');
      newSel = [...curr.filter(id => !id.startsWith(rowIdx + ':')), complexId];
    } else if (type === 'drag_drop') {
      const [zoneIdx] = complexId.split(':');
      newSel = [...curr.filter(id => !id.startsWith(zoneIdx + ':')), complexId];
    }
    
    const flagged = responses[qId]?.flagged || false;
    setResponses(prev => ({ ...prev, [qId]: { selected: newSel, flagged } }));
    syncProgress(qId, newSel, flagged);
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex].id;
    const current = responses[qId] || { selected: [], flagged: false };
    const newFlag = !current.flagged;
    setResponses(prev => ({ ...prev, [qId]: { ...current, flagged: newFlag } }));
    syncProgress(qId, current.selected, newFlag);
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attemptId, 
          questionIds: questions.map(q => q.id) 
        }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch {
      alert('Error submitting.');
      setIsSubmitting(false);
    }
  };

  const changeQuestion = (idx: number) => {
    setCurrentIndex(idx);
    setShowReview(false);
  };

  /* ── FORMAT TIME ── */
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  const isWarning = secondsLeft <= 15 * 60 && secondsLeft > 5 * 60;
  const isDanger = secondsLeft <= 5 * 60;

  /* ╔══════════════════════════════════════════════════════════════╗
     ║  BRIEFING PHASE                                            ║
     ╚══════════════════════════════════════════════════════════════╝ */
  if (phase === 'briefing') {
    return <ExamBriefing examTitle={examTitle} durationMinutes={durationMinutes} onStart={handleStartExam} />;
  }

  /* ╔══════════════════════════════════════════════════════════════╗
     ║  RESULT PHASE                                              ║
     ╚══════════════════════════════════════════════════════════════╝ */
  if (phase === 'result' && result) {
    const passed = result.isPass;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Score header */}
          <div className={`px-8 py-8 text-center ${passed ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
              <span className="text-3xl font-black">{result.score.toFixed(0)}%</span>
            </div>
            <h2 className="text-2xl font-bold">{passed ? 'Congratulations, You Passed!' : 'Exam Not Passed'}</h2>
            <p className="text-sm opacity-80 mt-1">{examTitle} — Diagnostic Report</p>
          </div>

          {/* Diagnostic list */}
          <div className="p-6 sm:p-8 max-h-[50vh] overflow-y-auto space-y-3">
            {result.diagnostic.map((d: any, i: number) => (
              <div key={d.questionId} className={`rounded-lg border p-4 ${d.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {d.isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-600" />
                  }
                  <span className="text-sm font-bold text-slate-800">Q{i + 1}</span>
                  <span className="ml-auto text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{d.domain}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{d.explanation}</p>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-100 text-center">
            <button onClick={() => router.push('/')} className="h-10 px-6 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ╔══════════════════════════════════════════════════════════════╗
     ║  LOADING                                                   ║
     ╚══════════════════════════════════════════════════════════════╝ */
  if (questions.length === 0 || phase === 'starting') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Generating your unique {questions.length > 0 ? questions.length : 50}-question exam...</p>
        </div>
      </div>
    );
  }

  /* ╔══════════════════════════════════════════════════════════════╗
     ║  EXAM PHASE                                                ║
     ╚══════════════════════════════════════════════════════════════╝ */
  const currentQ = questions[currentIndex];
  const currentR = responses[currentQ.id] || { selected: [], flagged: false };
  const isMulti = currentQ.question_type === 'multi_select';
  const answeredCount = questions.filter(q => responses[q.id]?.selected?.length > 0).length;

  return (
    <div className="h-screen bg-slate-50 flex flex-col select-none overflow-hidden" onContextMenu={e => e.preventDefault()}>

      {/* Mobile Nav Drawer */}
      <MobileNavigator
        open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}
        questions={questions} responses={responses} currentIndex={currentIndex}
        showReview={showReview} onChange={changeQuestion} onReview={() => setShowReview(true)}
      />

      {/* ── Top Bar ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="text-sm font-bold text-slate-900 truncate">{examTitle}</span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`
            flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums px-3 py-1 rounded-md border
            ${isDanger ? 'bg-red-50 text-red-700 border-red-200 timer-danger' : isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'}
          `}>
            <Clock className="w-3.5 h-3.5" />
            {fmt(secondsLeft)}
          </div>
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {showReview ? (
              /* ── Review Screen ── */
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-1">Review Your Answers</h2>
                <p className="text-sm text-slate-500 mb-6">{answeredCount} of {questions.length} questions answered. Review flagged items before submitting.</p>

                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1.5">
                    {questions.map((q, idx) => {
                      const r = responses[q.id];
                      const answered = r && r.selected.length > 0;
                      return (
                        <button
                          key={q.id}
                          onClick={() => changeQuestion(idx)}
                          className={`relative h-9 rounded text-xs font-bold border transition-all
                            ${answered ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                            ${r?.flagged ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                          `}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={submitExam}
                    disabled={isSubmitting}
                    className="flex-1 h-11 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting…' : 'Submit Exam'}
                  </button>
                  <button
                    onClick={() => setShowReview(false)}
                    className="flex-1 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Continue Exam
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Question Card ── */
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className={`mx-auto ${currentQ.case_study ? 'max-w-6xl flex flex-col lg:flex-row gap-6' : 'max-w-3xl'}`}
              >
                {/* Case Study Panel */}
                {currentQ.case_study && (
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
                      <span className="font-bold text-sm tracking-wide">Case Study</span>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">{currentQ.case_study.title}</span>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh] lg:max-h-full">
                      <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">
                        {currentQ.case_study.content}
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Panel */}
                <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${currentQ.case_study ? 'flex-1' : ''}`}>
                  {/* Question header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {currentIndex + 1} <span className="text-slate-300">/ {questions.length}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-100">
                      {currentQ.domain_topic}
                    </span>
                  </div>

                  {/* Question body */}
                  <div className="p-6">
                    <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed mb-6">
                      {currentQ.question_text}
                    </p>

                    {currentQ.media_url && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img src={currentQ.media_url} alt="Question Media" className="w-full h-auto object-contain bg-slate-50" />
                      </div>
                    )}

                    {isMulti && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 rounded px-2.5 py-1.5 mb-5 w-fit">
                        <AlertCircle className="w-3.5 h-3.5" /> Select all correct answers
                      </div>
                    )}

                    {/* RENDERER BASED ON TYPE */}
                    {(() => {
                      const meta = currentQ.metadata ? JSON.parse(currentQ.metadata) : {};

                      // MATRIX (Yes/No rows)
                      if (currentQ.question_type === 'matrix') {
                        const rows = meta.rows || [];
                        return (
                          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 w-1/2">Statement</th>
                                  {currentQ.options.map((o: any) => (
                                    <th key={o.id} className="px-4 py-3 text-center">{o.option_text}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {rows.map((rowText: string, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{rowText}</td>
                                    {currentQ.options.map((o: any) => {
                                      const complexId = `${rIdx}:${o.id}`;
                                      const isSelected = currentR.selected.includes(complexId);
                                      return (
                                        <td key={o.id} className="px-4 py-3 text-center cursor-pointer" onClick={() => handleComplexToggle(complexId, 'matrix')}>
                                          <div className={`mx-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
                                            {isSelected && <CircleDot className="w-3 h-3" />}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // DRAG AND DROP (Dropdown matching fallback for simplicity/accessibility)
                      if (currentQ.question_type === 'drag_drop') {
                        const zones = meta.dropZones || [];
                        return (
                          <div className="space-y-4">
                            {zones.map((zoneText: string, zIdx: number) => {
                              const selectedOptionId = currentR.selected.find(s => s.startsWith(`${zIdx}:`))?.split(':')[1];
                              const selectedOption = currentQ.options.find((o: any) => o.id === selectedOptionId);
                              return (
                                <div key={zIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4">
                                  <span className="font-semibold text-slate-700">{zoneText}</span>
                                  <div className="relative shrink-0 sm:w-64">
                                    <select
                                      className="block w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 px-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                      value={selectedOptionId || ''}
                                      onChange={(e) => handleComplexToggle(`${zIdx}:${e.target.value}`, 'drag_drop')}
                                    >
                                      <option value="" disabled>Select match...</option>
                                      {currentQ.options.map((o: any) => (
                                        <option key={o.id} value={o.id}>{o.option_text}</option>
                                      ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // STANDARD SINGLE/MULTI CHOICE
                      return (
                        <div className="space-y-2.5">
                          {currentQ.options.map((opt: any) => {
                            const selected = currentR.selected.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleOptionToggle(opt.id, isMulti)}
                                className={`
                                  group w-full text-left rounded-lg border-2 p-4 transition-all flex items-start gap-3
                                  ${selected
                                    ? 'border-brand-600 bg-brand-50/60'
                                    : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/20'
                                  }
                                `}
                              >
                                <div className={`
                                  shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center border-2 transition-colors
                                  ${isMulti ? 'rounded' : 'rounded-full'}
                                  ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 group-hover:border-brand-400'}
                                `}>
                                  {selected && (isMulti
                                    ? <SquareCheck className="w-3.5 h-3.5" />
                                    : <CircleDot className="w-3 h-3" />
                                  )}
                                </div>
                                <span className={`text-sm leading-relaxed font-medium ${selected ? 'text-brand-900' : 'text-slate-700'}`}>
                                  {opt.option_text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── Sidebar (Desktop) ── */}
        <aside className="w-64 bg-white border-l border-slate-200 hidden lg:flex flex-col shrink-0">
          <div className="p-5 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Navigator</h3>
            <NavigatorGrid questions={questions} responses={responses} currentIndex={currentIndex} showReview={showReview} onChange={changeQuestion} />
          </div>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setShowReview(true)} className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
              Review & Submit
            </button>
          </div>
        </aside>
      </div>

      {/* ── Bottom Bar ── */}
      {!showReview && (
        <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold border transition-colors
              ${currentR.flagged
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }
            `}
          >
            <Flag className={`w-4 h-4 ${currentR.flagged ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{currentR.flagged ? 'Flagged' : 'Flag'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => changeQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 h-9 px-3 sm:px-4 rounded-md bg-white border border-slate-200 text-slate-600 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center gap-1 h-9 px-4 sm:px-5 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Review <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => changeQuestion(currentIndex + 1)}
                className="flex items-center gap-1 h-9 px-4 sm:px-5 rounded-md bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
