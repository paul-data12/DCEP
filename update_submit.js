const fs = require('fs');
let code = fs.readFileSync('src/app/api/exams/submit/route.ts', 'utf8');

const updatedLogic = `
      let correctOptionIds = question.options.filter((o: any) => o.is_correct).map((o: any) => o.id);
      
      let selectedOptionIds: string[] = [];
      if (response && response.selected_option_ids) {
        try {
          selectedOptionIds = JSON.parse(response.selected_option_ids);
        } catch (e) {
          // ignore parsing error
        }
      }

      let isCorrect = false;

      if (question.question_type === 'matrix' || question.question_type === 'drag_drop') {
         const meta = question.metadata ? JSON.parse(question.metadata) : {};
         const correctMapping = meta.correct_mapping || {};
         const requiredKeys = Object.keys(correctMapping);
         
         // Generate complex correctOptionIds for frontend rendering (e.g. "0:opt_id", "1:opt_id")
         correctOptionIds = requiredKeys.map((idx) => {
            const opt = question.options.find((o: any) => o.option_text === correctMapping[idx]);
            return opt ? \`\${idx}:\${opt.id}\` : null;
         }).filter(Boolean);

         if (requiredKeys.length > 0 && selectedOptionIds.length === requiredKeys.length) {
            isCorrect = selectedOptionIds.every((sel: string) => {
               const [idx, optId] = sel.split(':');
               const selectedOpt = question.options.find((o: any) => o.id === optId);
               if (!selectedOpt) return false;
               return correctMapping[idx] === selectedOpt.option_text;
            });
         }
      } else {
         // Check if selected options match correct options exactly for standard questions
         isCorrect = 
           correctOptionIds.length > 0 &&
           correctOptionIds.length === selectedOptionIds.length &&
           correctOptionIds.every((id: string) => selectedOptionIds.includes(id));
      }
`;

code = code.replace(
  /const correctOptionIds = question\.options\.filter.*?\/\/ Check if selected options match correct options exactly for standard questions\s*isCorrect =[\s\S]*?correctOptionIds\.every\(\(id: string\) => selectedOptionIds\.includes\(id\)\);\s*}/m,
  updatedLogic.trim()
);

fs.writeFileSync('src/app/api/exams/submit/route.ts', code);
