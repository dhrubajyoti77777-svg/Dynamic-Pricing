const axios = require("axios");

const getTemperature = async () => {
    try {
        const response = await axios.get(
            "https://api.weatherapi.com/v1/current.json",
            {
                params: {
                    key: process.env.WEATHER_API_KEY,
                    q: process.env.WEATHER_CITY
                }
            }
        );

        return response.data.current.temp_c;

    } catch (error) {
        console.error(
            "Weather API error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to fetch temperature");
    }
};

module.exports = getTemperature;