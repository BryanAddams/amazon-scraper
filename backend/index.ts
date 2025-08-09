import express from "express";
import cors from "cors";
import scrapeAmazon from "./scrape";

const app = express();
const PORT = 3000;

// Enable CORS to allow requests from other domains (e.g., frontend on localhost:5173)
app.use(cors());

// Root route — simple welcome message
app.get("/", (req, res) => {
  res.send("Amazon Scraper API is running. Use /api/scrape?keyword=yourKeyword");
});

// Scraping route — triggers the scraper with a given keyword
app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  // Validate query parameter
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  try {
    // Call scraper function and return results
    const data = await scrapeAmazon(keyword);
    res.json(data);
  } catch (err) {
    // Handle scraping errors gracefully
    res.status(500).json({ error: "Failed to scrape Amazon" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
