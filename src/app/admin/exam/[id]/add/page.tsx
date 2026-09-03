'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

type OptionRow = { option_text: string; is_correct: boolean };

export default function AddQuestionPage() {
  const { id: examId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const router = useRouter();

  const [domain, setDomain] = useState('');
  const [type, setType] = useState('single_choice');
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [source, setSource] = useState('');
  const [verified, setVerified] = useState(false);
  const [options, setOptions] = useState<OptionRow[]>([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing question if editing
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/questions/${editId}`)
      .then(r => r.json())
      .then(data => {
        const q = data.question;
        if (!q) return;
        setDomain(q.domain_topic || '');
        setType(q.question_type || 'single_choice');
        setText(q.question_text);
        setExplanation(q.explanation);
        setSource(q.source || '');
        setVerified(q.is_verified);
        setOptions(q.options.map((o: any) => ({ option_text: o.option_text, is_correct: o.is_correct })));
      });
  }, [editId]);

  const updateOption = (idx: number, field: keyof OptionRow, value: string | boolean) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const addOption = () => setOptions(prev => [...prev, { option_text: '', is_correct: false }]);
  const removeOption = (idx: number) => setOptions(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent, andAnother: boolean) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const body = {
      domain_topic: domain || null,
      question_type: type,
      question_text: text,
      explanation,
      source: source || null,
      is_verified: verified,
      options: options.filter(o => o.option_text.trim()),
    };

    if (editId) {
      await fetch(`/api/admin/questions/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, ...body }),
      });
    }

    setSaving(false);

    if (andAnother) {
      // Reset form for next question
      setDomain(domain); // keep domain
      setSource(source); // keep source
      setText('');
      setExplanation('');
      setOptions([
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      router.push(`/admin/exam/${examId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold tracking-tight">DCEP Admin</span>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to Site</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href={`/admin/exam/${examId}`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to Question Bank
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mb-6">{editId ? 'Edit Question' : 'Add New Question'}</h1>

        {saved && (
          <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">
            ✓ Question saved! Add another below.
          </div>
        )}

        <form className="space-y-5" onSubmit={e => handleSubmit(e, false)}>
          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Domain / Topic</label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. Prepare the Data"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Question Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="single_choice">Single Choice</option>
                <option value="multi_select">Multi Select</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Source</label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="e.g. 2024 Exam Dump"
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Question Text *</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              required
              placeholder="Enter the full question text…"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Answer Options *</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateOption(idx, 'is_correct', !opt.is_correct)}
                    className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors text-xs font-bold
                      ${opt.is_correct ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-slate-300 hover:border-emerald-400'}
                    `}
                    title="Mark as correct"
                  >
                    ✓
                  </button>
                  <input
                    type="text"
                    value={opt.option_text}
                    onChange={e => updateOption(idx, 'option_text', e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Option
            </button>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Explanation *</label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={3}
              required
              placeholder="Explain why the correct answer is correct…"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Verified checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-slate-700 font-medium">Mark as Verified</span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editId ? 'Save Changes' : 'Save Question'}
            </button>
            {!editId && (
              <button
                type="button"
                disabled={saving}
                onClick={e => handleSubmit(e as any, true)}
                className="flex-1 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Save & Add Another
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
