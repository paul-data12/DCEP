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
