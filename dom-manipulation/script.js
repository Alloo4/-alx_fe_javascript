let quotes = [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock server

// Load quotes from localStorage
function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "Success is not final; failure is not fatal.", category: "Motivation" },
      { text: "Only those who dare to fail greatly can ever achieve greatly.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const quoteSelect = document.getElementById("categorySelect");
  const filterSelect = document.getElementById("categoryFilter");

  if (quoteSelect) quoteSelect.innerHTML = "";
  if (filterSelect) filterSelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option1 = document.createElement("option");
    option1.value = category;
    option1.textContent = category;
    if (quoteSelect) quoteSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = category;
    option2.textContent = category;
    if (filterSelect) filterSelect.appendChild(option2);
  });

  if (filterSelect && selectedCategory) {
    filterSelect.value = selectedCategory;
    filterQuotes();
  }
}

// Show random quote by selected category
function showRandomQuote() {
  const category = document.getElementById("categorySelect").value;
  const filtered = quotes.filter(q => q.category === category);
  const display = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    display.textContent = "No quotes in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${random.text}"`;
  sessionStorage.setItem("lastViewedQuote", random.text);
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Create add-quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("addQuoteForm");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Filter quotes by selected category
function filterQuotes() {
  const dropdown = document.getElementById("categoryFilter");
  selectedCategory = dropdown.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const container = document.getElementById("filteredQuotesList");
  container.innerHTML = "";

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    container.textContent = "No quotes found for this category.";
    return;
  }

  filtered.forEach(q => {
    const quoteDiv = document.createElement("div");
    quoteDiv.textContent = `"${q.text}" — [${q.category}]`;
    container.appendChild(quoteDiv);
  });
}

// Fetch quotes from server (simulated)
function fetchQuotesFromServer() {
  return fetch(SERVER_URL)
    .then(res => res.json())
    .then(serverData => {
      return serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

// Sync with server and resolve conflicts
function syncWithServer() {
  const status = document.getElementById("syncStatus");
  status.style.color = "black";
  status.textContent = "Syncing with server...";

  fetchQuotesFromServer()
    .then(serverQuotes => {
      const localQuotes = localStorage.getItem("quotes");
      const localData = localQuotes ? JSON.parse(localQuotes) : [];

      const conflict = JSON.stringify(localData.slice(0, 5)) !== JSON.stringify(serverQuotes);

      if (conflict) {
        quotes = [...serverQuotes];
        saveQuotes();
        populateCategories();
        filterQuotes();

        status.style.color = "orange";
        status.textContent = "Conflict detected. Local data replaced with server quotes.";
      } else {
        status.style.color = "green";
        status.textContent = "No conflicts. Local data is up to date.";
      }
    })
    .catch(() => {
      status.style.color = "red";
      status.textContent = "Failed to sync with server.";
    });
}

// Auto sync every 30 seconds
setInterval(syncWithServer, 30000);

// Initialize app
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
populateCategories();
createAddQuoteForm();

// Restore last viewed quote
const lastQuote = sessionStorage.getItem("lastViewedQuote");
if (lastQuote) {
  document.getElementById("quoteDisplay").textContent = `"${lastQuote}"`;
}

