const fs = require('fs');
let code = fs.readFileSync('src/app/admin/users/page.tsx', 'utf8');
code = code.replace(/\\`/g, '`');
fs.writeFileSync('src/app/admin/users/page.tsx', code);
