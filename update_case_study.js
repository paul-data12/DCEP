const fs = require('fs');
let code = fs.readFileSync('src/app/exam/[id]/take/ExamClient.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [mobileNavOpen, setMobileNavOpen] = useState(false);',
  'const [mobileNavOpen, setMobileNavOpen] = useState(false);\n  const [seenCaseStudies, setSeenCaseStudies] = useState<string[]>([]);'
);

// 2. Add Intro Screen Logic
const introLogic = `
  const currentQ = questions[currentIndex];
  const currentR = responses[currentQ.id] || { selected: [], flagged: false };
  const isMulti = currentQ.question_type === 'multi_select';
  const answeredCount = questions.filter(q => responses[q.id]?.selected?.length > 0).length;

  const isNewCaseStudy = currentQ.case_study && !seenCaseStudies.includes(currentQ.case_study.id);
  
  if (isNewCaseStudy) {
     return (
       <div className="h-screen bg-slate-100 flex flex-col p-4 sm:p-8">
         <div className="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden h-full">
            <div className="bg-slate-900 text-white px-8 py-6 shrink-0 flex flex-col gap-2">
               <span className="text-brand-400 font-bold uppercase tracking-wider text-xs">Scenario Overview</span>
               <h2 className="text-2xl font-bold">{currentQ.case_study.title}</h2>
               <p className="text-sm text-slate-400 mt-1">Please read the following information carefully before proceeding. You can refer back to it during the related questions.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
               <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm prose prose-slate max-w-none prose-h3:text-slate-800 prose-h3:border-b prose-h3:pb-2 prose-h3:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentQ.case_study.content || '' }} />
            </div>
            <div className="p-6 border-t border-slate-200 bg-white shrink-0 flex justify-end">
               <button 
                  onClick={() => setSeenCaseStudies([...seenCaseStudies, currentQ.case_study.id])}
                  className="px-10 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-95"
               >
                 Proceed to Questions
               </button>
            </div>
         </div>
       </div>
     );
  }
`;

code = code.replace(
  /const currentQ = questions\[currentIndex\];[\s\S]*?const answeredCount = questions\.filter\(q => responses\[q\.id\]\?\.selected\?\.length > 0\)\.length;/,
  introLogic.trim()
);

// 3. Ensure the side-panel case study also uses dangerouslySetInnerHTML
code = code.replace(
  /<div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">\s*\{currentQ\.case_study\.content\}\s*<\/div>/,
  '<div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: currentQ.case_study.content || \'\' }} />'
);

fs.writeFileSync('src/app/exam/[id]/take/ExamClient.tsx', code);
