// ==========================================
// EcoStrategix - Strategy Simulation Engine
// ==========================================

const {
    calculateImpact
} = require("./emissionEngine");


// ==========================================
// Strategy Definitions
// ==========================================

const STRATEGIES = {

    current: {
        id: "current",
        name: "Current Plan",
        description:
            "The event plan using the currently provided parameters."
    },

    publicTransport: {
        id: "publicTransport",
        name: "Public Transport",
        description:
            "Increase public transport usage and reduce private car travel."
    },

    renewablePublic: {
        id: "renewablePublic",
        name: "Renewable + Public Transport",
        description:
            "Combine increased public transport with a higher renewable energy share."
    },

    optimized: {
        id: "optimized",
        name: "Optimized Plan",
        description:
            "Apply a combined sustainability strategy across transport, energy, logistics and waste."
    }
};


// ==========================================
// Clone Event Data
// ==========================================

function cloneData(data) {

    return {
        ...data
    };

}


// ==========================================
// Public Transport Strategy
// ==========================================

function applyPublicTransportStrategy(data) {

    const optimized =
        cloneData(data);

    // Current private car percentage
    const originalCar =
        Number(optimized.car) || 0;

    // Reduce car usage by 40%
    const carReduction =
        originalCar * 0.40;

    // Remaining car usage
    optimized.car =
        originalCar - carReduction;

    // Shift removed car usage
    // 60% -> bus
    // 40% -> train

    optimized.bus =
        (Number(optimized.bus) || 0) +
        carReduction * 0.60;

    optimized.train =
        (Number(optimized.train) || 0) +
        carReduction * 0.40;

    return normalizeTransportMix(optimized);

}


// ==========================================
// Renewable + Public Transport Strategy
// ==========================================

function applyRenewablePublicStrategy(data) {

    const optimized =
        applyPublicTransportStrategy(data);

    // Increase renewable energy contribution
    optimized.renewable =
        Math.min(
            80,
            (Number(optimized.renewable) || 0) + 45
        );

    return normalizeTransportMix(optimized);

}


// ==========================================
// Fully Optimized Strategy
// ==========================================

function applyOptimizedStrategy(data) {

    const optimized =
        cloneData(data);

    // --------------------------------------
    // Transportation
    // --------------------------------------

    optimized.car = 20;
    optimized.bus = 30;
    optimized.train = 35;
    optimized.walk = 15;


    // --------------------------------------
    // Renewable Energy
    // --------------------------------------

    optimized.renewable = 80;


    // --------------------------------------
    // Logistics
    // --------------------------------------

    optimized.logistics =
        (Number(optimized.logistics) || 0) * 0.75;


    // --------------------------------------
    // Waste
    // --------------------------------------

    optimized.waste =
        (Number(optimized.waste) || 0) * 0.60;


    return normalizeTransportMix(optimized);

}


// ==========================================
// Normalize Transport Percentages
// ==========================================

function normalizeTransportMix(data) {

    const car =
        Math.max(0, Number(data.car) || 0);

    const bus =
        Math.max(0, Number(data.bus) || 0);

    const train =
        Math.max(0, Number(data.train) || 0);

    const walk =
        Math.max(0, Number(data.walk) || 0);


    const total =
        car +
        bus +
        train +
        walk;


    // If no transport data exists,
    // default to 100% car.

    if (total === 0) {

        data.car = 100;
        data.bus = 0;
        data.train = 0;
        data.walk = 0;

        return data;
    }


    // Normalize all values to 100%

    data.car =
        round((car / total) * 100);

    data.bus =
        round((bus / total) * 100);

    data.train =
        round((train / total) * 100);


    // Calculate walking as the remainder
    // to prevent rounding errors.

    data.walk =
        round(
            100 -
            data.car -
            data.bus -
            data.train
        );


    return data;

}


// ==========================================
// Simulate One Strategy
// ==========================================

function simulateStrategy(data, strategyId) {

    let strategyData;


    switch (strategyId) {

        case "current":

            strategyData =
                cloneData(data);

            break;


        case "publicTransport":

            strategyData =
                applyPublicTransportStrategy(data);

            break;


        case "renewablePublic":

            strategyData =
                applyRenewablePublicStrategy(data);

            break;


        case "optimized":

            strategyData =
                applyOptimizedStrategy(data);

            break;


        default:

            throw new Error(
                `Unknown strategy: ${strategyId}`
            );

    }


    // Calculate environmental impact
    // using the emission engine.

    const impact =
        calculateImpact(strategyData);


    return {

        strategy:
            STRATEGIES[strategyId],

        input:
            strategyData,

        impact:
            impact,

        reduction:
            0

    };

}


// ==========================================
// Simulate All Strategies
// ==========================================

function simulateAllStrategies(data) {

    // --------------------------------------
    // Current Plan
    // --------------------------------------

    const current =
        simulateStrategy(
            data,
            "current"
        );


    const baseline =
        current.impact.total;


    // --------------------------------------
    // Public Transport
    // --------------------------------------

    const publicTransport =
        simulateStrategy(
            data,
            "publicTransport"
        );


    // --------------------------------------
    // Renewable + Public Transport
    // --------------------------------------

    const renewablePublic =
        simulateStrategy(
            data,
            "renewablePublic"
        );


    // --------------------------------------
    // Fully Optimized
    // --------------------------------------

    const optimized =
        simulateStrategy(
            data,
            "optimized"
        );


    // --------------------------------------
    // Combine Results
    // --------------------------------------

    const results = [

        current,

        publicTransport,

        renewablePublic,

        optimized

    ];


    // --------------------------------------
    // Calculate Reduction
    // --------------------------------------

    results.forEach(result => {

        result.reduction =
            calculateReduction(
                baseline,
                result.impact.total
            );

    });


    // ======================================
    // FIND ACTUAL BEST STRATEGY
    // ======================================

    /*
     * The previous version always returned:
     *
     *     optimized.strategy
     *
     * even when another strategy had a lower
     * environmental impact.
     *
     * Now we actually compare all calculated
     * strategy impacts.
     */

    let bestResult =
        results[0];


    for (const result of results) {

        if (
            result.impact.total <
            bestResult.impact.total
        ) {

            bestResult =
                result;

        }

    }


    // ======================================
    // FINAL RESPONSE
    // ======================================

    return {

        // Original event impact
        baseline:
            round(baseline),


        // All strategy calculations
        strategies:
            results,


        // Strategy with lowest impact
        bestStrategy:
            bestResult.strategy,


        // Lowest calculated impact
        optimizedImpact:
            round(
                bestResult.impact.total
            ),


        // Percentage reduction compared
        // with the original event plan
        overallReduction:
            calculateReduction(
                baseline,
                bestResult.impact.total
            )

    };

}


// ==========================================
// Reduction Calculation
// ==========================================

function calculateReduction(
    baseline,
    newImpact
) {

    if (
        !baseline ||
        baseline <= 0
    ) {

        return 0;

    }


    const reduction =
        (
            (baseline - newImpact) /
            baseline
        ) * 100;


    return round(
        Math.max(
            0,
            reduction
        )
    );

}


// ==========================================
// Utility
// ==========================================

function round(value) {

    return Math.round(
        value * 100
    ) / 100;

}


// ==========================================
// Exports
// ==========================================

module.exports = {

    STRATEGIES,

    simulateStrategy,

    simulateAllStrategies,

    calculateReduction

};