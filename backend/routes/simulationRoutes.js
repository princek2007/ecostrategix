// ==========================================
// EcoStrategix - Simulation Routes
// ==========================================

const express = require("express");

const router =
    express.Router();

const {
    runSimulation,
    runSingleStrategy
} = require("../controllers/simulationController");


// ==========================================
// POST /api/simulation
// Run all strategies
// ==========================================

router.post(
    "/",
    runSimulation
);


// ==========================================
// POST /api/simulation/:strategyId
// Run one strategy
// ==========================================

router.post(
    "/:strategyId",
    runSingleStrategy
);


// ==========================================
// Export Router
// ==========================================

module.exports = router;