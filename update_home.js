const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const navCode = `          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="font-medium text-brand-600 hover:text-brand-700 mr-2">Dashboard</Link>
                <span className="font-medium text-slate-700 hidden sm:block">{user.email}</span>
                <LogoutButton />
              </>
            ) : (`;
            
code = code.replace(/          <div className="flex items-center gap-4 text-sm">\n            \{user \? \(\n              <>\n                <span className="font-medium text-slate-700 hidden sm:block">\{user\.email\}<\/span>\n                <LogoutButton \/>\n              <\/>\n            \) : \(/, navCode);

fs.writeFileSync('src/app/page.tsx', code);
