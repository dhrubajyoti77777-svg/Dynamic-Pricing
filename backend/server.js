const express= require("express");
const cors=require("cors");
require("dotenv").config();

const coffeRouter=require('./routes/coffee.route')
const competitorRoutes = require("./routes/competitorRoutes");
const mlRoutes = require("./routes/mlRoutes");
const startPricingWatcher = require("./services/pricingWatcher");















const connectDB=require("./config/db");

const app=express();
app.use(express.json());
app.use(cors());



app.use("/api/coffees",coffeRouter);
app.use("/api/competitor", competitorRoutes);
app.use("/api/ml", mlRoutes);

connectDB();
startPricingWatcher();




app.get("/", (req, res) => {
    res.json({
        message: "Dynamic Pricing Backend is running"
    });
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`server is running at port : ${PORT}`);
});