const Coffee=require("../models/coffeeModel");
const { predictPrice } = require("../services/mlService");
const getTemperature = require("../services/weatherService");



const predictCoffeePrice = async (req, res) => {
    try {
        const coffee = await Coffee.findOne({
            name: req.params.name
        });

        if (!coffee) {
            return res.status(404).json({
                message: "Coffee not found"
            });
        }

        const {
            demand,
            temperature,
            weekend,
            holiday,
            competitorPrice
        } = req.body;

        const result = await predictPrice({
            hour: new Date().getHours(),
            demand,
            temperature,
            weekend,
            holiday,
            competitorPrice,
            currentPrice: coffee.currentPrice,
            unitsSold: coffee.unitsSold
        });

        res.status(200).json({
            coffee: coffee.name,
            currentPrice: coffee.currentPrice,
            recommendedPrice: result.recommendedPrice
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to predict coffee price",
            error: error.message
        });
    }
};


const createCoffee = async (req, res) => {
    try {
        const { name, currentPrice } = req.body;

        // Validate required fields
        if (
            typeof name !== "string" ||
            !name.trim() ||
            currentPrice === undefined ||
            currentPrice === null ||
            currentPrice === ""
        ) {
            return res.status(400).json({
                message: "Coffee name and current price are required"
            });
        }

        const price = Number(currentPrice);

        if (!Number.isFinite(price) || price <= 0) {
            return res.status(400).json({
                message: "Current price must be a positive number"
            });
        }

        const coffeeName = name.trim();

        // Prevent duplicate coffee names (case-insensitive)
        const existingCoffee = await Coffee.findOne({
            name: {
                $regex: new RegExp(
                    "^" +
                    coffeeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                    "$",
                    "i"
                )
            }
        });

        if (existingCoffee) {
            return res.status(409).json({
                message: "A coffee with this name already exists"
            });
        }

        const coffee = await Coffee.create({
            name: coffeeName,
            currentPrice: price,
            unitsSold: 0
        });

        return res.status(201).json({
            message: "Coffee added successfully",
            coffee
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A coffee with this name already exists"
            });
        }

        console.error("Create Coffee Error:", error.message);

        return res.status(500).json({
            message: "Failed to add coffee",
            error: error.message
        });
    }
};





const getCoffees= async (req,res)=>{

        try{

            temp=await getTemperature();

            const coffees=await Coffee.find();
            coffees.push({demand: "high", temperature: temp})
            res.status(200).json(coffees);


        }catch(error){
            res.status(500).json({message:"wrong",
                error:error.message
            });
        }



}

const recordSale = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const coffee = await Coffee.findOneAndUpdate(
            { name: req.params.name },
            { $inc: { unitsSold: quantity } },
            { new: true }
        );

        if (!coffee) {
            return res.status(404).json({
                message: "Coffee not found"
            });
        }

        res.status(200).json({
            message: "Sale recorded successfully",
            coffee
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to record sale",
            error: error.message
        });
    }
};



const getCoffeeByName = async (req, res) => {
    try {
        const coffee = await Coffee.findOne({
            name: req.params.name
        });

        if (!coffee) {
            return res.status(404).json({
                message: "Coffee not found"
            });
        }

        res.status(200).json(coffee);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get coffee",
            error: error.message
        });
    }
};

module.exports={createCoffee,getCoffees,getCoffeeByName,recordSale,predictCoffeePrice};