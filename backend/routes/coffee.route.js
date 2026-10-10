
const express = require("express");

const {
    createCoffee,
    getCoffees,
    getCoffeeByName,
    recordSale,
    predictCoffeePrice
} = require("../controllers/coffee.controller");

const PriceHistory = require("../models/priceHistoryModel");

const router = express.Router();

// Existing coffee routes
router.post("/", createCoffee);
router.get("/", getCoffees);

// Return the latest 10 recorded prices for a coffee
router.get("/:name/price-history", async (req, res) => {
    try {
        const coffeeName = decodeURIComponent(req.params.name);
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 50)
            : 10;

        const history = await PriceHistory.find({
            coffeeName: {
                $regex: `^${coffeeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        })
            .sort({ recordedAt: -1, _id: -1 })
            .limit(limit)
            .select("coffeeName price recordedAt -_id")
            .lean();

        res.status(200).json({
            coffee: coffeeName,
            count: history.length,
            history: history.reverse()
        });
    } catch (error) {
        console.error("Price history error:", error.message);

        res.status(500).json({
            message: "Unable to retrieve price history."
        });
    }
});

// Existing routes
router.get("/:name", getCoffeeByName);
router.post("/:name/sale", recordSale);
router.post("/:name/predict-price", predictCoffeePrice);

module.exports = router;