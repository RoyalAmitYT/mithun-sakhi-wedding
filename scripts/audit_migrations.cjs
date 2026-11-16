const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

let total = 0;
let withSearchPath = 0;
let withoutSearchPath = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) continue; // Skip comments
    if (trimmed.includes('SECURITY DEFINER')) {
      total++;
      let hasSearchPath = false;
      let funcName = '';
      for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
        if (/CREATE (OR REPLACE )?FUNCTION/i.test(lines[j])) {
          funcName = lines[j].trim();
        }
        if (/SET search_path/i.test(lines[j])) {
          hasSearchPath = true;
        }
      }
      if (hasSearchPath) {
        withSearchPath++;
      } else {
        withoutSearchPath.push({ file, line: i + 1, funcName });
      }
    }
  }
}

console.log(`Total SECURITY DEFINER functions found: ${total}`);
console.log(`With explicit SET search_path: ${withSearchPath}`);
console.log(`Without explicit SET search_path: ${withoutSearchPath.length}`);
if (withoutSearchPath.length > 0) {
  console.log('Details of functions without search_path:');
  console.log(JSON.stringify(withoutSearchPath, null, 2));
}
