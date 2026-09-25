// =====================================================
// ECOSTRATEGIX - FRONTEND SIMULATION CONTROLLER
// =====================================================
//
// Frontend responsibilities:
// 1. Load event scenarios
// 2. Read user inputs
// 3. Send event data to backend
// 4. Receive calculated strategies
// 5. Update dashboard
// 6. Update strategy cards
// 7. Update impact breakdown
// 8. Update chart
// 9. Update map
// 10. Generate report
//
// IMPORTANT:
// All environmental calculations are performed by the
// backend. This file does NOT calculate CO2e locally.
// =====================================================


// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL = "http://localhost:5000";

const SIMULATION_API =
    `${API_BASE_URL}/api/simulation`;


// =====================================================
// EVENT SCENARIOS
// =====================================================

const scenarios = {

    f1: {
        name: "F1 Grand Prix",
        title: "F1 GRAND PRIX — EVENT SIMULATOR",
        attendees: 85000,
        days: 3,
        distance: 120,
        energy: 65000,
        renewable: 35,
        car: 50,
        bus: 20,
        train: 20,
        walk: 10,
        logistics: 120,
        waste: 18,
        map: "F1 Circuit · Transport Routes"
    },

    concert: {
        name: "Concert",
        title: "CONCERT — EVENT SIMULATOR",
        attendees: 20000,
        days: 1,
        distance: 65,
        energy: 40000,
        renewable: 30,
        car: 50,
        bus: 20,
        train: 20,
        walk: 10,
        logistics: 45,
        waste: 12,
        map: "Venue · Attendee Mobility Routes"
    },

    sports: {
        name: "Sports Event",
        title: "SPORTS EVENT — EVENT SIMULATOR",
        attendees: 42000,
        days: 1,
        distance: 55,
        energy: 52000,
        renewable: 30,
        car: 45,
        bus: 25,
        train: 20,
        walk: 10,
        logistics: 70,
        waste: 15,
        map: "Stadium · Transport Routes"
    },

    festival: {
        name: "Festival",
        title: "FESTIVAL — EVENT SIMULATOR",
        attendees: 30000,
        days: 2,
        distance: 75,
        energy: 48000,
        renewable: 25,
        car: 45,
        bus: 25,
        train: 20,
        walk: 10,
        logistics: 80,
        waste: 22,
        map: "Festival Grounds · Mobility Routes"
    },

    college: {
        name: "College Fest",
        title: "COLLEGE FEST — EVENT SIMULATOR",
        attendees: 3000,
        days: 2,
        distance: 25,
        energy: 8000,
        renewable: 40,
        car: 25,
        bus: 25,
        train: 30,
        walk: 20,
        logistics: 15,
        waste: 5,
        map: "Campus · Attendee Origin Areas"
    },

    conference: {
        name: "Exhibition / Conference",
        title: "EXHIBITION / CONFERENCE — EVENT SIMULATOR",
        attendees: 8000,
        days: 2,
        distance: 45,
        energy: 28000,
        renewable: 35,
        car: 35,
        bus: 20,
        train: 35,
        walk: 10,
        logistics: 35,
        waste: 7,
        map: "Venue · Attendee Mobility Routes"
    }

};


// =====================================================
// APPLICATION STATE
// =====================================================

let currentEvent = "f1";

let currentScenario = {
    ...scenarios.f1
};

let simulationResults = null;

let selectedStrategy = "current";

let optimizedImpact = 0;

let impactChart = null;

let map = null;

let mapMarker = null;


// =====================================================
// BASIC HELPERS
// =====================================================

const $ = (id) => document.getElementById(id);


function fmt(number) {

    const value = Number(number) || 0;

    return Math.round(value)
        .toLocaleString("en-IN");
}


function fmtDecimal(number) {

    const value = Number(number) || 0;

    return value.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );
}


function setValue(id, value) {

    const element = $(id);

    if (element) {
        element.value = value;
    }
}


function getNumber(id) {

    const element = $(id);

    if (!element) {
        return 0;
    }

    return Number(element.value) || 0;
}


