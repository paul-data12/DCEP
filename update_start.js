const fs = require('fs');

let code = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');

const newDp600Logic = `
    } else if (exam.code === 'DP-600') {
      const targetMaintain = Math.round(exam.total_questions * 0.28);
      const targetPrepare = Math.round(exam.total_questions * 0.47);
      const targetModels = exam.total_questions - targetMaintain - targetPrepare;

      // 1. Pick exactly 1 case study
      const caseStudyIds = [...new Set(allVerifiedQuestions.filter((q: any) => q.case_study_id).map((q: any) => q.case_study_id))];
      let pickedCsQuestions = [];
      if (caseStudyIds.length > 0) {
        const pickedCsId = shuffle(caseStudyIds)[0];
        const csQuestions = shuffle(allVerifiedQuestions.filter((q: any) => q.case_study_id === pickedCsId));
        pickedCsQuestions = csQuestions.slice(0, 5); // Take up to 5 questions
      }

      selected.push(...pickedCsQuestions);

      // 2. Calculate remaining quotas per domain
      const remainingMaintain = Math.max(0, targetMaintain - selected.filter((q: any) => q.domain_topic === 'Maintain and Administer Solutions').length);
      const remainingPrepare = Math.max(0, targetPrepare - selected.filter((q: any) => q.domain_topic === 'Prepare and Transform Data').length);
      const remainingModels = Math.max(0, targetModels - selected.filter((q: any) => q.domain_topic === 'Implement and Manage Semantic Models').length);

      // 3. Pool of standalone questions (no case study)
      const standalone = allVerifiedQuestions.filter((q: any) => !q.case_study_id);

      const qMaintain = shuffle(standalone.filter((q: any) => q.domain_topic === 'Maintain and Administer Solutions'));
      const qPrepare = shuffle(standalone.filter((q: any) => q.domain_topic === 'Prepare and Transform Data'));
      const qModels = shuffle(standalone.filter((q: any) => q.domain_topic === 'Implement and Manage Semantic Models'));

      selected.push(...qMaintain.slice(0, remainingMaintain));
      selected.push(...qPrepare.slice(0, remainingPrepare));
      selected.push(...qModels.slice(0, remainingModels));

      // 4. Fill any gaps if we fell short
      if (selected.length < exam.total_questions) {
         const remainingNeeded = exam.total_questions - selected.length;
         const remainingPool = shuffle(standalone.filter((q: any) => !selected.find((s: any) => s.id === q.id)));
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
  /    \} else if \(exam\.code === 'DP-600'\) \{[\s\S]*?    \} else \{/,
  newDp600Logic.trim() + '\n    } else {'
);

fs.writeFileSync('src/app/api/exams/start/route.ts', code);
