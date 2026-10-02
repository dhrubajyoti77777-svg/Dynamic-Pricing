const express = require("express");

const router = express.Router();

const {
    testPrediction
} = require("../controllers/mlTestController");

router.get("/test", testPrediction);

module.exports = router;