function safeText(id, value) {

    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


function clamp(value, min, max) {

    return Math.min(
        max,
        Math.max(min, value)
    );
}


// =====================================================
// GET EVENT DATA
// =====================================================

function getEventData() {

    return {

        eventType: currentEvent,

        eventName: currentScenario.name,

        attendees:
            getNumber("attendees"),

        duration:
            currentScenario.days,

        distance:
            getNumber("distance"),

        car:
            getNumber("car"),

        bus:
            getNumber("bus"),

        train:
            getNumber("train"),

        walk:
            getNumber("walk"),

        energy:
            getNumber("energy"),

        renewable:
            getNumber("renewable"),

        logistics:
            getNumber("logistics"),

        waste:
            getNumber("waste")

    };
}


// =====================================================
// LOAD EVENT SCENARIO
// =====================================================

function loadScenario(key) {

    if (!scenarios[key]) {
        return;
    }

    currentEvent = key;

    currentScenario = {
        ...scenarios[key]
    };

    const scenario = currentScenario;


    safeText(
        "eventTitle",
        scenario.title
    );


    setValue(
        "attendees",
        scenario.attendees
    );

    setValue(
        "distance",
        scenario.distance
    );

    setValue(
        "energy",
        scenario.energy
    );

    setValue(
        "renewable",
        scenario.renewable
    );

    setValue(
        "car",
        scenario.car
    );

    setValue(
        "bus",
        scenario.bus
    );

    setValue(
        "train",
        scenario.train
    );

    setValue(
        "walk",
        scenario.walk
    );

    setValue(
        "logistics",
        scenario.logistics
    );

    setValue(
        "waste",
        scenario.waste
    );


    updateRangeLabels();


    safeText(
        "mapLabel",
        scenario.map
    );


    simulationResults = null;

    optimizedImpact = 0;

    selectedStrategy = "current";


    updateDashboardFromInputs();

    resetStrategies();

    resetImpactBreakdown();

    resetInsight();


    initMap(
        scenario.name
    );


    showToast(
        `${scenario.name} scenario loaded.`
    );
}


// =====================================================
// RANGE LABELS
// =====================================================

function updateRangeLabels() {

    const ranges = [
        "renewable",
        "car",
        "bus",
        "train",
        "walk"
    ];


    ranges.forEach((id) => {

        const label =
            $(`${id}Value`);

        if (label) {

            label.textContent =
                `${getNumber(id)}%`;

        }

    });
}


// =====================================================
// TRANSPORT VALIDATION
// =====================================================

function validateTransportMix() {

    const total =
        getNumber("car") +
        getNumber("bus") +
        getNumber("train") +
        getNumber("walk");


    const valid =
        Math.abs(total - 100) <= 0.01;


    const warning =
        $("transportWarning");


    if (warning) {

        warning.classList.toggle(
            "show",
            !valid
        );

    }


    return valid;
}


// =====================================================
// UPDATE DASHBOARD FROM INPUTS
// =====================================================
//
// This function DOES NOT calculate CO2e.
// It only displays input information.
// =====================================================

function updateDashboardFromInputs() {

    updateRangeLabels();

    validateTransportMix();


    safeText(
        "attendeesMetric",
        fmt(getNumber("attendees"))
    );


    safeText(
        "energyMetric",
        fmt(getNumber("energy"))
    );


    safeText(
        "wasteMetric",
        fmt(getNumber("waste"))
    );


    safeText(
        "durationMetric",
        currentScenario.days
    );


    safeText(
        "baselineImpact",
        "—"
    );


    safeText(
        "donutTotal",
        "—"
    );


    resetImpactBreakdown();
}


// =====================================================
// GET STRATEGY RESULT
// =====================================================

function getStrategyResult(strategyId) {

    if (!simulationResults) {
        return null;
    }


    if (
        !Array.isArray(
            simulationResults.strategies
        )
    ) {

        return null;

    }


    return simulationResults.strategies.find(
        result =>
            result &&
            result.strategy &&
            result.strategy.id === strategyId
    ) || null;
}


// =====================================================
// GET CURRENT BACKEND BREAKDOWN
// =====================================================
//
// This is deliberately separated into its own function.
// It makes the frontend resilient to the exact backend
// response structure.
// =====================================================

function getCurrentBreakdown() {

    const current =
        getStrategyResult("current");


    if (
        current &&
        current.impact &&
        current.impact.breakdown
    ) {

        return current.impact.breakdown;

    }


    // Fallback: if backend returns a current object
    // directly in a different response shape.

    if (
        simulationResults &&
        simulationResults.current &&
        simulationResults.current.impact &&
        simulationResults.current.impact.breakdown
    ) {

        return simulationResults.current.impact.breakdown;

    }


    return null;
}


// =====================================================
// RESET IMPACT BREAKDOWN
// =====================================================

function resetImpactBreakdown() {

    const ids = [

        "impactTransportationPercent",
        "impactEnergyPercent",
        "impactLogisticsPercent",
        "impactWastePercent",
        "impactOtherPercent"

    ];


    ids.forEach((id) => {

        const element = $(id);

        if (element) {
            element.textContent = "—";
        }

    });


    const bars = [

        "impactTransportationBar",
        "impactEnergyBar",
        "impactLogisticsBar",
        "impactWasteBar",
        "impactOtherBar"

    ];


    bars.forEach((id) => {

        const element = $(id);

        if (element) {

            element.style.width = "0%";

        }

    });


    const donut =
        $("impactDonut");


    if (donut) {

        donut.style.background =
            "conic-gradient(#e8ece9 0deg 360deg)";

    }
}


// =====================================================
// UPDATE IMPACT BREAKDOWN
// =====================================================
//
// Reads the CURRENT PLAN breakdown directly from the
// backend simulation result.
//
// Backend structure:
//
// current
//   └── impact
//       ├── total
//       └── breakdown
//           ├── transportation.total
//           ├── energy.total
//           ├── logistics.total
//           ├── waste.total
//           └── other
// =====================================================

function updateImpactBreakdown() {

    const breakdown =
        getCurrentBreakdown();


    if (!breakdown) {

        console.warn(
            "EcoStrategix: Current impact breakdown not found.",
            simulationResults
        );

        resetImpactBreakdown();

        return;

    }


    const transportation =
        Number(
            breakdown.transportation?.total
        ) || 0;


    const energy =
        Number(
            breakdown.energy?.total
        ) || 0;


    const logistics =
        Number(
            breakdown.logistics?.total
        ) || 0;


    const waste =
        Number(
            breakdown.waste?.total
        ) || 0;


    const other =
        Number(
            breakdown.other
        ) || 0;


    const total =
        transportation +
        energy +
        logistics +
        waste +
        other;


    if (total <= 0) {

        console.warn(
            "EcoStrategix: Impact breakdown total is zero.",
            breakdown
        );

        resetImpactBreakdown();

        return;

    }


    const percentages = {

        transportation:
            (transportation / total) * 100,

        energy:
            (energy / total) * 100,

        logistics:
            (logistics / total) * 100,

        waste:
            (waste / total) * 100,

        other:
            (other / total) * 100

    };


    // Update percentage text

    updateBreakdownItem(
        "impactTransportationPercent",
        "impactTransportationBar",
        percentages.transportation
    );


    updateBreakdownItem(
        "impactEnergyPercent",
        "impactEnergyBar",
        percentages.energy
    );


    updateBreakdownItem(
        "impactLogisticsPercent",
        "impactLogisticsBar",
        percentages.logistics
    );


    updateBreakdownItem(
        "impactWastePercent",
        "impactWasteBar",
        percentages.waste
    );


    updateBreakdownItem(
        "impactOtherPercent",
        "impactOtherBar",
        percentages.other
    );


    // Update donut

    updateDonut(
        percentages
    );


    console.log(
        "EcoStrategix impact breakdown updated:",
        {
            transportation,
            energy,
            logistics,
            waste,
            other,
            total,
            percentages
        }
    );
}


// =====================================================
// UPDATE BREAKDOWN ITEM
// =====================================================

function updateBreakdownItem(
    percentId,
    barId,
    value
) {

    const rounded =
        Number(value) || 0;


    const percent =
        $(percentId);


    if (percent) {

        percent.textContent =
            `${rounded.toFixed(1)}%`;

    }


    const bar =
        $(barId);


    if (bar) {

        bar.style.width =
            `${clamp(
                rounded,
                0,
                100
            )}%`;

    }
}


// =====================================================
// UPDATE DONUT
// =====================================================

function updateDonut(percentages) {

    const donut =
        $("impactDonut");


    if (!donut) {
        return;
    }


    const transport =
        Number(
            percentages.transportation
        ) || 0;


    const energy =
        Number(
            percentages.energy
        ) || 0;


    const logistics =
        Number(
            percentages.logistics
        ) || 0;


    const waste =
        Number(
            percentages.waste
        ) || 0;


    const other =
        Number(
            percentages.other
        ) || 0;


    const p1 =
        transport;


    const p2 =
        p1 + energy;


    const p3 =
        p2 + logistics;


    const p4 =
        p3 + waste;


    const deg1 =
        p1 * 3.6;


    const deg2 =
        p2 * 3.6;


    const deg3 =
        p3 * 3.6;


    const deg4 =
        p4 * 3.6;


    donut.style.background = `
        conic-gradient(
            #19c36a 0deg ${deg1}deg,
            #2f80ed ${deg1}deg ${deg2}deg,
            #f2a93b ${deg2}deg ${deg3}deg,
            #e85d75 ${deg3}deg ${deg4}deg,
            #8a938d ${deg4}deg 360deg
        )
    `;
}


// =====================================================
// UPDATE DASHBOARD FROM BACKEND
// =====================================================

function updateDashboardFromBackend() {

    if (!simulationResults) {
        return;
    }


    const baseline =
        Number(
            simulationResults.baseline
        ) || 0;


    optimizedImpact =
        Number(
            simulationResults.optimizedImpact
        ) || 0;


    const reduction =
        Number(
            simulationResults.overallReduction
        ) || 0;


    safeText(
        "baselineImpact",
        fmt(baseline)
    );


    safeText(
        "donutTotal",
        `${(baseline / 1000).toFixed(1)}K`
    );


    safeText(
        "attendeesMetric",
        fmt(getNumber("attendees"))
    );


    safeText(
        "energyMetric",
        fmt(getNumber("energy"))
    );


    safeText(
        "wasteMetric",
        fmt(getNumber("waste"))
    );


    safeText(
        "durationMetric",
        currentScenario.days
    );


    // IMPORTANT:
    // Update breakdown immediately from backend.

    updateImpactBreakdown();


    updateStrategyValues();


    updateChart(
        selectedStrategy === "optimized"
            ? "optimized"
            : "current"
    );


    updateInsight(
        selectedStrategy === "optimized"
            ? "optimized"
            : "current",
        reduction
    );
}


// =====================================================
// UPDATE STRATEGY VALUES
// =====================================================

function updateStrategyValues() {

    if (!simulationResults) {
        return;
    }


    const current =
        getStrategyResult("current");

    const transport =
        getStrategyResult("publicTransport");

    const renewable =
        getStrategyResult("renewablePublic");

    const optimized =
        getStrategyResult("optimized");


    if (!current) {
        return;
    }


    const base =
        Number(
            current.impact.total
        ) || 0;


    const transportImpact =
        transport
            ? Number(
                transport.impact.total
            )
            : 0;


    const renewableImpact =
        renewable
            ? Number(
                renewable.impact.total
            )
            : 0;


    const optimizedResult =
        optimized
            ? Number(
                optimized.impact.total
            )
            : 0;


    const optimizedReduction =
        optimized
            ? Number(
                optimized.reduction
            )
            : 0;


    safeText(
        "strategyCurrent",
        fmt(base)
    );


    safeText(
        "strategyTransport",
        fmt(transportImpact)
    );


    safeText(
        "strategyRenewable",
        fmt(renewableImpact)
    );


    safeText(
        "strategyOptimized",
        fmt(optimizedResult)
    );


    safeText(
        "optimizedChange",
        `-${optimizedReduction.toFixed(1)}%`
    );


    safeText(
        "beforeImpact",
        fmt(base)
    );


    safeText(
        "afterImpact",
        fmt(optimizedResult)
    );


    safeText(
        "reductionPercent",
        `${optimizedReduction.toFixed(1)}%`
    );


    const reductionBar =
        $("reductionBar");


    if (reductionBar) {

        reductionBar.style.width =
            `${clamp(
                optimizedReduction,
                0,
                100
            )}%`;

    }


    safeText(
        "reportCurrent",
        `${fmt(base)} kg`
    );


    safeText(
        "reportOptimized",
        `${fmt(optimizedResult)} kg`
    );


    safeText(
        "reportReduction",
        `${optimizedReduction.toFixed(1)}%`
    );
}


// =====================================================
// RESET STRATEGIES
// =====================================================

function resetStrategies() {

    document
        .querySelectorAll(".strategy-card")
        .forEach((card) => {

            card.classList.remove(
                "selected"
            );

        });


    const currentCard =
        document.querySelector(
            '[data-strategy="current"]'
        );


    if (currentCard) {

        currentCard.classList.add(
            "selected"
        );

    }


    selectedStrategy =
        "current";


    selectStrategy("current");
}


// =====================================================
// STRATEGY CONFIGURATION
// =====================================================

const strategyMap = {

    current: {

        backendId: "current",

        title: "Current Plan",

        description:
            "Baseline scenario using the current event assumptions."

    },

    transport: {

        backendId: "publicTransport",

        title: "Public Transport",

        description:
            "Shifts part of attendee travel toward higher-capacity public transport."

    },

    renewable: {

        backendId: "renewablePublic",

        title: "Renewable + Public",

        description:
            "Combines increased public transport with a higher renewable energy share."

    },

    optimized: {

        backendId: "optimized",

        title: "Optimized Plan",

        description:
            "Combined strategy adjusting transport, energy, logistics and waste."

    }

};


// =====================================================
// SELECT STRATEGY
// =====================================================

function selectStrategy(key) {

    selectedStrategy =
        key;


    document
        .querySelectorAll(".strategy-card")
        .forEach((card) => {

            card.classList.toggle(
                "selected",
                card.dataset.strategy === key
            );

        });


    const config =
        strategyMap[key] ||
        strategyMap.current;


    safeText(
        "strategyTitle",
        config.title
    );


    safeText(
        "strategyDescription",
        config.description
    );


    const result =
        getStrategyResult(
            config.backendId
        );


    if (result) {

        updateStrategyDetails(
            result
        );

    }
    else {

        updateStrategyDetailsFromInputs();

    }


    updateChart(
        key === "optimized"
            ? "optimized"
            : "current"
    );


    updateInsight(
        key === "optimized"
            ? "optimized"
            : "current"
    );


    // Keep the impact breakdown tied to the
    // CURRENT EVENT baseline.

    if (simulationResults) {

        updateImpactBreakdown();

    }
}


// =====================================================
// UPDATE STRATEGY DETAILS FROM BACKEND
// =====================================================

function updateStrategyDetails(result) {

    const input =
        result.input || {};


    const car =
        Number(input.car) || 0;

    const bus =
        Number(input.bus) || 0;

    const train =
        Number(input.train) || 0;

    const walk =
        Number(input.walk) || 0;

    const renewable =
        Number(input.renewable) || 0;

    const logistics =
        Number(input.logistics) || 0;

    const waste =
        Number(input.waste) || 0;


    safeText(
        "transportMix",
        `Car ${fmtDecimal(car)}% · ` +
        `Bus ${fmtDecimal(bus)}% · ` +
        `Rail ${fmtDecimal(train)}% · ` +
        `Walk ${fmtDecimal(walk)}%`
    );


    safeText(
        "energyMix",
        `${fmtDecimal(renewable)}% renewable · ` +
        `${fmtDecimal(
            Math.max(0, 100 - renewable)
        )}% grid`
    );


    safeText(
        "wasteMix",
        `${fmtDecimal(waste)} tonnes`
    );


    safeText(
        "logisticsMix",
        `${fmtDecimal(logistics)} tonnes`
    );
}


// =====================================================
// FALLBACK STRATEGY DETAILS
// =====================================================

function updateStrategyDetailsFromInputs() {

    const car =
        getNumber("car");

    const bus =
        getNumber("bus");

    const train =
        getNumber("train");

    const walk =
        getNumber("walk");

    const renewable =
        getNumber("renewable");

    const waste =
        getNumber("waste");

    const logistics =
        getNumber("logistics");


    safeText(
        "transportMix",
        `Car ${car}% · ` +
        `Bus ${bus}% · ` +
        `Rail ${train}% · ` +
        `Walk ${walk}%`
    );


    safeText(
        "energyMix",
        `${renewable}% renewable · ` +
        `${Math.max(
            0,
            100 - renewable
        )}% grid`
    );


    safeText(
        "wasteMix",
        `${waste} tonnes`
    );


    safeText(
        "logisticsMix",
        `${logistics} tonnes`
    );
}


// =====================================================
// RUN BACKEND SIMULATION
// =====================================================

async function runBackendSimulation() {

    const eventData =
        getEventData();


    if (!validateTransportMix()) {

        showToast(
            "Adjust transport shares to total 100%."
        );

        throw new Error(
            "Transport shares must total 100%."
        );
    }


    const simulation =
        $("simulation");


    if (simulation) {

        simulation.classList.remove(
            "hidden"
        );

    }


    const steps = [

        "Analyzing Event Data...",

        "Evaluating Transport...",

        "Analyzing Energy Mix...",

        "Simulating Strategies...",

        "Calculating Environmental Impact..."

    ];


    let index = 0;


    safeText(
        "simulationText",
        steps[0]
    );


    const timer =
        setInterval(() => {

            index++;

            if (
                index <
                steps.length
            ) {

                safeText(
                    "simulationText",
                    steps[index]
                );

            }

        }, 350);


    try {

        const response =
            await fetch(
                SIMULATION_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            eventData
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Simulation request failed."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Simulation was unsuccessful."
            );

        }


        // =============================================
        // SAVE BACKEND RESULTS
        // =============================================

        simulationResults =
            result.data;


        // =============================================
        // DEBUG CHECK
        // =============================================

        console.log(
            "EcoStrategix backend simulation:",
            simulationResults
        );


        // =============================================
        // UPDATE ALL DASHBOARD DATA
        // =============================================

        updateDashboardFromBackend();


        // =============================================
        // FORCE BREAKDOWN REFRESH
        // =============================================

        updateImpactBreakdown();


        // =============================================
        // SELECT BACKEND BEST STRATEGY
        // =============================================

        if (
            simulationResults.bestStrategy &&
            simulationResults.bestStrategy.id
        ) {

            const bestId =
                simulationResults
                    .bestStrategy
                    .id;


            const frontendKey =
                backendToFrontendStrategy(
                    bestId
                );


            if (frontendKey) {

                selectStrategy(
                    frontendKey
                );

            }

        }


        // =============================================
        // FINAL BREAKDOWN REFRESH
        // =============================================

        updateImpactBreakdown();


        showToast(
            "Simulation completed successfully."
        );


        return simulationResults;

    }
    catch (error) {

        console.error(
            "EcoStrategix Simulation Error:",
            error
        );


        showToast(
            `Simulation failed: ${error.message}`
        );


        throw error;

    }
    finally {

        clearInterval(timer);


        if (simulation) {

            simulation.classList.add(
                "hidden"
            );

        }

    }
}


