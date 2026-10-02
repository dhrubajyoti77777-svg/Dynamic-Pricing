const express=require("express");


const {createCoffee,getCoffees, getCoffeeByName,recordSale,predictCoffeePrice}=require("../controllers/coffee.controller");

const router=express.Router();


router.post("/",createCoffee);
router.get("/",getCoffees);
router.get("/:name",getCoffeeByName);
router.post("/:name/sale", recordSale);
router.post("/:name/predict-price", predictCoffeePrice);


module.exports=router;