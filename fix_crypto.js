const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/codes/route.ts', 'utf8');

const newGen = `  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      code += chars.charAt(randomArray[0] % chars.length);
    }
    return code;
  };`;

code = code.replace(/  const generateCode = \(\) => \{[\s\S]*?  \};/, newGen);
fs.writeFileSync('src/app/api/admin/codes/route.ts', code);
