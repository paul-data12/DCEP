const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

code = code.replace(
  "import LogoutButton from '@/app/components/LogoutButton';",
  "import LogoutButton from '@/app/components/LogoutButton';\nimport UnlockExamForm from '@/app/components/UnlockExamForm';\nimport { prisma } from '@/lib/prisma';"
);

const fetchLogic = `
  let entitledExamCodes: string[] = [];
  let pastAttempts: any[] = [];
  
  if (user) {
    if (user.role === 'admin') {
      const allExams = await prisma.exam.findMany();
      entitledExamCodes = allExams.map(e => e.code);
    } else {
      const entitlements = await prisma.userEntitlement.findMany({
        where: { user_id: user.id as string },
        include: { exam: true }
      });
      entitledExamCodes = entitlements.map(e => e.exam.code);
    }
    
    pastAttempts = await prisma.examAttempt.findMany({
      where: { user_id: user.id as string, is_submitted: true },
      include: { exam: true },
      orderBy: { end_time: 'desc' },
      take: 5
    });
  }
`;

code = code.replace(
  "export default async function Home() {\n  const user = await getUser();",
  "export default async function Home() {\n  const user = await getUser();\n" + fetchLogic
);

code = code.replace(
  "{/* ── Features ─────────────────────────────────────── */}",
  `{/* ── Dashboard Content (If Logged In) ─────────────── */}
      {user && (
        <section className="relative py-12 max-w-6xl mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <UnlockExamForm />
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Exam Attempts</h3>
              {pastAttempts.length === 0 ? (
                <p className="text-sm text-slate-500">You haven't completed any exams yet.</p>
              ) : (
                <div className="space-y-3">
                  {pastAttempts.map(attempt => (
                    <Link href={\`/exam/\${attempt.exam.code}/result/\${attempt.id}\`} key={attempt.id} className="block group">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 group-hover:border-indigo-200 group-hover:bg-indigo-50/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{attempt.exam.code}</p>
                          <p className="text-xs text-slate-500">{new Date(attempt.end_time).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={\`text-sm font-bold \${attempt.score >= attempt.exam.passing_score ? 'text-emerald-600' : 'text-rose-600'}\`}>
                            {attempt.score ? attempt.score.toFixed(1) : 0}%
                          </p>
                          <p className="text-xs text-slate-500">Score</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ─────────────────────────────────────── */}`
);

// Update exam logic
code = code.replace(
  "const Icon = exam.icon;\n              return (",
  "const Icon = exam.icon;\n              const isUnlocked = user ? entitledExamCodes.includes(exam.code) : exam.available;\n              return ("
);

code = code.replace(
  /\${exam\.available/g,
  "${isUnlocked"
);

code = code.replace(
  /exam\.available \?/g,
  "isUnlocked ?"
);

fs.writeFileSync('src/app/page.tsx', code);
