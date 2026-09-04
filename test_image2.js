const http = require('http');

http.get('http://localhost:5001/api/fathers/66d3a4365775f0a07e46635a/image', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data.substring(0, 50)));
});
