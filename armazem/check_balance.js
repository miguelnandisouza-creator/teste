const fs = require('fs');
const s = fs.readFileSync('src/server.js','utf8');
const lines = s.split(/\r?\n/);
let balance = 0;
let maxBalance = 0;
let maxLine = 0;
for (let i=0;i<lines.length;i++){
  const line = lines[i];
  for (const ch of line){
    if (ch === '{') balance++;
    if (ch === '}') balance--;
  }
  if (balance > maxBalance){ maxBalance = balance; maxLine = i+1; }
}
console.log({totalLines: lines.length, finalBalance: balance, maxBalance, maxLine});
console.log('\n--- context around maxLine ---\n');
const start = Math.max(0, maxLine-5);
const end = Math.min(lines.length, maxLine+5);
for (let i=start;i<end;i++){
  console.log(`${i+1}: ${lines[i]}`);
}
