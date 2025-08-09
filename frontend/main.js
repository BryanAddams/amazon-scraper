// Utility function to escape HTML and prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[tag]));
}

// Show loading spinner while fetching data
function showLoading(keyword) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Searching for "${escapeHTML(keyword)}"...</p>
    </div>
  `;
}

// Display error message
function showError(message) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="error-message">${escapeHTML(message)}</div>
  `;
}

// Display "no results" message
function showNoResults(keyword) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="no-results">
      No products found for "${escapeHTML(keyword)}".<br />
      Try a more specific English keyword like <em>"Harry Potter"</em> or <em>"Kindle books"</em>.
    </div>
  `;
}

// Render product cards on the page
function renderProducts(products) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";

    // If product has a link, make the image clickable
    const imageHTML = product.link
      ? `<a href="${product.link}" target="_blank" rel="noopener noreferrer">
           <img src="${product.image}" alt="${escapeHTML(product.title)}" />
         </a>`
      : `<img src="${product.image}" alt="${escapeHTML(product.title)}" />`;

    div.innerHTML = `
      ${imageHTML}
      <div class="product-info">
        <h3>${escapeHTML(product.title)}</h3>
        <p>⭐ ${escapeHTML(product.rating)}</p>
        <p>📝 ${escapeHTML(product.reviews)}</p>
      </div>
    `;

    resultsDiv.appendChild(div);
  });
}

// Main function to handle search logic
async function handleSearch() {
  const keywordInput = document.getElementById("keyword");
  const keyword = keywordInput.value.trim();

  // Validate input — must be non-empty and alphanumeric
  if (!keyword) return alert("Please enter a keyword");
  if (!/^[a-zA-Z0-9\s]+$/.test(keyword)) {
    alert("Please use English keywords for best results.");
    return;
  }

  // Show loading spinner
  showLoading(keyword);

  try {
    // Make request to backend API
    const res = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);

    // Check if response is OK
    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    // Show message if no products found
    if (data.length === 0) {
      showNoResults(keyword);
      return;
    }

    // Render products
    renderProducts(data);
  } catch (err) {
    // Display error message
    showError("Failed to fetch data. Please try again.");
  }
}

// Add click event listener to the search button
document.getElementById("search").addEventListener("click", handleSearch);
