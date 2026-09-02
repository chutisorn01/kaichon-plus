const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/admin/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};
// I need a token to do this...
