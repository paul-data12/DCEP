import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/questions/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ question });
  } catch (error) {
    console.error('GET /api/admin/questions/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/questions/[id] — Update question + replace options
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { domain_topic, question_type, question_text, explanation, source, is_verified, options } = body;

    // Transaction: delete old options, update question, create new options
    const updated = await prisma.$transaction(async (tx) => {
      await tx.option.deleteMany({ where: { question_id: id } });

      return tx.question.update({
        where: { id },
        data: {
          ...(domain_topic !== undefined && { domain_topic }),
          ...(question_type !== undefined && { question_type }),
          ...(question_text !== undefined && { question_text }),
          ...(explanation !== undefined && { explanation }),
          ...(source !== undefined && { source }),
          ...(is_verified !== undefined && { is_verified }),
          ...(options && {
            options: {
              create: options.map((o: any) => ({
                option_text: o.option_text,
                is_correct: o.is_correct ?? false,
              })),
            },
          }),
        },
        include: { options: true },
      });
    });

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error('PUT /api/admin/questions/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/questions/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.option.deleteMany({ where: { question_id: id } });
      await tx.question.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/questions/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
