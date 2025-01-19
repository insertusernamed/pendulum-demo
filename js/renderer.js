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

    drawTrail(trail) {
        if (trail.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
            const alpha = (i / trail.length) ** 2; // Quadratic fade for smoother transition
            this.ctx.globalAlpha = alpha;
            this.ctx.lineTo(trail[i].x, trail[i].y);
        }

        this.ctx.strokeWidth = 2;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    drawTrails() {
        // Draw first pendulum trail
        this.ctx.strokeStyle = this.pendulum1Color + "88";
        this.drawTrail(this.trail1);

        // Draw second pendulum trail
        this.ctx.strokeStyle = this.pendulum2Color + "88";
        this.drawTrail(this.trail2);
    }

    draw() {
        const rodColor = getComputedStyle(document.body)
            .getPropertyValue("--rod-color")
            .trim();
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
        this.ctx.strokeStyle = rodColor;
        this.ctx.stroke();
        this.drawPendulumBob(
            this.simulation.rod1EndX,
            this.simulation.rod1EndY,
            false
        );

        this.ctx.beginPath();
        this.ctx.moveTo(this.simulation.rod1EndX, this.simulation.rod1EndY);
        this.ctx.lineTo(this.simulation.rod2EndX, this.simulation.rod2EndY);
        this.ctx.strokeStyle = rodColor;
        this.ctx.stroke();
        this.drawPendulumBob(
            this.simulation.rod2EndX,
            this.simulation.rod2EndY,
            true
        );

        this.drawNerdStats();
    }

    drawNerdStats() {
        const stats = [
            {
                text: `FPS: ${this.fps}`,
                color:
                    document.documentElement.getAttribute("data-theme") ===
                    "dark"
                        ? "#ffffff"
                        : "#000000",
            },
            {
                text: `θ₁: ${this.simulation.angle1.toFixed(3)} rad`,
                color: this.pendulum1Color,
            },
            {
                text: `ω₁: ${this.simulation.angleVelocity1.toFixed(3)} rad/s`,
                color: this.pendulum1Color,
            },
            {
                text: `θ₂: ${this.simulation.angle2.toFixed(3)} rad`,
                color: this.pendulum2Color,
            },
            {
                text: `ω₂: ${this.simulation.angleVelocity2.toFixed(3)} rad/s`,
                color: this.pendulum2Color,
            },
        ];

        this.ctx.save();
        this.ctx.font = "14px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "bottom";

        const padding = 10;
        const lineHeight = 20;
        const y = this.canvas.height - padding;

        stats.forEach((stat, i) => {
            this.ctx.fillStyle = stat.color + "DD"; // Adding some transparency
            this.ctx.fillText(
                stat.text,
                padding,
                y - (stats.length - 1 - i) * lineHeight
            );
        });

        this.ctx.restore();
    }
}
