const express = require("express");
const cors = require("cors");
require("dotenv").config();

const simulationRoutes = require("./routes/simulationRoutes");

const app = express();

// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

// Allow frontend requests
app.use(cors());

// Accept JSON request bodies
app.use(express.json());

// Accept URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        application: "EcoStrategix",
        message: "EcoStrategix Backend is running",
        version: "1.0.0",
        status: "online",
        endpoints: {
            health: "/api/health",
            simulation: "/api/simulation"
        }
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        service: "EcoStrategix API",
        server: "running",
        timestamp: new Date().toISOString()
    });
});

// =====================================================
// SIMULATION API
// =====================================================
//
// POST /api/simulation
//
// Runs all available sustainability strategies.
//
// Expected body example:
//
// {
//     "eventType": "f1",
//     "eventName": "Formula 1 Grand Prix",
//     "attendees": 85000,
//     "duration": 3,
//     "distance": 120,
//     "car": 50,
//     "bus": 20,
//     "train": 20,
//     "walk": 10,
//     "energy": 65000,
//     "renewable": 35,
//     "logistics": 120,
//     "waste": 18
// }
//
// =====================================================

app.use("/api/simulation", simulationRoutes);

// =====================================================
// API INFORMATION ROUTE
// =====================================================

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        application: "EcoStrategix",
        description:
            "Event Sustainability Strategy Simulator API",

        routes: {
            health: {
                method: "GET",
                path: "/api/health",
                description: "Check API health"
            },

            simulation: {
                method: "POST",
                path: "/api/simulation",
                description:
                    "Run all sustainability strategies"
            },

            singleStrategy: {
                method: "POST",
                path: "/api/simulation/:strategyId",
                description:
                    "Run one specific sustainability strategy"
            }
        }
    });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl,
        method: req.method
    });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
    console.error("======================================");
    console.error("SERVER ERROR");
    console.error("======================================");
    console.error(err);
    console.error("======================================");

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : undefined
    });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       ECOSTRATEGIX BACKEND");
    console.log("======================================");
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(
        `Health check:    http://localhost:${PORT}/api/health`
    );
    console.log(
        `API information: http://localhost:${PORT}/api`
    );
    console.log(
        `Simulation API:  http://localhost:${PORT}/api/simulation`
    );
    console.log("======================================");
    console.log("       SERVER READY");
    console.log("======================================");
    console.log("");
});