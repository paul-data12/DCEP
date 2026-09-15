const fs = require('fs');

let code = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');

const dp600Logic = `
    } else if (exam.code === 'DP-600') {
      const qMaintain = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Maintain and Administer Solutions'));
      const qPrepare = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Prepare and Transform Data'));
      const qModels = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Implement and Manage Semantic Models'));

      const targetMaintain = Math.round(exam.total_questions * 0.28);
      const targetPrepare = Math.round(exam.total_questions * 0.47);
      const targetModels = exam.total_questions - targetMaintain - targetPrepare;

      selected.push(...qMaintain.slice(0, targetMaintain));
      selected.push(...qPrepare.slice(0, targetPrepare));
      selected.push(...qModels.slice(0, targetModels));

      if (selected.length < exam.total_questions) {
         const remainingNeeded = exam.total_questions - selected.length;
         const remainingPool = shuffle(allVerifiedQuestions.filter((q: any) => !selected.find(s => s.id === q.id)));
         selected.push(...remainingPool.slice(0, remainingNeeded));
      }
      
      selected = shuffle(selected);
      
      // Sort so case studies are at the beginning
      selected.sort((a, b) => {
        if (a.case_study_id && !b.case_study_id) return -1;
        if (!a.case_study_id && b.case_study_id) return 1;
        if (a.case_study_id && b.case_study_id) {
          return a.case_study_id.localeCompare(b.case_study_id);
        }
        return 0;
      });
    } else {
`;

code = code.replace(
  /    \} else \{/g,
  dp600Logic
);

fs.writeFileSync('src/app/api/exams/start/route.ts', code);
