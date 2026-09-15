const fs = require('fs');

let code = fs.readFileSync('src/app/exam/[id]/take/ExamClient.tsx', 'utf8');

if (!code.includes('import { marked } from \'marked\'')) {
  code = code.replace(
    'import { useRouter } from \'next/navigation\';',
    'import { useRouter } from \'next/navigation\';\nimport { marked } from \'marked\';'
  );
}

// Replace dangerouslySetInnerHTML for Intro Screen
code = code.replace(
  'dangerouslySetInnerHTML={{ __html: currentQ.case_study.content || \'\' }}',
  'dangerouslySetInnerHTML={{ __html: marked.parse(currentQ.case_study.content || \'\') as string }}'
);

// Replace dangerouslySetInnerHTML for Side Panel
code = code.replace(
  'dangerouslySetInnerHTML={{ __html: currentQ.case_study.content || \'\' }}',
  'dangerouslySetInnerHTML={{ __html: marked.parse(currentQ.case_study.content || \'\') as string }}'
);

fs.writeFileSync('src/app/exam/[id]/take/ExamClient.tsx', code);
