'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Upload, AlertCircle, CheckCircle2, FileText, Sparkles, Loader2 } from 'lucide-react';

const EXAMPLE_JSON = `[
  {
    "domain_topic": "Prepare the Data",
    "question_type": "single_choice",
    "question_text": "What is query folding in Power Query?",
    "explanation": "Query folding pushes transformations to the source database...",
    "source": "2024 Exam Dump",
    "is_verified": true,
    "options": [
      { "option_text": "A local caching mechanism", "is_correct": false },
      { "option_text": "Pushing transformations to the data source", "is_correct": true },
      { "option_text": "Compressing query results", "is_correct": false },
      { "option_text": "Folding multiple queries into one", "is_correct": false }
    ]
  }
]`;

export default function BulkImportPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [previewCount, setPreviewCount] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setMessage('AI is reading and structuring your PDF… This may take up to 2 minutes for large files.');
    setStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000); // 5 min client timeout

      const res = await fetch('/api/admin/questions/parse-pdf', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse PDF');

      setJsonInput(JSON.stringify(data.questions, null, 2));
      setMessage(`PDF successfully parsed! ${data.questions.length} question(s) extracted. Review the JSON below and click Validate.`);
      setStatus('success');
    } catch (err: any) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out. The PDF may be too large — try splitting it into smaller parts and uploading again.'
        : err.message?.includes('overloaded') || err.message?.includes('temporarily')
          ? `${err.message} You can try uploading again in a few seconds.`
          : `AI Error: ${err.message}`;
      setMessage(msg);
      setStatus('error');
    } finally {
      setIsParsing(false);
      e.target.value = ''; // reset file input
    }
  };

  const validate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
      if (parsed.length === 0) throw new Error('Array is empty');

      for (let i = 0; i < parsed.length; i++) {
        const q = parsed[i];
        if (!q.question_text) throw new Error(`Question ${i + 1}: missing question_text`);
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Question ${i + 1}: needs at least 2 options`);
        }
        const hasCorrect = q.options.some((o: any) => o.is_correct);
        if (!hasCorrect) throw new Error(`Question ${i + 1}: no correct answer marked`);
      }

      setPreviewCount(parsed.length);
      setStatus('validating');
      setMessage(`✓ Valid JSON. ${parsed.length} question(s) ready to import.`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
      setPreviewCount(0);
    }
  };

  const handleImport = async () => {
    setStatus('importing');
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, questions: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setStatus('success');
      setMessage(`Successfully imported ${data.created} question(s).`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href={`/admin/exam/${examId}`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to Question Bank
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Bulk Import Questions</h1>
        <p className="text-sm text-slate-500 mb-6">Upload a PDF for AI extraction, or paste a JSON array directly.</p>

        {/* AI PDF Uploader */}
        <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-indigo-900 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Native AI PDF Extraction
            </h2>
            <p className="text-sm text-indigo-700/80">Upload a PDF exam dump. Our AI will automatically read and structure the questions into valid JSON below.</p>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePdfUpload}
              disabled={isParsing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button disabled={isParsing} className="h-10 px-5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isParsing ? 'Parsing PDF...' : 'Upload PDF'}
            </button>
          </div>
        </div>

        {/* Status banner */}
        {message && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 border
            ${status === 'error' ? 'bg-red-50 text-red-700 border-red-200' : ''}
            ${status === 'validating' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
            ${status === 'success' || (message.includes('PDF') && status !== 'error') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
            ${isParsing ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
          `}>
            {status === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {(status === 'success' && !isParsing) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {isParsing && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
            {message}
          </div>
        )}

        {/* JSON Input */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">JSON Input</span>
            <button
              type="button"
              onClick={() => setJsonInput(EXAMPLE_JSON)}
              className="text-[11px] text-brand-600 font-semibold hover:underline"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={e => { setJsonInput(e.target.value); setStatus('idle'); setMessage(''); }}
            rows={18}
            placeholder="Paste your JSON array here or upload a PDF above…"
            className="w-full px-4 py-3 text-sm font-mono bg-white focus:outline-none resize-y"
            spellCheck={false}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={validate}
            disabled={!jsonInput.trim() || isParsing}
            className="flex-1 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Validate JSON
          </button>
          <button
            onClick={handleImport}
            disabled={status !== 'validating' || isParsing}
            className="flex-1 h-11 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {status === 'importing' ? 'Importing…' : `Import ${previewCount} Question(s)`}
          </button>
        </div>

        {status === 'success' && !isParsing && previewCount > 0 && (
          <div className="mt-6 text-center">
            <button onClick={() => router.push(`/admin/exam/${examId}`)} className="text-sm text-brand-600 font-semibold hover:underline">
              ← Go to Question Bank
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
