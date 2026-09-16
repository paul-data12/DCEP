const fs = require('fs');

// 1. Fix start route (prevent multiple unsubmitted attempts)
let startCode = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');
const attemptCreation = `
    // Delete any existing unsubmitted attempts for this user and exam to prevent simultaneous attempt harvesting
    await prisma.examAttempt.deleteMany({
      where: {
        user_id: user.id,
        exam_id: exam.id,
        is_submitted: false,
      }
    });

    // Create an exam attempt
    const attempt = await prisma.examAttempt.create({`;
startCode = startCode.replace('    // Create an exam attempt\n    const attempt = await prisma.examAttempt.create({', attemptCreation);
fs.writeFileSync('src/app/api/exams/start/route.ts', startCode);


// 2. Fix submit route (ownership + time enforcement)
let submitCode = fs.readFileSync('src/app/api/exams/submit/route.ts', 'utf8');

const submitCheck = `
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: { options: true }
            }
          }
        }
      }
    });

    if (!attempt || attempt.is_submitted) {
      return NextResponse.json({ error: 'Invalid or already submitted attempt' }, { status: 400 });
    }

    if (attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Time enforcement (with 2 min grace period for network delays)
    const elapsedMinutes = (Date.now() - attempt.start_time.getTime()) / 60000;
    if (elapsedMinutes > attempt.exam.duration_minutes + 2) {
      return NextResponse.json({ error: 'Exam time expired' }, { status: 400 });
    }
`;
submitCode = submitCode.replace(/    const attempt = await prisma\.examAttempt\.findUnique\(\{[\s\S]*?    \}\);\n\n    if \(\!attempt \|\| attempt\.is_submitted\) \{\n      return NextResponse\.json\(\{ error: 'Invalid or already submitted attempt' \}, \{ status: 400 \}\);\n    \}/, submitCheck.trim());
fs.writeFileSync('src/app/api/exams/submit/route.ts', submitCode);


// 3. Fix sync route (ownership + time enforcement)
let syncCode = fs.readFileSync('src/app/api/exams/sync/route.ts', 'utf8');
const syncCheck = `
    if (!attemptId || !questionId) {
      return NextResponse.json({ error: 'attemptId and questionId are required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true }
    });

    if (!attempt || attempt.is_submitted || attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized or already submitted' }, { status: 403 });
    }

    const elapsedMinutes = (Date.now() - attempt.start_time.getTime()) / 60000;
    if (elapsedMinutes > attempt.exam.duration_minutes + 2) {
      return NextResponse.json({ error: 'Exam time expired' }, { status: 400 });
    }
`;
syncCode = syncCode.replace(/    if \(\!attemptId \|\| \!questionId\) \{\n      return NextResponse\.json\(\{ error: 'attemptId and questionId are required' \}, \{ status: 400 \}\);\n    \}/, syncCheck.trim());
fs.writeFileSync('src/app/api/exams/sync/route.ts', syncCode);

