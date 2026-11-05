const http = require("node:http");

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NASA Space Explorer server is running!");
});

server.listen(PORT, () => {
  console.log(`NASA server running on port ${PORT}`);
});