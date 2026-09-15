import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Find the code
    const accessCode = await prisma.accessCode.findUnique({
      where: { code }
    });

    if (!accessCode) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 400 });
    }

    if (accessCode.is_used) {
      return NextResponse.json({ error: 'This access code has already been used' }, { status: 400 });
    }

    // Use a transaction to mark the code as used and create the entitlement
    await prisma.$transaction([
      prisma.accessCode.update({
        where: { id: accessCode.id },
        data: {
          is_used: true,
          used_by_id: user.id as string,
          used_at: new Date()
        }
      }),
      prisma.userEntitlement.upsert({
        where: {
          user_id_exam_id: {
            user_id: user.id as string,
            exam_id: accessCode.exam_id
          }
        },
        create: {
          user_id: user.id as string,
          exam_id: accessCode.exam_id
        },
        update: {} // Do nothing if they already have it
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlocking exam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
