
const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
    {
        coffeeName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        recordedAt: {
            type: Date,
            default: Date.now,
            required: true,
            index: true
        }
    },
    {
        versionKey: false
    }
);

priceHistorySchema.index({
    coffeeName: 1,
    recordedAt: -1
});

module.exports = mongoose.model(
    "PriceHistory",
    priceHistorySchema
);