// =====================================================
// BACKEND -> FRONTEND STRATEGY MAPPING
// =====================================================

function backendToFrontendStrategy(
    backendId
) {

    const mapping = {

        current:
            "current",

        publicTransport:
            "transport",

        renewablePublic:
            "renewable",

        optimized:
            "optimized"

    };


    return mapping[
        backendId
    ] || null;
}


// =====================================================
// OPTIMIZATION BUTTON
// =====================================================

async function optimize() {

    try {

        await runBackendSimulation();


        selectStrategy(
            "optimized"
        );


        const strategiesSection =
            document.querySelector(
                "#strategies"
            );


        if (strategiesSection) {

            strategiesSection.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

        }


        showToast(
            "Optimization simulation completed."
        );

    }
    catch (error) {

        console.error(
            error
        );

    }
}


// =====================================================
// CHART DATA FROM BACKEND
// =====================================================

function getChartData(strategyId) {

    const result =
        getStrategyResult(
            strategyId
        );


    if (
        !result ||
        !result.impact ||
        !result.impact.breakdown
    ) {

        return [
            0,
            0,
            0,
            0,
            0,
            0
        ];

    }


    const breakdown =
        result.impact.breakdown;


    const transportation =
        Number(
            breakdown.transportation?.total
        ) || 0;


    const energy =
        Number(
            breakdown.energy?.total
        ) || 0;


    const logistics =
        Number(
            breakdown.logistics?.total
        ) || 0;


    const waste =
        Number(
            breakdown.waste?.total
        ) || 0;


    const other =
        Number(
            breakdown.other
        ) || 0;


    // Backend currently does not calculate
    // accommodation separately.

    const accommodation = 0;


    return [

        transportation,

        energy,

        logistics,

        waste,

        accommodation,

        other

    ];
}


