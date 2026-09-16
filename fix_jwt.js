const fs = require('fs');

let authCode = fs.readFileSync('src/lib/auth.ts', 'utf8');
authCode = authCode.replace(
  "const secretKey = process.env.JWT_SECRET || 'super-secret-development-key';",
  "const secretKey = process.env.JWT_SECRET || 'fallback-key-do-not-use-in-prod';\nif (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) { console.warn('CRITICAL: JWT_SECRET is not set in production!'); }"
);
fs.writeFileSync('src/lib/auth.ts', authCode);

let middlewareCode = fs.readFileSync('src/middleware.ts', 'utf8');
middlewareCode = middlewareCode.replace(
  "const secretKey = process.env.JWT_SECRET || 'super-secret-development-key';",
  "const secretKey = process.env.JWT_SECRET || 'fallback-key-do-not-use-in-prod';\nif (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) { console.warn('CRITICAL: JWT_SECRET is not set in production!'); }"
);
fs.writeFileSync('src/middleware.ts', middlewareCode);

