const httpServer = require('http-server');
const server = httpServer.createServer({ root: './main' });
let isServerRunning = false;

server.listen(8080, () => {
  isServerRunning = true;
  console.log('Server is running on port 8080');
  console.log('Build Successful!');
});

setTimeout(() => {
  if (isServerRunning) {
    server.close(() => {
      console.log('Server stopped after 5 seconds');
    });
  }
}, 5000);