import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/questions/bulk — Bulk import questions
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { examId, questions } = body;

    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'examId and a non-empty questions array are required' }, { status: 400 });
    }

    // Validate exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Create all questions in a transaction
    const created = await prisma.$transaction(
      questions.map((q: any) =>
        prisma.question.create({
          data: {
            exam_id: examId,
            case_study_id: q.case_study_id || null, // Optional case study association
            domain_topic: q.domain_topic || null,
            question_type: q.question_type || 'single_choice', // Can now be drag_drop, matrix, etc.
            question_text: q.question_text,
            explanation: q.explanation || '',
            source: q.source || null,
            is_verified: q.is_verified ?? false,
            media_url: q.media_url || null,         // Support for images
            metadata: q.metadata ? JSON.stringify(q.metadata) : null, // Complex UI config
            options: {
              create: (q.options || []).map((o: any) => ({
                option_text: o.option_text,
                is_correct: o.is_correct ?? false,
              })),
            },
          },
        })
      )
    );

    return NextResponse.json({ created: created.length }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/questions/bulk error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
