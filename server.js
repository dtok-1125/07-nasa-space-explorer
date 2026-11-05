
const http = require("node:http");

const PORT = 3001;

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
      const data = await response.json();

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

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("NASA Space Explorer server is running!");
});

server.listen(PORT, () => {
  console.log(`NASA server running on port ${PORT}`);
});
