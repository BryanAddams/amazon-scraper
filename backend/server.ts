import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";

const app = express();
const PORT = 3000;

/**
 * Root route — returns a welcome message with usage instructions.
 */
app.get("/", (req, res) => {
  res.send("🚀 Amazon Scraper API is running! Use /api/scrape?keyword=yourKeyword");
});

/**
 * Scraping route — accepts a keyword query parameter and returns product data.
 */
app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  // Validate that a keyword was provided
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  try {
    // Construct Amazon search URL using the keyword
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    // Fetch the HTML content of the search results page
    const response = await axios.get(url, {
      headers: {
        // Set a User-Agent to mimic a real browser and avoid bot detection
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36",
      },
    });

    // Parse the HTML using JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Select all product containers on the first page
    const items = document.querySelectorAll("[data-component-type='s-search-result']");

    // Extract relevant data from each product listing
    const results = Array.from(items).map((item: Element) => {
      const title = item.querySelector("h2 span")?.textContent?.trim() || "N/A";
      const rating = item.querySelector(".a-icon-alt")?.textContent?.split(" ")[0] || "N/A";
      const reviews = item.querySelector(".a-size-base")?.textContent?.trim() || "N/A";
      const image = item.querySelector("img")?.getAttribute("src") || "N/A";

      return { title, rating, reviews, image };
    });

    // Return the extracted product data as JSON
    res.json(results);
  } catch (error) {
    // Handle errors gracefully and return a descriptive message
    const err = error as Error;
    res.status(500).json({ error: "Failed to scrape Amazon", details: err.message });
  }
});

/**
 * Start the Express server on the defined port.
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
