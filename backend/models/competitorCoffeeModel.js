const mongoose = require("mongoose");

const competitorCoffeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const CompetitorCoffee = mongoose.model(
    "CompetitorCoffee",
    competitorCoffeeSchema
);

module.exports = CompetitorCoffee;