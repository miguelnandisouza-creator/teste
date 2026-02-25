const fs = require('fs');
const s = fs.readFileSync('src/server.js','utf8');
const counts = {
  backticks: (s.match(/`/g)||[]).length,
  singleQuotes: (s.match(/'/g)||[]).length,
  doubleQuotes: (s.match(/"/g)||[]).length,
  parensOpen: (s.match(/\(/g)||[]).length,
  parensClose: (s.match(/\)/g)||[]).length,
  bracesOpen: (s.match(/{/g)||[]).length,
  bracesClose: (s.match(/}/g)||[]).length,
  bracketsOpen: (s.match(/\[/g)||[]).length,
  bracketsClose: (s.match(/\]/g)||[]).length,
};
console.log(counts);
// show last 200 chars to inspect tail
console.log('\n--- tail(400) ---\n');
console.log(s.slice(-400));
