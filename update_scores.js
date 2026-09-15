const fs = require('fs');

// 1. ExamClient.tsx
let examClient = fs.readFileSync('src/app/exam/[id]/take/ExamClient.tsx', 'utf8');
examClient = examClient.replace(
  /<span className="text-3xl font-black">{result\.score\.toFixed\(0\)}%<\/span>/,
  '<span className="text-3xl font-black">{(result.score * 10).toFixed(0)}<span className="text-lg opacity-70"> / 1000</span></span>'
);
fs.writeFileSync('src/app/exam/[id]/take/ExamClient.tsx', examClient);

// 2. result/page.tsx
let resultPage = fs.readFileSync('src/app/exam/[id]/result/[attemptId]/page.tsx', 'utf8');
resultPage = resultPage.replace(
  /<span className="text-3xl font-black">{\(attempt\.score \|\| 0\)\.toFixed\(0\)}%<\/span>/,
  '<span className="text-3xl font-black">{((attempt.score || 0) * 10).toFixed(0)}<span className="text-lg opacity-70"> / 1000</span></span>'
);
fs.writeFileSync('src/app/exam/[id]/result/[attemptId]/page.tsx', resultPage);

// 3. page.tsx
let dashboard = fs.readFileSync('src/app/page.tsx', 'utf8');
dashboard = dashboard.replace(
  /{attempt\.score \? attempt\.score\.toFixed\(1\) : 0}%/,
  '{attempt.score ? (attempt.score * 10).toFixed(0) : 0} / 1000'
);
fs.writeFileSync('src/app/page.tsx', dashboard);
