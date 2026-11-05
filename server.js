
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const PORT = 3001;
const STATIC_ROOT = __dirname;
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

const server = http.createServer(async (req, res) => {
  // Allow our frontend to communicate with this server
  res.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/apod") {
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    if (!startDate || !endDate) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Please provide both dates." }));
      return;
    }

    const apiKey = process.env.NASA_API_KEY;

    if (!apiKey) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "NASA API key is missing." }));
      return;
    }

    const nasaUrl = new URL("https://api.nasa.gov/planetary/apod");
    nasaUrl.searchParams.set("api_key", apiKey);
    nasaUrl.searchParams.set("start_date", startDate);
    nasaUrl.searchParams.set("end_date", endDate);

    try {
      const response = await fetch(nasaUrl);
      const rawData = await response.text();

console.log("NASA response status:", response.status);
console.log("NASA response body:", rawData.slice(0, 500));

const data = JSON.parse(rawData);

      res.writeHead(response.status, {
        "Content-Type": "application/json"
      });
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error("NASA request failed:", error);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unable to contact NASA." }));
    }

    return;
  }

  let pathname;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid URL path.");
    return;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.resolve(STATIC_ROOT, `.${pathname}`);
  const relativePath = path.relative(STATIC_ROOT, filePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden.");
    return;
  }

  if (
    relativePath !== "index.html" &&
    relativePath !== "style.css" &&
    !relativePath.startsWith(`js${path.sep}`) &&
    !relativePath.startsWith(`img${path.sep}`)
  ) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found.");
    return;
  }

  try {
    const rootRealPath = await fs.realpath(STATIC_ROOT);
    const realFilePath = await fs.realpath(filePath);
    const realRelativePath = path.relative(rootRealPath, realFilePath);

    if (
      realRelativePath === ".." ||
      realRelativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(realRelativePath)
    ) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden.");
      return;
    }

    const file = await fs.readFile(realFilePath);
    const contentType = MIME_TYPES[path.extname(realFilePath).toLowerCase()];

    if (!contentType) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found.");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found.");
      return;
    }

    console.error("Static file request failed:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Unable to serve file.");
  }
});

server.listen(PORT, () => {
  console.log(`NASA server running on port ${PORT}`);
});