// =====================================================
// UPDATE CHART
// =====================================================

function updateChart(plan = "current") {

    if (!impactChart) {
        return;
    }


    if (!simulationResults) {
        return;
    }


    const backendStrategy =
        plan === "optimized"
            ? "optimized"
            : "current";


    const values =
        getChartData(
            backendStrategy
        );


    impactChart
        .data
        .datasets[0]
        .data = values;


    impactChart
        .data
        .datasets[0]
        .label =
        plan === "current"
            ? "Current Plan"
            : "Optimized Plan";


    impactChart.update();
}


// =====================================================
// INITIALIZE CHART
// =====================================================

function initChart() {

    const canvas =
        $("impactChart");


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    impactChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: [

                        "Transportation",

                        "Energy",

                        "Logistics",

                        "Waste",

                        "Accommodation",

                        "Other"

                    ],

                    datasets: [

                        {

                            label:
                                "Current Plan",

                            data: [
                                0,
                                0,
                                0,
                                0,
                                0,
                                0
                            ],

                            borderRadius: 6,

                            backgroundColor:
                                "#19c36a",

                            maxBarThickness:
                                38

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    (context) => {

                                        return (
                                            `${fmt(context.raw)} kg CO₂e`
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                font: {
                                    size: 9
                                },

                                color:
                                    "#6e7872"

                            }

                        },

                        y: {

                            grid: {

                                color:
                                    "#e8ece9"

                            },

                            ticks: {

                                font: {
                                    size: 9
                                },

                                color:
                                    "#8a938d"

                            }

                        }

                    }

                }

            }
        );
}


