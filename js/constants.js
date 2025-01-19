export const CONFIG = {
    g: 9.81 * 100,
    targetEnergy: 2500,
    energyAdjustRate: 0.0005,
    trailLength: 500,
    maxVelocity: 25,
    initialConditions: {
        angle1: Math.PI * 0.85,
        angle2: Math.PI * 0.55,
        angleVelocity1: 0,
        angleVelocity2: 0,
    },
};

export const DEFAULTS = {
    rodLength1: 180,
    rodLength2: 140,
    bob1Radius: 15,
    bob2Radius: 15,
    pendulum1Color: "#3498db", // Updated from "#3498db"
    pendulum2Color: "#e74c3c", // Updated from "#e74c3c"
    targetFPS: 60,
    simulationSpeed: 1,
};
