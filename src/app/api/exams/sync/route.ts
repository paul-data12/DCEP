import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId, questionId, selectedOptionIds, isFlagged } = await req.json();

if (!attemptId || !questionId) {
      return NextResponse.json({ error: 'attemptId and questionId are required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true }
    });

    if (!attempt || attempt.is_submitted || attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized or already submitted' }, { status: 403 });
    }

    const elapsedMinutes = (Date.now() - attempt.start_time.getTime()) / 60000;
    if (elapsedMinutes > attempt.exam.duration_minutes + 2) {
      return NextResponse.json({ error: 'Exam time expired' }, { status: 400 });
    }

    // Upsert user response
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        attempt_id: attemptId,
        question_id: questionId,
      }
    });

    if (existingResponse) {
      await prisma.userResponse.update({
        where: { id: existingResponse.id },
        data: {
          selected_option_ids: JSON.stringify(selectedOptionIds || []),
          is_flagged: isFlagged !== undefined ? isFlagged : existingResponse.is_flagged,
        }
      });
    } else {
      await prisma.userResponse.create({
        data: {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_ids: JSON.stringify(selectedOptionIds || []),
          is_flagged: isFlagged || false,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing exam progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
