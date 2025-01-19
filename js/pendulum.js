import { CONFIG, DEFAULTS } from "./constants.js";
import { Controls } from "./controls.js";
import { Renderer } from "./renderer.js";

class PendulumSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.setupCanvas(canvas);
        this.initializeState();

        this.renderer = new Renderer(canvas, this);
        this.controls = new Controls(this, this.renderer);

        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);

        // Add resize event listener
        window.addEventListener("resize", () => this.handleResize());
    }

    setupCanvas(canvas) {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Add scale factor based on screen size
        this.scale = Math.min(canvas.width, canvas.height) / 800; // 800 is our reference size
    }

    initializeState() {
        // Scale lengths based on screen size
        this.rodLength1 = DEFAULTS.rodLength1 * this.scale;
        this.rodLength2 = DEFAULTS.rodLength2 * this.scale;
        this.rodStartX = this.canvas.width / 2;
        this.rodStartY = this.canvas.height / 2.5; // Adjust vertical position

        Object.assign(this, CONFIG.initialConditions);
        this.updatePositions();
    }

    // Add this method to handle window resizing
    handleResize() {
        this.setupCanvas(this.canvas);
        this.rodLength1 = DEFAULTS.rodLength1 * this.scale;
        this.rodLength2 = DEFAULTS.rodLength2 * this.scale;
        this.rodStartX = this.canvas.width / 2;
        this.rodStartY = this.canvas.height / 2.5;
        this.updatePositions();
    }

    updatePositions() {
        this.rod1EndX =
            this.rodStartX + this.rodLength1 * Math.sin(this.angle1);
        this.rod1EndY =
            this.rodStartY + this.rodLength1 * Math.cos(this.angle1);
        this.rod2EndX = this.rod1EndX + this.rodLength2 * Math.sin(this.angle2);
        this.rod2EndY = this.rod1EndY + this.rodLength2 * Math.cos(this.angle2);
    }

    update(deltaTime) {
        // Scale deltaTime by simulation speed, but limit it to prevent instability
        const scaledDeltaTime = Math.min(
            deltaTime * this.controls.simulationSpeed,
            1 / 30
        );
        const damping = 0.9995;
        const mass1 = 2;
        const mass2 = 1;

        // Calculate velocities and heights
        const velocity1 = this.angleVelocity1 * this.rodLength1; // linear velocity of the first pendulum
        const velocity2 = this.angleVelocity2 * this.rodLength2; // linear velocity of the second pendulum
        const height1 = this.rodLength1 * (1 - Math.cos(this.angle1)); // height of the first pendulum
        const height2 = height1 + this.rodLength2 * (1 - Math.cos(this.angle2)); // height of the second pendulum

        // Energy calculations
        const currentEnergy =
            0.5 * mass1 * velocity1 * velocity1 + // kinetic energy of the first pendulum
            0.5 * mass2 * velocity2 * velocity2 + // kinetic energy of the second pendulum
            (mass1 * CONFIG.g * height1) / 60 + // potential energy of the first pendulum
            (mass2 * CONFIG.g * height2) / 60; // potential energy of the second pendulum

        const energyRatio = CONFIG.targetEnergy / (currentEnergy || 1); // ratio of target energy to current energy
        const energyCorrection =
            1 + (energyRatio - 1) * CONFIG.energyAdjustRate; // correction factor to adjust energy

        // Angular acceleration calculations
        const torque1 = -CONFIG.g * (2 * mass1 + mass2) * Math.sin(this.angle1); // torque on the first pendulum
        const torque2 =
            -mass2 * CONFIG.g * Math.sin(this.angle1 - 2 * this.angle2); // torque on the second pendulum
        const centrifugalForce =
            -2 * Math.sin(this.angle1 - this.angle2) * mass2; // centrifugal force between the pendulums
        const couplingTerm =
            this.angleVelocity2 * this.angleVelocity2 * this.rodLength2 + // coupling term for the second pendulum
            this.angleVelocity1 *
                this.angleVelocity1 *
                this.rodLength1 *
                Math.cos(this.angle1 - this.angle2); // coupling term for the first pendulum

        const inertia1 =
            this.rodLength1 *
            (2 * mass1 +
                mass2 -
                mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2)); // inertia of the first pendulum

        const angleAcceleration1 =
            (torque1 + torque2 + centrifugalForce * couplingTerm) / inertia1; // angular acceleration of the first pendulum

        // Second pendulum calculations
        const couplingAngle = 2 * Math.sin(this.angle1 - this.angle2); // coupling angle between the pendulums
        const pendulum1Energy =
            this.angleVelocity1 *
            this.angleVelocity1 *
            this.rodLength1 *
            (mass1 + mass2); // energy of the first pendulum
        const gravityTorque =
            CONFIG.g * (mass1 + mass2) * Math.cos(this.angle1); // gravitational torque on the pendulums
        const transferredEnergy =
            this.angleVelocity2 *
            this.angleVelocity2 *
            this.rodLength2 *
            mass2 *
            Math.cos(this.angle1 - this.angle2); // energy transferred to the second pendulum

        const inertia2 =
            this.rodLength2 *
            (2 * mass1 +
                mass2 -
                mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2)); // inertia of the second pendulum

        const angleAcceleration2 =
            (couplingAngle *
                (pendulum1Energy + gravityTorque + transferredEnergy)) /
            inertia2; // angular acceleration of the second pendulum

        // Update velocities and angles
        this.angleVelocity1 =
            (this.angleVelocity1 + angleAcceleration1 * scaledDeltaTime) *
            damping *
            Math.sqrt(energyCorrection);

        this.angleVelocity2 =
            (this.angleVelocity2 + angleAcceleration2 * scaledDeltaTime) *
            damping *
            Math.sqrt(energyCorrection);

        // Apply velocity limits - scale limits with simulation speed
        const effectiveMaxVelocity =
            CONFIG.maxVelocity / Math.max(this.controls.simulationSpeed, 1);
        this.angleVelocity1 = Math.max(
            Math.min(this.angleVelocity1, effectiveMaxVelocity),
            -effectiveMaxVelocity
        );
        this.angleVelocity2 = Math.max(
            Math.min(this.angleVelocity2, effectiveMaxVelocity),
            -effectiveMaxVelocity
        );

        // Update angles using scaled time
        this.angle1 += this.angleVelocity1 * scaledDeltaTime;
        this.angle2 += this.angleVelocity2 * scaledDeltaTime;

        this.updatePositions();
    }

    animate(currentTime) {
        requestAnimationFrame(this.animate.bind(this));

        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < this.controls.frameInterval) return;

        this.renderer.updateFPSCounter(currentTime);
        this.lastFrameTime =
            currentTime - (elapsed % this.controls.frameInterval);

        if (!this.controls.isPaused) {
            // Use smaller time steps for high simulation speeds
            const steps = Math.ceil(this.controls.simulationSpeed);
            const subDeltaTime = 1 / 60 / steps;

            for (let i = 0; i < steps; i++) {
                this.update(subDeltaTime);
            }
            this.renderer.draw();
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    new PendulumSimulation(canvas);
});
