const fs = require('fs');
let code = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');

const accessCheck = `
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      const entitlement = await prisma.userEntitlement.findUnique({
        where: {
          user_id_exam_id: {
            user_id: user.id as string,
            exam_id: exam.id
          }
        }
      });
      
      if (!entitlement) {
        return NextResponse.json({ error: 'You do not have access to this exam. Please redeem an access code.' }, { status: 403 });
      }
    }
`;

code = code.replace(
  "    if (!exam) {\n      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });\n    }",
  accessCheck
);

fs.writeFileSync('src/app/api/exams/start/route.ts', code);
