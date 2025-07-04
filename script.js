let quotes = [];

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate both dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById("categorySelect");
  const filter = document.getElementById("categoryFilter");

  // Reset dropdowns
  select.innerHTML = '';
  filter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat;
    select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat;
    filter.appendChild(option2);
  }

  );

  // Restore previous filter from localStorage
  const savedFilter = localStorage.getItem("lastSelectedCategory");
  if (savedFilter) {
    filter.value = savedFilter;
    filterQuotes();
  }
}

function showRandomQuote() {
  const selectedCategory = document.getElementById("categorySelect").value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  const display = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    display.textContent = "No quotes in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = `"${random.text}"`;

  sessionStorage.setItem("lastViewedQuote", random.text);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");

  // Clear fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Filter quotes and display in list
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const list = document.getElementById("filteredQuotesList");
  list.innerHTML = "";

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    list.textContent = "No quotes found.";
    return;
  }

  filtered.forEach(q => {
    const item = document.createElement("div");
    item.textContent = `"${q.text}" — [${q.category}]`;
    list.appendChild(item);
  });
}

// Init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
loadQuotes();
populateCategories();

// Optional: Show last viewed quote
const lastQuote = sessionStorage.getItem("lastViewedQuote");
if (lastQuote) {
  document.getElementById("quoteDisplay").textContent = `"${lastQuote}"`;
}
