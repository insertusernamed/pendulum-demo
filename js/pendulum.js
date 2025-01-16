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
    }

    setupCanvas(canvas) {
        const vw = Math.max(
            document.documentElement.clientWidth || 0,
            window.innerWidth || 0
        );
        const vh = Math.max(
            document.documentElement.clientHeight || 0,
            window.innerHeight || 0
        );
        canvas.width = vw / 2;
        canvas.height = vh * 0.95;
    }

    initializeState() {
        this.rodLength1 = DEFAULTS.rodLength1;
        this.rodLength2 = DEFAULTS.rodLength2;
        this.rodStartX = this.canvas.width / 2;
        this.rodStartY = this.canvas.height / 3;

        Object.assign(this, CONFIG.initialConditions);
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
        const damping = 0.9995;
        const mass1 = 2;
        const mass2 = 1;

        // Calculate velocities and heights
        const velocity1 = this.angleVelocity1 * this.rodLength1;
        const velocity2 = this.angleVelocity2 * this.rodLength2;
        const height1 = this.rodLength1 * (1 - Math.cos(this.angle1));
        const height2 = height1 + this.rodLength2 * (1 - Math.cos(this.angle2));

        // Energy calculations
        const currentEnergy =
            0.5 * mass1 * velocity1 * velocity1 +
            0.5 * mass2 * velocity2 * velocity2 +
            (mass1 * CONFIG.g * height1) / 60 +
            (mass2 * CONFIG.g * height2) / 60;

        const energyRatio = CONFIG.targetEnergy / (currentEnergy || 1);
        const energyCorrection =
            1 + (energyRatio - 1) * CONFIG.energyAdjustRate;

        // Angular acceleration calculations
        const torque1 = -CONFIG.g * (2 * mass1 + mass2) * Math.sin(this.angle1);
        const torque2 =
            -mass2 * CONFIG.g * Math.sin(this.angle1 - 2 * this.angle2);
        const centrifugalForce =
            -2 * Math.sin(this.angle1 - this.angle2) * mass2;
        const couplingTerm =
            this.angleVelocity2 * this.angleVelocity2 * this.rodLength2 +
            this.angleVelocity1 *
                this.angleVelocity1 *
                this.rodLength1 *
                Math.cos(this.angle1 - this.angle2);

        const inertia1 =
            this.rodLength1 *
            (2 * mass1 +
                mass2 -
                mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2));

        const angleAcceleration1 =
            (torque1 + torque2 + centrifugalForce * couplingTerm) / inertia1;

        // Second pendulum calculations
        const couplingAngle = 2 * Math.sin(this.angle1 - this.angle2);
        const pendulum1Energy =
            this.angleVelocity1 *
            this.angleVelocity1 *
            this.rodLength1 *
            (mass1 + mass2);
        const gravityTorque =
            CONFIG.g * (mass1 + mass2) * Math.cos(this.angle1);
        const transferredEnergy =
            this.angleVelocity2 *
            this.angleVelocity2 *
            this.rodLength2 *
            mass2 *
            Math.cos(this.angle1 - this.angle2);

        const inertia2 =
            this.rodLength2 *
            (2 * mass1 +
                mass2 -
                mass2 * Math.cos(2 * this.angle1 - 2 * this.angle2));

        const angleAcceleration2 =
            (couplingAngle *
                (pendulum1Energy + gravityTorque + transferredEnergy)) /
            inertia2;

        // Update velocities and angles
        this.angleVelocity1 =
            (this.angleVelocity1 + angleAcceleration1 * deltaTime) *
            damping *
            Math.sqrt(energyCorrection);

        this.angleVelocity2 =
            (this.angleVelocity2 + angleAcceleration2 * deltaTime) *
            damping *
            Math.sqrt(energyCorrection);

        // Apply velocity limits
        this.angleVelocity1 = Math.max(
            Math.min(this.angleVelocity1, CONFIG.maxVelocity),
            -CONFIG.maxVelocity
        );
        this.angleVelocity2 = Math.max(
            Math.min(this.angleVelocity2, CONFIG.maxVelocity),
            -CONFIG.maxVelocity
        );

        // Update angles
        this.angle1 +=
            this.angleVelocity1 * deltaTime * this.controls.simulationSpeed;
        this.angle2 +=
            this.angleVelocity2 * deltaTime * this.controls.simulationSpeed;

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
            this.update(1 / 60);
            this.renderer.draw();
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    new PendulumSimulation(canvas);
});
