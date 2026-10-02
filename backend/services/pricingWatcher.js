const CompetitorCoffee = require("../models/competitorCoffeeModel");
const Coffee = require("../models/coffeeModel");

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
        const {
            hour,
            weekend
        } = getRuntimeData();


        // Get real temperature
        const temperature = await getTemperature();


        // Get holiday status
        const holiday = isHoliday();


        // Random demand for now
        const demandLevels = [
            "Low",
            "Medium",
            "High"
        ];

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


        console.log("Recommended Price:", newPrice);


        // =====================================================
        // UPDATE CUSTOMER PRICE
        // =====================================================

        const updatedCoffee = await Coffee.findOneAndUpdate(

            {
                _id: coffee._id
            },

            {
                $set: {
                    currentPrice: newPrice
                }
            },

            {
                returnDocument: "after"
            }

        );


        console.log("------------------------------------");
        console.log("CUSTOMER PRICE UPDATED");
        console.log("Coffee:", updatedCoffee.name);
        console.log("Old Price:", coffee.currentPrice);
        console.log("New Price:", updatedCoffee.currentPrice);
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

    console.log(
        "Starting competitor price watcher..."
    );


    // ========================================================
    // 1. COMPETITOR PRICE CHANGE TRIGGER
    // ========================================================

    const changeStream = CompetitorCoffee.watch([], {
        fullDocument: "updateLookup"
    });


    changeStream.on("change", async (change) => {

        try {

            // Ignore updates that don't contain price changes
            if (
                change.operationType === "update" &&
                !change.updateDescription?.updatedFields?.price
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

            console.log(
                "Coffee:",
                competitorCoffee.name
            );

            console.log(
                "Competitor Price:",
                competitorCoffee.price
            );


            await runDynamicPricing(
                competitorCoffee
            );


        } catch (error) {

            console.error(
                "Change Stream Error:",
                error.message
            );

        }

    });


    // ========================================================
    // 2. PERIODIC TRIGGER - EVERY 5 MINUTES
    // ========================================================

    setInterval(async () => {

        try {

            console.log("\n");
            console.log("====================================");
            console.log("5-MINUTE DYNAMIC PRICING RUN");
            console.log("====================================");


            const competitorCoffees =
                await CompetitorCoffee.find();


            if (competitorCoffees.length === 0) {

                console.log(
                    "No competitor coffees found."
                );

                return;
            }


            // Run pricing for every competitor coffee
            for (const competitorCoffee of competitorCoffees) {

                await runDynamicPricing(
                    competitorCoffee
                );

            }


        } catch (error) {

            console.error(
                "Periodic Pricing Error:",
                error.message
            );

        }

    }, 5 * 60 * 1000);


    console.log(
        "Pricing watcher started."
    );

    console.log(
        "Competitor changes → immediate pricing"
    );

    console.log(
        "Periodic pricing → every 5 minutes"
    );

};


module.exports = startPricingWatcher;