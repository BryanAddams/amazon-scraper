import axios from "axios";
import { JSDOM } from "jsdom";

// Define the structure of a product result
export interface Product {
  title: string;
  rating: string;
  reviews: string;
  image: string;
}

// Main scraping function — fetches and parses Amazon search results
export default async function scrapeAmazon(keyword: string): Promise<Product[]> {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

  // Fetch HTML content from Amazon using a user-agent to avoid bot detection
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0", // Helps bypass basic bot protection
    },
  });

  // Parse HTML using JSDOM
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Select product containers — robust selector for main search results
  const items = document.querySelectorAll(".s-main-slot .s-result-item");

  console.log(`Found ${items.length} product elements for keyword "${keyword}"`);

  const results: Product[] = [];

  // Extract relevant data from each product listing
  items.forEach((item) => {
    // Skip if it's an ad or empty block
    if (!item.querySelector("h2")) return;

    const title = item.querySelector("h2 span")?.textContent?.trim();
    const rating = item.querySelector(".a-icon-alt")?.textContent?.split(" ")[0];
    const reviews = item.querySelector(".a-size-base")?.textContent?.trim();
    const image = item.querySelector("img")?.getAttribute("src");

    // Only include products with a title and image
    if (title && image) {
      results.push({
        title,
        rating: rating || "No rating",
        reviews: reviews || "No reviews",
        image,
      });
    }
  });

  return results;
}
