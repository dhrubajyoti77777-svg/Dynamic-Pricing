const { predictPrice } = require("../services/mlService");

const testPrediction = async (req, res) => {
    try {
        const result = await predictPrice({
            hour: 14,
            demand: "High",
            temperature: 29,
            weekend: 0,
            holiday: 0,
            competitorPrice: 155,
            currentPrice: 150,
            unitsSold: 70
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    testPrediction
};