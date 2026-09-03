import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.question.findMany();
  console.log(`Found ${questions.length} questions.`);

  let qUpdated = 0;
  for (const q of questions) {
    const newText = q.question_text.replace(/\[cite:\s*\d+\]/g, '').trim();
    const newExp = q.explanation.replace(/\[cite:\s*\d+\]/g, '').trim();
    
    if (newText !== q.question_text || newExp !== q.explanation) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          question_text: newText,
          explanation: newExp
        }
      });
      qUpdated++;
    }
  }

  const options = await prisma.option.findMany();
  console.log(`Found ${options.length} options.`);

  let oUpdated = 0;
  for (const o of options) {
    const newText = o.option_text.replace(/\[cite:\s*\d+\]/g, '').trim();
    if (newText !== o.option_text) {
      await prisma.option.update({
        where: { id: o.id },
        data: {
          option_text: newText
        }
      });
      oUpdated++;
    }
  }

  console.log(`Updated ${qUpdated} questions and ${oUpdated} options to remove cite tags.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
