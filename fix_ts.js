const fs = require('fs');

// 1. Fix start route TS error
let startCode = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');
startCode = startCode.replace(
  'user_id: user.id,',
  'user_id: user.id as string,'
);
fs.writeFileSync('src/app/api/exams/start/route.ts', startCode);

// 2. Fix submit route include and types
let submitCode = fs.readFileSync('src/app/api/exams/submit/route.ts', 'utf8');
submitCode = submitCode.replace(
  'include: {\n        exam: {\n          include: {\n            questions: {\n              include: { options: true }\n            }\n          }\n        }\n      }',
  'include: {\n        user_responses: true,\n        exam: {\n          include: {\n            questions: {\n              include: { options: true }\n            }\n          }\n        }\n      }'
);
submitCode = submitCode.replace(
  'const response = user_responses.find(r => r.question_id === question.id);',
  'const response = attempt.user_responses.find((r: any) => r.question_id === question.id);'
);
fs.writeFileSync('src/app/api/exams/submit/route.ts', submitCode);

