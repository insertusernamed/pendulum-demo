import { CONFIG, DEFAULTS } from "./constants.js";

export class Renderer {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.simulation = simulation;

        this.pendulum1Color = DEFAULTS.pendulum1Color;
        this.pendulum2Color = DEFAULTS.pendulum2Color;
        this.bob1Radius = DEFAULTS.bob1Radius;
        this.bob2Radius = DEFAULTS.bob2Radius;

        this.trail1 = [];
        this.trail2 = [];

        this.fps = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
    }

    clearTrails() {
        this.trail1.length = 0;
        this.trail2.length = 0;
    }

    updateFPSCounter(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            document.getElementById(
                "fps-counter"
            ).textContent = `FPS: ${this.fps}`;
        }
    }

    drawPendulumBob(x, y, isSecondBob) {
        this.ctx.beginPath();
        this.ctx.arc(
            x,
            y,
            isSecondBob ? this.bob2Radius : this.bob1Radius,
            0,
            2 * Math.PI
        );
        this.ctx.fillStyle = isSecondBob
            ? this.pendulum2Color
            : this.pendulum1Color;
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawTrails() {
        // Draw first pendulum trail
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.pendulum1Color + "55";
        this.drawTrail(this.trail1);

        // Draw second pendulum trail
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.pendulum2Color + "55";
        this.drawTrail(this.trail2);
    }

    drawTrail(trail) {
        for (let i = 0; i < trail.length - 1; i++) {
            const alpha = i / trail.length;
            this.ctx.globalAlpha = alpha;
            this.ctx.moveTo(trail[i].x, trail[i].y);
            this.ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update trails
        this.trail1.push({
            x: this.simulation.rod1EndX,
            y: this.simulation.rod1EndY,
        });
        this.trail2.push({
            x: this.simulation.rod2EndX,
            y: this.simulation.rod2EndY,
        });
        if (this.trail1.length > CONFIG.trailLength) this.trail1.shift();
        if (this.trail2.length > CONFIG.trailLength) this.trail2.shift();

        this.drawTrails();

        // Draw rods
        this.ctx.beginPath();
        this.ctx.moveTo(this.simulation.rodStartX, this.simulation.rodStartY);
        this.ctx.lineTo(this.simulation.rod1EndX, this.simulation.rod1EndY);
        this.ctx.strokeStyle = "#000";
        this.ctx.stroke();
        this.drawPendulumBob(
            this.simulation.rod1EndX,
            this.simulation.rod1EndY,
            false
        );

        this.ctx.beginPath();
        this.ctx.moveTo(this.simulation.rod1EndX, this.simulation.rod1EndY);
        this.ctx.lineTo(this.simulation.rod2EndX, this.simulation.rod2EndY);
        this.ctx.strokeStyle = "#000";
        this.ctx.stroke();
        this.drawPendulumBob(
            this.simulation.rod2EndX,
            this.simulation.rod2EndY,
            true
        );
    }
}
