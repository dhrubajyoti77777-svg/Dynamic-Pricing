const axios = require("axios");

const predictPrice = async (input) => {
    try {
        const response = await axios.post(
            "https://dynamic-pricing-ml-a248.onrender.com/predict",
            input
        );

        return response.data;
    } catch (error) {
        console.error("ML Service Error:", error.message);
        throw new Error("Failed to get price prediction");
    }
};

module.exports = {
    predictPrice
};