const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf8');

const dp600 = `  {
    code: 'DP-600',
    name: 'Fabric (DP-600)',
    full: 'Microsoft Certified: Fabric Analytics Engineer Associate',
    desc: 'Plan, implement, and manage data analytics solutions in Microsoft Fabric. Covers data ingestion, transformation, and modeling.',
    icon: Database,
    available: true,
    questions: '50',
    duration: '100',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    ringColor: 'ring-blue-100',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badgeText: 'Live',
    accentHover: 'group-hover:border-blue-200 group-hover:shadow-lg group-hover:shadow-blue-100/50',
  },
`;

page = page.replace(
  /const exams = \[/,
  'const exams = [\n' + dp600
);

fs.writeFileSync('src/app/page.tsx', page);
