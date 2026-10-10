
const coffeeNameElement = document.getElementById("coffeeName");
const currentPriceElement = document.getElementById("currentPrice");
const priceStatusElement = document.getElementById("priceStatus");
const temperatureElement = document.getElementById("temperature");
const lastUpdatedElement = document.getElementById("lastUpdated");

const historyStatusElement = document.getElementById("historyStatus");
const historyCountElement = document.getElementById("historyCount");
const historyCanvas = document.getElementById("priceHistoryChart");

const params = new URLSearchParams(window.location.search);
const selectedCoffeeName = params.get("name");

let isLoading = false;
let hasLoadedCoffee = false;
let priceHistoryChart = null;
let isHistoryLoading = false;

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

function formatTemperature(temperature) {
    const value = Number(temperature);

    if (
        temperature === null ||
        temperature === undefined ||
        temperature === "" ||
        !Number.isFinite(value)
    ) {
        return "Not available";
    }

    return `${value} °C`;
}

function formatLastUpdated(updatedAt) {
    if (!updatedAt) {
        return "Not available";
    }

    const date = new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function showError(message) {
    priceStatusElement.textContent = message;
    priceStatusElement.hidden = false;
}

function showHistoryStatus(message) {
    if (historyStatusElement) {
        historyStatusElement.textContent = message;
        historyStatusElement.hidden = false;
    }
}

async function loadCoffeeDetails() {
    if (isLoading || !selectedCoffeeName) {
        return;
    }

    isLoading = true;

    try {
        const response = await fetch(
            `${COFFEE_API_URL}/${encodeURIComponent(selectedCoffeeName)}`,
            {
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "This coffee could not be found."
                    : `Backend returned HTTP ${response.status}.`
            );
        }

        const coffee = await response.json();

        if (
            !coffee ||
            typeof coffee.name !== "string" ||
            !Number.isFinite(Number(coffee.currentPrice))
        ) {
            throw new Error("The backend returned invalid coffee data.");
        }

        coffeeNameElement.textContent = coffee.name;
        currentPriceElement.textContent = formatPrice(coffee.currentPrice);
        lastUpdatedElement.textContent = formatLastUpdated(coffee.updatedAt);

        if (!hasLoadedCoffee) {
            temperatureElement.textContent = "Loading...";
        }

        priceStatusElement.textContent = "Price refreshed from the backend.";
        priceStatusElement.hidden = false;

        hasLoadedCoffee = true;

        await loadTemperature();
    } catch (error) {
        console.error("Failed to load coffee details:", error);

        if (!hasLoadedCoffee) {
            currentPriceElement.textContent = "—";
            temperatureElement.textContent = "Not available";
            lastUpdatedElement.textContent = "Not available";

            showError(
                error.message || "Unable to load coffee details."
            );
        } else {
            showError(
                "Unable to refresh the price. Showing the last loaded data."
            );
        }
    } finally {
        isLoading = false;
    }
}

async function loadTemperature() {
    try {
        const response = await fetch(COFFEE_API_URL, {
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Coffee list returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid coffee list response.");
        }

        const metadata = data.find(
            (item) =>
                item &&
                typeof item === "object" &&
                !item.name &&
                item.temperature !== undefined
        );

        temperatureElement.textContent = formatTemperature(
            metadata?.temperature
        );
    } catch (error) {
        console.error("Failed to load temperature:", error);
        temperatureElement.textContent = "Not available";
    }
}

function renderPriceHistory(history) {
    if (!historyCanvas || typeof Chart === "undefined") {
        showHistoryStatus(
            "The chart library is unavailable. Please refresh the page."
        );
        return;
    }

    const validHistory = history
        .filter((item) => {
            return (
                item &&
                Number.isFinite(Number(item.price)) &&
                item.recordedAt &&
                !Number.isNaN(new Date(item.recordedAt).getTime())
            );
        })
        .slice(-10);

    if (historyCountElement) {
        historyCountElement.textContent =
            `${validHistory.length} record${validHistory.length === 1 ? "" : "s"}`;
    }

    if (validHistory.length === 0) {
        if (priceHistoryChart) {
            priceHistoryChart.destroy();
            priceHistoryChart = null;
        }

        showHistoryStatus(
            "No price history recorded yet. History will appear after the pricing engine records price changes."
        );
        return;
    }

    const labels = validHistory.map((item) => {
        return new Date(item.recordedAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    });

    const prices = validHistory.map((item) => Number(item.price));

    if (priceHistoryChart) {
        priceHistoryChart.data.labels = labels;
        priceHistoryChart.data.datasets[0].data = prices;
        priceHistoryChart.update();
    } else {
        priceHistoryChart = new Chart(historyCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Coffee Price",
                        data: prices,
                        borderColor: "#70a3ff",
                        backgroundColor: "rgba(112, 163, 255, 0.15)",
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "#70a3ff",
                        pointBorderColor: "#10141c",
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) =>
                                `Price: ${formatPrice(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: "#a0aec0",
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            color: "rgba(160, 174, 192, 0.10)"
                        }
                    },
                    y: {
                        ticks: {
                            color: "#a0aec0",
                            callback: (value) => formatPrice(value)
                        },
                        grid: {
                            color: "rgba(160, 174, 192, 0.12)"
                        }
                    }
                }
            }
        });
    }

    showHistoryStatus("Showing the latest recorded price changes.");
}

async function loadPriceHistory() {
    if (
        isHistoryLoading ||
        !selectedCoffeeName ||
        !historyCanvas ||
        typeof COFFEE_API_URL === "undefined"
    ) {
        return;
    }

    isHistoryLoading = true;

    try {
        const response = await fetch(
            `${COFFEE_API_URL}/${encodeURIComponent(selectedCoffeeName)}/price-history?limit=10`,
            {
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Price history endpoint returned HTTP ${response.status}.`
            );
        }

        const result = await response.json();

        if (!result || !Array.isArray(result.history)) {
            throw new Error("Invalid price history response.");
        }

        renderPriceHistory(result.history);
    } catch (error) {
        console.error("Failed to load price history:", error);
        showHistoryStatus(
            "Unable to load price history. Check the backend and try again."
        );
    } finally {
        isHistoryLoading = false;
    }
}

if (!selectedCoffeeName) {
    coffeeNameElement.textContent = "Coffee not selected";
    currentPriceElement.textContent = "—";
    temperatureElement.textContent = "Not available";
    lastUpdatedElement.textContent = "Not available";

    showError("Return to the homepage and select a coffee.");
    showHistoryStatus("Select a coffee to view its price history.");
} else {
    coffeeNameElement.textContent = selectedCoffeeName;
    currentPriceElement.textContent = "Loading...";
    temperatureElement.textContent = "Loading...";
    lastUpdatedElement.textContent = "Loading...";

    showHistoryStatus("Loading price history...");

    loadCoffeeDetails();
    loadPriceHistory();

    setInterval(loadCoffeeDetails, REFRESH_INTERVAL_MS);
    setInterval(loadPriceHistory, 30000);
}
