import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, questionIds } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: 'attemptId is required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        user_responses: true
      }
    });

    if (!attempt || attempt.is_submitted) {
      return NextResponse.json({ error: 'Invalid or already submitted attempt' }, { status: 400 });
    }

    const { exam, user_responses } = attempt;

    // We only score the questions that were actually presented in this attempt
    const testQuestions = questionIds 
      ? questionIds.map((id: string) => exam.questions.find(q => q.id === id)).filter(Boolean)
      : exam.questions; // fallback if questionIds not provided

    let correctCount = 0;
    const diagnostic = [];

    for (const question of testQuestions) {
      const response = user_responses.find(r => r.question_id === question.id);
      const correctOptionIds = question.options.filter((o: any) => o.is_correct).map((o: any) => o.id);
      
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

      if (isCorrect) correctCount++;

      diagnostic.push({
        questionId: question.id,
        domain: question.domain_topic,
        isCorrect,
        correctOptionIds,
        selectedOptionIds,
        explanation: question.explanation
      });
    }

    const scorePercentage = (correctCount / (testQuestions.length || 1)) * 100;
    const isPass = scorePercentage >= exam.passing_score;

    // Update attempt
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        is_submitted: true,
        end_time: new Date(),
        score: scorePercentage,
      }
    });

    return NextResponse.json({
      score: scorePercentage,
      isPass,
      diagnostic
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
