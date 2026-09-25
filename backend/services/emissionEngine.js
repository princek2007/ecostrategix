// ==========================================
// EcoStrategix - Emission Calculation Engine
// ==========================================

// Illustrative emission factors.
// These are prototype/demo factors and can
// later be replaced with verified datasets.

// kg CO2e per person per km
const TRANSPORT_FACTORS = {
    car: 0.18,
    bus: 0.07,
    train: 0.04,
    walk: 0
};

// kg CO2e per kWh
const ENERGY_FACTORS = {
    grid: 0.42,
    renewable: 0.05
};

// kg CO2e per tonne of logistics
const LOGISTICS_FACTOR = 100;

// kg CO2e per kg of waste
const WASTE_FACTOR = 0.18;

// Small miscellaneous impact factor
const OTHER_FACTOR = 0.02;


// ==========================================
// Transportation
// ==========================================

function calculateTransportation(data) {

    const attendees = Number(data.attendees) || 0;
    const distance = Number(data.distance) || 0;

    const car = (Number(data.car) || 0) / 100;
    const bus = (Number(data.bus) || 0) / 100;
    const train = (Number(data.train) || 0) / 100;
    const walk = (Number(data.walk) || 0) / 100;

    const carImpact =
        attendees *
        distance *
        car *
        TRANSPORT_FACTORS.car;

    const busImpact =
        attendees *
        distance *
        bus *
        TRANSPORT_FACTORS.bus;

    const trainImpact =
        attendees *
        distance *
        train *
        TRANSPORT_FACTORS.train;

    const walkImpact =
        attendees *
        distance *
        walk *
        TRANSPORT_FACTORS.walk;

    const total =
        carImpact +
        busImpact +
        trainImpact +
        walkImpact;

    return {
        car: round(carImpact),
        bus: round(busImpact),
        train: round(trainImpact),
        walk: round(walkImpact),
        total: round(total)
    };
}


// ==========================================
// Energy
// ==========================================

function calculateEnergy(data) {

    const energy = Number(data.energy) || 0;
    const renewable = (Number(data.renewable) || 0) / 100;

    const renewableEnergy =
        energy * renewable;

    const gridEnergy =
        energy * (1 - renewable);

    const renewableImpact =
        renewableEnergy *
        ENERGY_FACTORS.renewable;

    const gridImpact =
        gridEnergy *
        ENERGY_FACTORS.grid;

    const total =
        renewableImpact +
        gridImpact;

    return {
        gridEnergy: round(gridEnergy),
        renewableEnergy: round(renewableEnergy),
        gridImpact: round(gridImpact),
        renewableImpact: round(renewableImpact),
        total: round(total)
    };
}


// ==========================================
// Logistics
// ==========================================

function calculateLogistics(data) {

    const logistics =
        Number(data.logistics) || 0;

    const total =
        logistics * LOGISTICS_FACTOR;

    return {
        weight: logistics,
        total: round(total)
    };
}


// ==========================================
// Waste
// ==========================================

function calculateWaste(data) {

    const waste =
        Number(data.waste) || 0;

    const total =
        waste * 1000 * WASTE_FACTOR;

    return {
        weight: waste,
        total: round(total)
    };
}


// ==========================================
// Other Impact
// ==========================================

function calculateOther(data) {

    const attendees =
        Number(data.attendees) || 0;

    const total =
        attendees * OTHER_FACTOR;

    return round(total);
}


// ==========================================
// Complete Event Calculation
// ==========================================

function calculateImpact(data) {

    const transportation =
        calculateTransportation(data);

    const energy =
        calculateEnergy(data);

    const logistics =
        calculateLogistics(data);

    const waste =
        calculateWaste(data);

    const other =
        calculateOther(data);

    const total =
        transportation.total +
        energy.total +
        logistics.total +
        waste.total +
        other;

    return {

        breakdown: {
            transportation,
            energy,
            logistics,
            waste,
            other
        },

        total: round(total),

        unit: "kg CO2e"
    };
}


// ==========================================
// Utility
// ==========================================

function round(value) {

    return Math.round(value * 100) / 100;

}


// ==========================================
// Export
// ==========================================

module.exports = {

    calculateImpact,
    calculateTransportation,
    calculateEnergy,
    calculateLogistics,
    calculateWaste

};