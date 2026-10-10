
const CompetitorCoffee = require("../models/competitorCoffeeModel");
const Coffee = require("../models/coffeeModel");
const PriceHistory = require("../models/priceHistoryModel");

const getTemperature = require("./weatherService");
const isHoliday = require("./holidayService");
const getRuntimeData = require("../utils/runtimeData");
const { predictPrice } = require("./mlService");

// ============================================================
// DYNAMIC PRICING FUNCTION
// ============================================================

const runDynamicPricing = async (competitorCoffee) => {
    try {
        const coffee = await Coffee.findOne({
            name: competitorCoffee.name
        });

        if (!coffee) {
            console.log(
                `No customer coffee found for "${competitorCoffee.name}"`
            );
            return;
        }

        // Get current runtime data
        const { hour, weekend } = getRuntimeData();

        // Get temperature
        const temperature = await getTemperature() || 31;

        // Get holiday status
        const holiday = isHoliday();

        // Random demand for now
        const demandLevels = ["Low", "Medium", "High"];

        const demand =
            demandLevels[
                Math.floor(Math.random() * demandLevels.length)
            ];

        console.log("\n====================================");
        console.log("RUNNING DYNAMIC PRICING");
        console.log("====================================");

        console.log("Coffee:", coffee.name);
        console.log("Demand:", demand);
        console.log("Temperature:", temperature);
        console.log("Hour:", hour);
        console.log("Weekend:", weekend);
        console.log("Holiday:", holiday);
        console.log("Competitor Price:", competitorCoffee.price);
        console.log("Current Price:", coffee.currentPrice);
        console.log("Units Sold:", coffee.unitsSold);

        // =====================================================
        // ML PREDICTION
        // =====================================================

        const result = await predictPrice({
            hour,
            demand,
            temperature,
            weekend,
            holiday,
            competitorPrice: competitorCoffee.price,
            currentPrice: coffee.currentPrice,
            unitsSold: coffee.unitsSold
        });

        const newPrice = Number(
            Number(result.recommendedPrice).toFixed(2)
        );

        if (!Number.isFinite(newPrice) || newPrice < 0) {
            console.error("Invalid recommended price:", newPrice);
            return;
        }

        console.log("Recommended Price:", newPrice);

        // =====================================================
        // UPDATE PRICE AND SAVE HISTORY
        // =====================================================

        const oldPrice = Number(coffee.currentPrice);

        // Save history only when the price actually changes
        if (oldPrice === newPrice) {
            console.log("Price unchanged; history not recorded.");
            return;
        }

        const updatedCoffee = await Coffee.findOneAndUpdate(
            { _id: coffee._id },
            { $set: { currentPrice: newPrice } },
            { returnDocument: "after" }
        );

        if (!updatedCoffee) {
            console.error("Coffee price update failed.");
            return;
        }

        // Record the new price in MongoDB
        await PriceHistory.create({
            coffeeName: updatedCoffee.name,
            price: updatedCoffee.currentPrice,
            recordedAt: new Date()
        });

        console.log("------------------------------------");
        console.log("CUSTOMER PRICE UPDATED");
        console.log("Coffee:", updatedCoffee.name);
        console.log("Old Price:", oldPrice);
        console.log("New Price:", updatedCoffee.currentPrice);
        console.log("Price history saved.");
        console.log("====================================\n");

    } catch (error) {
        console.error(
            "Dynamic Pricing Error:",
            error.message
        );
    }
};

// ============================================================
// START PRICING WATCHER
// ============================================================

const startPricingWatcher = () => {
    console.log("Starting competitor price watcher...");

    // 1. Listen for competitor price changes
    const changeStream = CompetitorCoffee.watch([], {
        fullDocument: "updateLookup"
    });

    changeStream.on("change", async (change) => {
        try {
            // Ignore updates that do not change the competitor price
            if (
                change.operationType === "update" &&
                !Object.prototype.hasOwnProperty.call(
                    change.updateDescription?.updatedFields || {},
                    "price"
                )
            ) {
                return;
            }

            if (
                change.operationType !== "insert" &&
                change.operationType !== "update"
            ) {
                return;
            }

            const competitorCoffee = change.fullDocument;

            if (!competitorCoffee) {
                return;
            }

            console.log("\n====================================");
            console.log("COMPETITOR PRICE CHANGE DETECTED");
            console.log("====================================");
            console.log("Coffee:", competitorCoffee.name);
            console.log("Competitor Price:", competitorCoffee.price);

            await runDynamicPricing(competitorCoffee);

        } catch (error) {
            console.error(
                "Change Stream Error:",
                error.message
            );
        }
    });

    // 2. Periodically recalculate prices every minute
    setInterval(async () => {
        console.log("Periodic pricing timer fired.");

        try {
            const competitorCoffees = await CompetitorCoffee.find();

            if (competitorCoffees.length === 0) {
                console.log("No competitor coffees found.");
                return;
            }

            for (const competitorCoffee of competitorCoffees) {
                await runDynamicPricing(competitorCoffee);
            }

        } catch (error) {
            console.error(
                "Periodic Pricing Error:",
                error.message
            );
        }
    }, 60 * 1000);

    console.log("Pricing watcher started.");
    console.log("Competitor changes → immediate pricing");
    console.log("Periodic pricing → every 1 minute");
};

module.exports = startPricingWatcher;
