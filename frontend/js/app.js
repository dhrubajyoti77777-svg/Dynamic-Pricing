const API_URL = "http://localhost:3000/api/coffees";

// ======================================================
// FETCH COFFEE DATA
// ======================================================

async function loadCoffee() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch coffee data");
    }

    const coffees = await response.json();
    console.log(coffees);

    if (!coffees || coffees.length === 0) {
      console.log("No coffee found");
      return;
    }

    // For now, display the first coffee
    const coffee = coffees[0];
    const dim =coffees[3];

    updateCoffeeUI(coffee,dim);
  } catch (error) {
    console.error("Frontend Error:", error);

    document.getElementById("priceStatus").textContent =
      "Unable to load current price";
  }
}

// ======================================================
// UPDATE PAGE
// ======================================================

function updateCoffeeUI(coffee,dim) {
  console.log(coffee);

  document.getElementById("coffeeName").textContent = coffee.name;

  document.getElementById("currentPrice").textContent =
    `₹${Number(coffee.currentPrice).toFixed(2)}`;

  document.getElementById("unitsSold").textContent = coffee.unitsSold;

  document.getElementById("lastUpdated").textContent = new Date(
    coffee.updatedAt,
  ).toLocaleTimeString();

  document.getElementById("temperature").textContent =
    `${dim.temperature} °C`;

  document.getElementById("demand").textContent =
    dim.demand;

  document.getElementById("priceStatus").textContent =
    "Price automatically updated by the pricing engine";
}

// ======================================================
// INITIAL LOAD
// ======================================================

loadCoffee();

// ======================================================
// AUTOMATIC REFRESH
// ======================================================

// Check the backend every 5 seconds
// so the customer sees a newly calculated price.

setInterval(() => {
  loadCoffee();
}, 5000);
