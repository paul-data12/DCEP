const fs = require('fs');
let code = fs.readFileSync('src/app/exam/[id]/take/ExamClient.tsx', 'utf8');

const newResultBlock = `
  if (phase === 'result' && result) {
    const passed = result.isPass;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Score header */}
          <div className={\`px-8 py-8 text-center shrink-0 \${passed ? 'bg-emerald-600' : 'bg-red-600'} text-white\`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
              <span className="text-3xl font-black">{result.score.toFixed(0)}%</span>
            </div>
            <h2 className="text-2xl font-bold">{passed ? 'Congratulations, You Passed!' : 'Exam Not Passed'}</h2>
            <p className="text-sm opacity-80 mt-1">{examTitle} — Full Exam Report</p>
          </div>

          {/* Diagnostic list */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50">
            {result.diagnostic.map((d: any, i: number) => {
              const q = questions.find(q => q.id === d.questionId);
              
              // Helper to render answers
              const renderAnswers = (optionIds: string[]) => {
                if (!q) return null;
                if (!optionIds || optionIds.length === 0) return <span className="text-slate-400 italic">No answer provided</span>;
                
                if (q.question_type === 'matrix' || q.question_type === 'drag_drop') {
                  return (
                    <ul className="list-disc pl-4 space-y-1">
                      {optionIds.map(sel => {
                        const [idx, optId] = sel.split(':');
                        const opt = q.options.find((o: any) => o.id === optId);
                        const meta = q.metadata ? JSON.parse(q.metadata) : {};
                        const rowText = (meta.rows || meta.dropZones || [])[parseInt(idx)] || \`Item \${idx}\`;
                        return <li key={sel}><strong>{rowText}:</strong> {opt?.option_text || optId}</li>;
                      })}
                    </ul>
                  );
                } else {
                  return (
                    <ul className="list-disc pl-4 space-y-1">
                      {optionIds.map(id => {
                        const opt = q.options.find((o: any) => o.id === id);
                        return <li key={id}>{opt?.option_text || id}</li>;
                      })}
                    </ul>
                  );
                }
              };

              return (
                <div key={d.questionId} className={\`bg-white rounded-xl border p-5 sm:p-6 shadow-sm \${d.isCorrect ? 'border-emerald-200' : 'border-red-200'}\`}>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                    {d.isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    }
                    <span className="text-sm font-bold text-slate-800">Question {i + 1}</span>
                    <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{d.domain}</span>
                  </div>
                  
                  {q && (
                    <div className="prose prose-sm prose-slate max-w-none mb-6 font-medium" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                  )}

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
                    <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{d.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-slate-200 bg-white text-center shrink-0">
            <button onClick={() => router.push('/')} className="h-11 px-8 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
`;

// Replace the result block
const startIdx = code.indexOf("if (phase === 'result' && result) {");
const endIdx = code.indexOf("if (questions.length === 0 || phase === 'starting') {");

if (startIdx !== -1 && endIdx !== -1) {
  // Grab the exact comments to preserve
  const loadingHeader = "/* ╔══════════════════════════════════════════════════════════════╗\n     ║  LOADING                                                   ║\n     ╚══════════════════════════════════════════════════════════════╝ */";
  
  const endSlice = code.substring(code.lastIndexOf("/* ╔", endIdx));
  
  code = code.substring(0, startIdx) + newResultBlock + "\n  " + endSlice;
  fs.writeFileSync('src/app/exam/[id]/take/ExamClient.tsx', code);
  console.log("Updated ExamClient.tsx");
} else {
  console.log("Could not find blocks");
}
