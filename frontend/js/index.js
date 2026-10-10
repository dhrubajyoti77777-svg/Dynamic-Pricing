
const coffeeGrid = document.getElementById("coffeeGrid");
const listStatus = document.getElementById("listStatus");

let coffees = [];
let isLoading = false;

function isCoffeeRecord(item) {
    return (
        item &&
        typeof item === "object" &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        Number.isFinite(Number(item.currentPrice))
    );
}

function parseCoffeeResponse(data) {
    if (!Array.isArray(data)) {
        throw new Error("The coffee API did not return a list.");
    }

    // Exclude the metadata object appended by the backend.
    return data.filter(isCoffeeRecord);
}

function formatPrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "Price unavailable";
    }

    return value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function createCoffeeCard(coffee) {
    const card = document.createElement("a");

    card.className = "coffee-option";
    card.href = `./coffee.html?name=${encodeURIComponent(coffee.name)}`;
    card.setAttribute("aria-label", `View ${coffee.name} price`);

    const icon = document.createElement("span");
    icon.className = "option-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "☕";

    const content = document.createElement("div");
    content.className = "option-content";

    const name = document.createElement("h3");
    name.className = "option-name";
    name.textContent = coffee.name;

    const price = document.createElement("p");
    price.className = "option-price";
    price.textContent = formatPrice(coffee.currentPrice);

    const hint = document.createElement("p");
    hint.className = "option-hint";
    hint.textContent = "View current price";

    const arrow = document.createElement("span");
    arrow.className = "option-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    content.append(name, price, hint);
    card.append(icon, content, arrow);

    return card;
}

function renderCoffeeList() {
    coffeeGrid.replaceChildren();

    if (coffees.length === 0) {
        listStatus.textContent = "No coffees are currently available.";
        listStatus.hidden = false;
        return;
    }

    const fragment = document.createDocumentFragment();

    coffees.forEach((coffee) => {
        fragment.appendChild(createCoffeeCard(coffee));
    });

    coffeeGrid.appendChild(fragment);
    listStatus.textContent = "";
    listStatus.hidden = true;
}

async function loadCoffees() {
    if (isLoading) return;

    isLoading = true;

    try {
        const response = await fetch(COFFEE_API_URL, {
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Coffee API returned HTTP ${response.status}`);
        }

        const data = await response.json();

        coffees = parseCoffeeResponse(data);
        renderCoffeeList();
    } catch (error) {
        console.error("Failed to load coffees:", error);

        if (coffees.length === 0) {
            listStatus.textContent =
                "Unable to load coffees right now. Please try again shortly.";
            listStatus.hidden = false;
        }
    } finally {
        isLoading = false;
    }
}

loadCoffees();
setInterval(loadCoffees, REFRESH_INTERVAL_MS);