// =====================================================
// LEAFLET MAP
// =====================================================

function initMap(
    label = "F1 Circuit"
) {

    if (
        typeof L ===
        "undefined"
    ) {

        console.warn(
            "Leaflet is not loaded."
        );

        return;

    }


    const mapElement =
        $("map");


    if (!mapElement) {
        return;
    }


    if (!map) {

        map =
            L.map(
                "map",
                {
                    zoomControl: false
                }
            )
            .setView(
                [23.033, 72.57],
                12
            );


        L.control
            .zoom({
                position:
                    "bottomright"
            })
            .addTo(map);


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "© OpenStreetMap"
            }
        )
        .addTo(map);

    }


    if (mapMarker) {

        map.removeLayer(
            mapMarker
        );

    }


    mapMarker =
        L.marker(
            [
                23.033,
                72.57
            ]
        )
        .addTo(map)
        .bindPopup(
            `<b>${label}</b><br>
             Illustrative event mobility view.`
        )
        .openPopup();


    setTimeout(
        () => {

            if (map) {

                map.invalidateSize();

            }

        },
        100
    );
}


// =====================================================
// INSIGHTS
// =====================================================

function updateInsight(
    plan = "current",
    reduction = null
) {

    if (
        plan === "current"
    ) {

        safeText(
            "insightTitle",
            "Transportation is a major impact driver."
        );


        safeText(
            "insightText",
            "The baseline is calculated from the current event assumptions."
        );


        safeText(
            "insightLever",
            "Transportation"
        );


        safeText(
            "insightEffect",
            "High"
        );

        return;
    }


    const value =
        reduction !== null
            ? Number(reduction) || 0
            : Number(
                simulationResults?.overallReduction
            ) || 0;


    safeText(
        "insightTitle",
        "The optimized scenario reduces key impact levers."
    );


    safeText(
        "insightText",
        `The simulated plan produces an estimated ${value.toFixed(1)}% reduction compared with the current plan.`
    );


    safeText(
        "insightLever",
        "Transport + Energy"
    );


    safeText(
        "insightEffect",
        "Combined"
    );
}


