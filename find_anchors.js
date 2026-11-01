const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') search(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes('<a ') && !l.includes('target="_blank"') && !l.includes('href="#') && !l.includes('href={`#')) {
          console.log(full + ':' + (idx+1) + ': ' + l.trim());
        }
      });
    }
  }
}
search('src');
