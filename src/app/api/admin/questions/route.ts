import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/questions?examId=...&verified=true&domain=...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const examId = url.searchParams.get('examId');
    if (!examId) {
      return NextResponse.json({ error: 'examId query param is required' }, { status: 400 });
    }

    const verified = url.searchParams.get('verified');
    const domain = url.searchParams.get('domain');

    const where: any = { exam_id: examId };
    if (verified === 'true') where.is_verified = true;
    if (verified === 'false') where.is_verified = false;
    if (domain) where.domain_topic = domain;

    const questions = await prisma.question.findMany({
      where,
      include: {
        _count: { select: { options: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('GET /api/admin/questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/questions — Create a single question with options
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { examId, domain_topic, question_type, question_text, explanation, source, is_verified, options } = body;

    if (!examId || !question_text || !explanation || !options?.length) {
      return NextResponse.json({ error: 'examId, question_text, explanation, and options are required' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        exam_id: examId,
        domain_topic: domain_topic || null,
        question_type: question_type || 'single_choice',
        question_text,
        explanation,
        source: source || null,
        is_verified: is_verified ?? false,
        options: {
          create: options.map((o: any) => ({
            option_text: o.option_text,
            is_correct: o.is_correct ?? false,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