// =====================================================
// RESET INSIGHT
// =====================================================

function resetInsight() {

    safeText(
        "insightTitle",
        "Run a simulation to generate insights."
    );


    safeText(
        "insightText",
        "EcoStrategix will compare the current plan with simulated sustainability strategies."
    );


    safeText(
        "insightLever",
        "Awaiting simulation"
    );


    safeText(
        "insightEffect",
        "—"
    );
}


// =====================================================
// GENERATE REPORT
// =====================================================

function generateReport() {

    if (!simulationResults) {

        showToast(
            "Run a simulation before generating the report."
        );

        return;
    }


    const current =
        getStrategyResult(
            "current"
        );


    const optimized =
        getStrategyResult(
            "optimized"
        );


    if (
        !current ||
        !optimized
    ) {

        showToast(
            "Simulation results are incomplete."
        );

        return;
    }


    const base =
        Number(
            current.impact.total
        ) || 0;


    const optimizedValue =
        Number(
            optimized.impact.total
        ) || 0;


    const reduction =
        Number(
            optimized.reduction
        ) || 0;


    const bestStrategy =
        simulationResults.bestStrategy;


    const title =
        currentScenario.name;


    const content = `

ECOSTRATEGIX
EVENT SUSTAINABILITY REPORT

-------------------------------------

Event:
${title}

Event Type:
${currentEvent}

Duration:
${currentScenario.days} day(s)

Attendees:
${getNumber("attendees").toLocaleString("en-IN")}

Average Travel Distance:
${getNumber("distance")} km


CURRENT PLAN
-------------------------------------

Estimated Impact:
${fmtDecimal(base)} kg CO2e


OPTIMIZED PLAN
-------------------------------------

Estimated Impact:
${fmtDecimal(optimizedValue)} kg CO2e

Estimated Reduction:
${reduction.toFixed(2)}%


BEST SIMULATED STRATEGY
-------------------------------------

${bestStrategy
    ? bestStrategy.name
    : "Not available"}


CURRENT TRANSPORT MIX
-------------------------------------

Car:
${getNumber("car")}%

Bus:
${getNumber("bus")}%

Train:
${getNumber("train")}%

Walk / Cycle:
${getNumber("walk")}%


ENERGY
-------------------------------------

Energy Consumption:
${getNumber("energy")} kWh

Renewable Share:
${getNumber("renewable")}%


LOGISTICS
-------------------------------------

${getNumber("logistics")} tonnes


WASTE
-------------------------------------

${getNumber("waste")} tonnes


RECOMMENDED STRATEGIES
-------------------------------------

1. Increase public transport usage.

2. Increase renewable energy contribution.

3. Reduce event waste.

4. Optimize event logistics.


METHODOLOGY NOTE
-------------------------------------

The displayed results are generated by the
EcoStrategix simulation engine using the
configured emission factors and strategy
assumptions.

These values are illustrative demo results
and should not be interpreted as verified
real-world event emissions.

`;


    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `EcoStrategix-${title.replace(
            /\W+/g,
            "-"
        )}-Report.txt`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Event report generated."
    );
}


