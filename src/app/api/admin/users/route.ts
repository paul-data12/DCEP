import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
  const admin = await getUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        entitlements: {
          include: { exam: { select: { code: true } } }
        },
        exam_attempts: {
          where: { is_submitted: true },
          orderBy: { end_time: 'desc' },
          select: {
            id: true,
            score: true,
            end_time: true,
            exam: { select: { code: true } }
          }
        }
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
