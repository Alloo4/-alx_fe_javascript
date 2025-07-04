let quotes = [];

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

// Save to localStorage
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

  // Restore selected filter
  const savedFilter = localStorage.getItem("lastSelectedCategory");
  if (filterSelect && savedFilter) {
    filterSelect.value = savedFilter;
    filterQuotes();
  }
}

// Show a random quote
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
  populateCategories(); // this keeps dropdowns in sync
  filterQuotes();       // updates the filtered list immediately

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Dynamically create quote form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  formContainer.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  formContainer.appendChild(categoryInput);

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Export quotes to JSON
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Filter quotes based on selected category
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", category);

  const container = document.getElementById("filteredQuotesList");
  container.innerHTML = "";

  const filtered = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

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

// Initialize app
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
populateCategories();
createAddQuoteForm();

// Restore last viewed quote from session
const lastQuote = sessionStorage.getItem("lastViewedQuote");
if (lastQuote) {
  document.getElementById("quoteDisplay").textContent = `"${lastQuote}"`;
}

