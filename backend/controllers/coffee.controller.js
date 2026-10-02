const Coffee=require("../models/coffeeModel");
const { predictPrice } = require("../services/mlService");



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


const createCoffee= async (req,res)=>{

    try{
        const {name,currentPrice}=req.body;
    

    const coffee= await Coffee.create({
        name,
        currentPrice
    });

    res.status(201).json(coffee);

}
catch(error){
    res.status(500).json({
        
        message:"something went wrong",
        error:error.message});
}
};




const getCoffees= async (req,res)=>{

        try{

            const coffees=await Coffee.find();
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