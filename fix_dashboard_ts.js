const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
code = code.replace(
  '{user.email}',
  '{user.email as string}'
);
fs.writeFileSync('src/app/dashboard/page.tsx', code);

let homeCode = fs.readFileSync('src/app/page.tsx', 'utf8');
homeCode = homeCode.replace(
  '{user.email}',
  '{user.email as string}'
);
fs.writeFileSync('src/app/page.tsx', homeCode);
