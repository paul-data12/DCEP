const fs = require('fs');

// 1. Login
let loginCode = fs.readFileSync('src/app/api/auth/login/route.ts', 'utf8');
if (!loginCode.includes('import { rateLimit }')) {
  loginCode = loginCode.replace(
    "import { NextResponse } from 'next/server';",
    "import { NextResponse } from 'next/server';\nimport { rateLimit } from '@/lib/rate-limit';"
  );
  
  const loginLimiter = `
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, resetTime } = rateLimit(ip, 10, 60 * 1000); // 10 attempts per minute
  if (!success) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }
`;
  loginCode = loginCode.replace(
    "export async function POST(req: Request) {\n  try {\n",
    "export async function POST(req: Request) {\n  try {\n" + loginLimiter
  );
  fs.writeFileSync('src/app/api/auth/login/route.ts', loginCode);
}

// 2. Unlock code
let unlockCode = fs.readFileSync('src/app/api/user/unlock/route.ts', 'utf8');
if (!unlockCode.includes('import { rateLimit }')) {
  unlockCode = unlockCode.replace(
    "import { NextResponse } from 'next/server';",
    "import { NextResponse } from 'next/server';\nimport { rateLimit } from '@/lib/rate-limit';"
  );
  
  const unlockLimiter = `
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success, resetTime } = rateLimit(ip, 5, 60 * 1000); // 5 attempts per minute
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
`;
  unlockCode = unlockCode.replace(
    "export async function POST(req: Request) {\n  try {\n",
    "export async function POST(req: Request) {\n  try {\n" + unlockLimiter
  );
  fs.writeFileSync('src/app/api/user/unlock/route.ts', unlockCode);
}
