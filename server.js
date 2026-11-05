
const http = require("node:http");

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url.startsWith("/api/apod")) {
    try {
      const url = new URL(req.url, "http://localhost");

      const startDate = url.searchParams.get("start_date");
      const endDate = url.searchParams.get("end_date");

      const nasaUrl = new URL(
        "https://api.nasa.gov/planetary/apod"
      );

      nasaUrl.searchParams.set(
        "api_key",
        process.env.NASA_API_KEY
      );

      if (startDate) {
        nasaUrl.searchParams.set("start_date", startDate);
      }

      if (endDate) {
        nasaUrl.searchParams.set("end_date", endDate);
      }

      const response = await fetch(nasaUrl);
      const data = await response.json();

      res.writeHead(response.status, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(data));

    } catch (error) {
      console.error("NASA request failed:", error);

      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Unable to retrieve NASA images."
      }));
    }

    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/plain"
  });

  res.end("NASA Space Explorer server is running!");
});

server.listen(PORT, () => {
  console.log(`NASA server running on port ${PORT}`);
});
