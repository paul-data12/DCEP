const fs = require('fs');
let code = fs.readFileSync('src/app/api/exams/start/route.ts', 'utf8');
code = code.replace(/    \} else \{\n    \} else \{/, '    } else {');
fs.writeFileSync('src/app/api/exams/start/route.ts', code);
