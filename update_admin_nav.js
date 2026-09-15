const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const newNav = `
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="text-sm font-bold tracking-tight">DCEP Admin</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white font-medium border-b-2 border-brand-500 py-4">Questions</span>
              <Link href="/admin/codes" className="text-slate-400 hover:text-white transition-colors">Access Codes</Link>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to Site</Link>
        </div>
      </nav>
`;

// Replace the old nav block
code = code.replace(
  /<nav className="sticky top-0 z-50 bg-slate-900 text-white">[\s\S]*?<\/nav>/m,
  newNav.trim()
);

fs.writeFileSync('src/app/admin/page.tsx', code);
