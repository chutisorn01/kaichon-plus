const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('frontend/src');
let changedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  // Replace string literals like 'http://localhost:5001...' with template literals
  content = content.replace(/['"]http:\/\/localhost:5001([^'"]*)['"]/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Replace inside existing template literals like `http://localhost:5001...`
  content = content.replace(/http:\/\/localhost:5001/g, '${import.meta.env.VITE_API_URL}');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
});
console.log('Modified files:', changedCount);
