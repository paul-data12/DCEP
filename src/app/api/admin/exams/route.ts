import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/exams — List all exams with question counts
export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { title: 'asc' },
    });

    // Also get verified counts
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const verifiedCount = await prisma.question.count({
          where: { exam_id: exam.id, is_verified: true },
        });
        return {
          ...exam,
          questionCount: exam._count.questions,
          verifiedCount,
        };
      })
    );

    return NextResponse.json({ exams: examsWithStats });
  } catch (error) {
    console.error('GET /api/admin/exams error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
