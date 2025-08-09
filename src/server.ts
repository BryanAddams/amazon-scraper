import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";

const app = express();
const PORT = 3000;

// Optional: Enable CORS if you're calling this API from a frontend on another port
import cors from "cors";
app.use(cors());

// Root route — confirms the server is running
app.get("/", (req, res) => {
  res.send("✅ Amazon Scraper API is running. Try /api/scrape?keyword=yourKeyword");
});

// Scraping route — fetches product data from Amazon based on keyword
app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  // Validate query parameter
  if (!keyword) {
    return res.status(400).json({ error: "Missing keyword parameter" });
  }

  try {
    // Build Amazon search URL using the keyword
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    // Fetch HTML content from Amazon using axios
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0" // Spoof user agent to avoid bot detection
      }
    });

    // Parse HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Select product items from the search results
    const items = document.querySelectorAll(".s-result-item");

    const products: any[] = [];

    // Extract relevant data from each product item
    items.forEach(item => {
      const title = item.querySelector("h2 span")?.textContent?.trim();
      const image = item.querySelector("img")?.getAttribute("src");
      const rating = item.querySelector(".a-icon-alt")?.textContent?.trim();
      const reviews = item.querySelector(".a-size-base")?.textContent?.trim();

      // Only include products with a title and image
      if (title && image) {
        products.push({ title, image, rating, reviews });
      }
    });

    // Return the first 10 products as JSON
    res.json(products.slice(0, 10));
  } catch (err: any) {
    // Handle scraping errors gracefully
    res.status(500).json({ error: err.message });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
