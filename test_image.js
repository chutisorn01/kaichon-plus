const http = require('http');

http.get('http://localhost:5001/api/fathers', {
  headers: {
    // We need a token.
    // Actually, I can just check the backend logs.
  }
}, (res) => {
  console.log(res.statusCode);
});
