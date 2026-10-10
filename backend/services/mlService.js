const axios = require("axios");

const predictPrice = async (input) => {
    try {
        const response = await axios.post(
            "https://dynamic-pricing-ml-a248.onrender.com/predict",
            input
        );

        return response.data;
   } catch (error) {
    console.error("ML SERVICE REQUEST FAILED");
    console.error("Message:", error.message);
    console.error("Status:", error.response?.status);
    console.error("Response body:", error.response?.data);
    console.error("Response headers:", error.response?.headers);
    console.error("Request URL:", error.config?.url);

    throw new Error("Failed to get price prediction");
}
};

module.exports = {
    predictPrice
};