// =====================================================
// TOAST MESSAGE
// =====================================================

function showToast(
    message
) {

    const toast =
        $("toast");


    if (!toast) {

        console.log(
            message
        );

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2400
        );
}


// =====================================================
// EVENT BUTTONS
// =====================================================

function setupEventButtons() {

    document
        .querySelectorAll(
            "[data-event]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-event]"
                            )
                            .forEach(
                                (element) => {

                                    element.classList.toggle(
                                        "active",
                                        element.dataset.event ===
                                            button.dataset.event
                                    );

                                }
                            );


                        document
                            .querySelectorAll(
                                ".select-card"
                            )
                            .forEach(
                                (element) => {

                                    element.classList.toggle(
                                        "selected",
                                        element.dataset.event ===
                                            button.dataset.event
                                    );

                                }
                            );


                        loadScenario(
                            button.dataset.event
                        );


                        if (
                            button.closest(
                                ".event-row"
                            )
                        ) {

                            const simulator =
                                document.querySelector(
                                    "#simulator"
                                );


                            if (simulator) {

                                simulator.scrollIntoView(
                                    {
                                        behavior:
                                            "smooth"
                                    }
                                );

                            }

                        }

                    }
                );

            }
        );
}


// =====================================================
// SCROLL BUTTONS
// =====================================================

