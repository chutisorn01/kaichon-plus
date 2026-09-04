import http from 'http';
http.get('http://localhost:5001/api/fathers/66d3a4365775f0a07e46635a/image', (res) => {
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data.substring(0, 100)));
});
