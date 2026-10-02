const mongoose = require("mongoose");

const coffeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        currentPrice: {
            type: Number,
            required: true,
            min: 0
        },

        unitsSold: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Coffee", coffeeSchema);