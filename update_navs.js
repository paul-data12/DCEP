const fs = require('fs');

// 1. admin/page.tsx
let admin = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
admin = admin.replace(
  /<div className="flex items-center gap-4 text-sm">([\s\S]*?)<\/div>/,
  '<div className="flex items-center gap-4 text-sm">\n              <span className="text-white font-medium border-b-2 border-brand-500 py-4">Questions</span>\n              <Link href="/admin/codes" className="text-slate-400 hover:text-white transition-colors">Access Codes</Link>\n              <Link href="/admin/users" className="text-slate-400 hover:text-white transition-colors">Users & Scores</Link>\n            </div>'
);
fs.writeFileSync('src/app/admin/page.tsx', admin);

// 2. admin/codes/page.tsx
let codes = fs.readFileSync('src/app/admin/codes/page.tsx', 'utf8');
codes = codes.replace(
  /<div className="flex items-center gap-4 text-sm">([\s\S]*?)<\/div>/,
  '<div className="flex items-center gap-4 text-sm">\n              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">Questions</Link>\n              <span className="text-white font-medium border-b-2 border-brand-500 py-4">Access Codes</span>\n              <Link href="/admin/users" className="text-slate-400 hover:text-white transition-colors">Users & Scores</Link>\n            </div>'
);
fs.writeFileSync('src/app/admin/codes/page.tsx', codes);