function setupScrollButtons() {

    document
        .querySelectorAll(
            "[data-scroll]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            document.querySelector(
                                button.dataset.scroll
                            );


                        if (target) {

                            target.scrollIntoView(
                                {
                                    behavior:
                                        "smooth"
                                }
                            );

                        }

                    }
                );

            }
        );
}


// =====================================================
// INPUT EVENTS
// =====================================================

function setupInputEvents() {

    [

        "attendees",

        "distance",

        "energy",

        "renewable",

        "car",

        "bus",

        "train",

        "walk",

        "logistics",

        "waste"

    ].forEach(
        (id) => {

            const element =
                $(id);


            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                () => {

                    simulationResults =
                        null;

                    optimizedImpact =
                        0;

                    selectedStrategy =
                        "current";

                    updateDashboardFromInputs();

                    resetImpactBreakdown();

                    resetInsight();

                }
            );

        }
    );
}


// =====================================================
// STRATEGY CARD EVENTS
// =====================================================

function setupStrategyCards() {

    document
        .querySelectorAll(
            ".strategy-card"
        )
        .forEach(
            (card) => {

                card.addEventListener(
                    "click",
                    () => {

                        selectStrategy(
                            card.dataset.strategy
                        );

                    }
                );

            }
        );
}


// =====================================================
// CHART TOGGLE
// =====================================================

function setupChartToggle() {

    document
        .querySelectorAll(
            ".toggle button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".toggle button"
                            )
                            .forEach(
                                (element) => {

                                    element.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        const plan =
                            button.dataset.plan;


                        safeText(
                            "chartPlanTitle",
                            plan === "current"
                                ? "Current Plan"
                                : "Optimized Plan"
                        );


                        updateChart(
                            plan === "current"
                                ? "current"
                                : "optimized"
                        );


                        updateInsight(
                            plan === "current"
                                ? "current"
                                : "optimized"
                        );

                    }
                );

            }
        );
}


// =====================================================
// BUTTON EVENTS
// =====================================================

function setupActionButtons() {

    const optimizeButton =
        $("optimizeBtn");


    if (optimizeButton) {

        optimizeButton.addEventListener(
            "click",
            optimize
        );

    }


    const reportButton =
        $("reportBtn");


    if (reportButton) {

        reportButton.addEventListener(
            "click",
            generateReport
        );

    }
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // -------------------------------------------
        // Initialize chart
        // -------------------------------------------

        initChart();


        // -------------------------------------------
        // Initialize map
        // -------------------------------------------

        initMap(
            "F1 Circuit · Transport Routes"
        );


        // -------------------------------------------
        // Initial scenario
        // -------------------------------------------

        loadScenario("f1");


        // -------------------------------------------
        // Setup event controls
        // -------------------------------------------

        setupEventButtons();


        // -------------------------------------------
        // Setup scrolling
        // -------------------------------------------

        setupScrollButtons();


        // -------------------------------------------
        // Setup inputs
        // -------------------------------------------

        setupInputEvents();


        // -------------------------------------------
        // Setup strategy cards
        // -------------------------------------------

        setupStrategyCards();


        // -------------------------------------------
        // Setup chart toggle
        // -------------------------------------------

        setupChartToggle();


        // -------------------------------------------
        // Setup action buttons
        // -------------------------------------------

        setupActionButtons();


        // -------------------------------------------
        // Set default active event
        // -------------------------------------------

        document
            .querySelectorAll(
                "[data-event]"
            )
            .forEach(
                (element) => {

                    element.classList.toggle(
                        "active",
                        element.dataset.event ===
                            "f1"
                    );

                }
            );


        document
            .querySelectorAll(
                ".select-card"
            )
            .forEach(
                (element) => {

                    element.classList.toggle(
                        "selected",
                        element.dataset.event ===
                            "f1"
                    );

                }
            );


        // -------------------------------------------
        // Initial strategy selection
        // -------------------------------------------

        selectStrategy(
            "current"
        );


        // -------------------------------------------
        // Initial insight
        // -------------------------------------------

        resetInsight();

    }
);