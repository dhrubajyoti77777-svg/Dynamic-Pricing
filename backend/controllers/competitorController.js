const CompetitorCoffee = require("../models/competitorCoffeeModel");

// Add or update competitor coffee price
const updateCompetitorPrice = async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: "Name and price are required"
            });
        }

        const coffee = await CompetitorCoffee.findOneAndUpdate(
            { name },
            { price },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: "Competitor price updated",
            coffee
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update competitor price",
            error: error.message
        });
    }
};

// Get competitor coffee by name
const getCompetitorCoffeeByName = async (req, res) => {
    try {
        const coffee = await CompetitorCoffee.findOne({
            name: req.params.name
        });

        if (!coffee) {
            return res.status(404).json({
                message: "Competitor coffee not found"
            });
        }

        res.status(200).json(coffee);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get competitor coffee",
            error: error.message
        });
    }
};

module.exports = {
    updateCompetitorPrice,
    getCompetitorCoffeeByName
};