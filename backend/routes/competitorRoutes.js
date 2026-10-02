const express = require("express");

const {
    updateCompetitorPrice,
    getCompetitorCoffeeByName
} = require("../controllers/competitorController");

const router = express.Router();

router.post("/", updateCompetitorPrice);
router.get("/:name", getCompetitorCoffeeByName);

module.exports = router;