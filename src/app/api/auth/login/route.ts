import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, resetTime } = rateLimit(ip, 10, 60 * 1000); // 10 attempts per minute
  if (!success) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Build the response and set the cookie on it
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
