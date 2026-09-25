// ==========================================
// EcoStrategix - Simulation Controller
// ==========================================

const {
    simulateStrategy,
    simulateAllStrategies
} = require("../services/strategyEngine");


// ==========================================
// Simulate All Strategies
// ==========================================

function runSimulation(req, res) {

    try {

        const eventData = req.body;

        // Basic validation
        if (!eventData || Object.keys(eventData).length === 0) {

            return res.status(400).json({
                success: false,
                message: "Event data is required."
            });

        }

        const results =
            simulateAllStrategies(eventData);

        return res.status(200).json({

            success: true,

            message: "Simulation completed successfully.",

            data: results

        });

    } catch (error) {

        console.error(
            "Simulation Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to complete simulation.",

            error: error.message

        });

    }
}


// ==========================================
// Simulate One Strategy
// ==========================================

function runSingleStrategy(req, res) {

    try {

        const eventData = req.body;

        const strategyId =
            req.params.strategyId;


        if (!eventData ||
            Object.keys(eventData).length === 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Event data is required."

            });

        }


        const result =
            simulateStrategy(
                eventData,
                strategyId
            );


        return res.status(200).json({

            success: true,

            message:
                "Strategy simulation completed.",

            data: result

        });

    } catch (error) {

        console.error(
            "Strategy Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                "Invalid strategy or event data.",

            error: error.message

        });

    }
}


// ==========================================
// Export Controller
// ==========================================

module.exports = {

    runSimulation,

    runSingleStrategy

};