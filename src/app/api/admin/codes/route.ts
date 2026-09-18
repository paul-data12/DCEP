import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const codes = await prisma.accessCode.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      exam: { select: { title: true, code: true } },
      used_by: { select: { email: true } }
    }
  });

  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { examId, count } = await req.json();
  
  if (!examId || !count || count < 1 || count > 100) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      code += chars.charAt(randomArray[0] % chars.length);
    }
    return code;
  };

  const codesToCreate = Array.from({ length: count }).map(() => ({
    exam_id: examId,
    code: generateCode()
  }));

  await prisma.accessCode.createMany({
    data: codesToCreate,
    
  });

  return NextResponse.json({ success: true });
}
