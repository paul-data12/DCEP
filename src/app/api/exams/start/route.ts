import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: 'examId is required' }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Fetch only verified questions
    const allVerifiedQuestions = await prisma.question.findMany({
      where: { exam_id: examId, is_verified: true },
      include: {
        options: {
          select: {
            id: true,
            option_text: true,
            // Do not return is_correct!
          }
        },
        case_study: true,
      }
    });

    if (allVerifiedQuestions.length === 0) {
      return NextResponse.json({ error: 'No verified questions available for this exam' }, { status: 400 });
    }

    // Fisher-Yates shuffle for uniform randomization
    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    let selected: any[] = [];

    // Custom Domain Distribution for PL-300 / Data Analyst
    if (exam.title.includes('Data Analyst') || exam.title.includes('PL-300')) {
      const dataPrep = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Data Preparation'));
      const dataModel = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Data Modeling' || q.domain_topic === 'DAX'));
      const dataViz = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Visuals & Reports'));
      const assetMgmt = shuffle(allVerifiedQuestions.filter((q: any) => q.domain_topic === 'Asset Management'));

      // 28% Prep, 28% Model, 28% Viz, 16% Deploy
      const targetPrep = Math.round(exam.total_questions * 0.28);
      const targetModel = Math.round(exam.total_questions * 0.28);
      const targetViz = Math.round(exam.total_questions * 0.28);
      const targetAsset = exam.total_questions - targetPrep - targetModel - targetViz; // exact remainder

      selected.push(...dataPrep.slice(0, targetPrep));
      selected.push(...dataModel.slice(0, targetModel));
      selected.push(...dataViz.slice(0, targetViz));
      selected.push(...assetMgmt.slice(0, targetAsset));

      // Fallback: If we fell short because a specific bucket didn't have enough questions, fill randomly
      if (selected.length < exam.total_questions) {
         const remainingNeeded = exam.total_questions - selected.length;
         const remainingPool = shuffle(allVerifiedQuestions.filter((q: any) => !selected.find(s => s.id === q.id)));
         selected.push(...remainingPool.slice(0, remainingNeeded));
      }
      
      // Shuffle the final selection so domains aren't grouped sequentially in the UI
      selected = shuffle(selected);
    } else {
      // Standard random distribution for other exams
      const shuffled = shuffle(allVerifiedQuestions);
      selected = shuffled.slice(0, Math.min(exam.total_questions, shuffled.length));
    }

    // Also shuffle options within each question
    const randomizedQuestions = selected.map(q => ({
      ...q,
      options: shuffle(q.options),
    }));

    // Create an exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        exam_id: exam.id,
        user_id: user.id as string,
      }
    });

    return NextResponse.json({
      attemptId: attempt.id,
      exam: {
        ...exam,
        questions: randomizedQuestions,
      }
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
