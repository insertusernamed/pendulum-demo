import { CONFIG, DEFAULTS } from "./constants.js";

export class Controls {
    constructor(simulation, renderer) {
        this.simulation = simulation;
        this.renderer = renderer;
        this.isPaused = false;
        this.simulationSpeed = DEFAULTS.simulationSpeed;
        this.targetFPS = DEFAULTS.targetFPS;
        this.frameInterval = 1000 / this.targetFPS;

        this.initializeControls();
    }

    initializeControls() {
        // Restore saved values on load
        const savedSimSpeed = localStorage.getItem("simSpeed");
        if (savedSimSpeed) {
            this.simulationSpeed = parseFloat(savedSimSpeed);
            document.getElementById("simSpeed").value = savedSimSpeed;
            this.updateValue("simSpeedValue", savedSimSpeed + "x");
        }

        const savedFpsCap = localStorage.getItem("fpsCap");
        if (savedFpsCap) {
            this.targetFPS = parseInt(savedFpsCap);
            this.frameInterval = 1000 / this.targetFPS;
            document.getElementById("fpsCap").value = savedFpsCap;
            this.updateValue("fpsCapValue", savedFpsCap);
        }

        const savedColor1 = localStorage.getItem("color1");
        if (savedColor1) {
            this.renderer.pendulum1Color = savedColor1;
            document.getElementById("color1").value = savedColor1;
        }

        const savedColor2 = localStorage.getItem("color2");
        if (savedColor2) {
            this.renderer.pendulum2Color = savedColor2;
            document.getElementById("color2").value = savedColor2;
        }

        const savedLength1 = localStorage.getItem("length1");
        if (savedLength1) {
            this.simulation.rodLength1 = parseInt(savedLength1);
            document.getElementById("length1").value = savedLength1;
            this.updateValue("length1Value", savedLength1);
        }

        const savedLength2 = localStorage.getItem("length2");
        if (savedLength2) {
            this.simulation.rodLength2 = parseInt(savedLength2);
            document.getElementById("length2").value = savedLength2;
            this.updateValue("length2Value", savedLength2);
        }

        const savedRadius1 = localStorage.getItem("radius1");
        if (savedRadius1) {
            this.renderer.bob1Radius = parseInt(savedRadius1);
            document.getElementById("radius1").value = savedRadius1;
            this.updateValue("radius1Value", savedRadius1);
        }

        const savedRadius2 = localStorage.getItem("radius2");
        if (savedRadius2) {
            this.renderer.bob2Radius = parseInt(savedRadius2);
            document.getElementById("radius2").value = savedRadius2;
            this.updateValue("radius2Value", savedRadius2);
        }

        // Simulation controls
        this.setupButton("pauseBtn", () => this.togglePause());
        this.setupButton("restartBtn", () => this.restart());
        this.setupButton("resetDefaultsBtn", () => this.resetToDefaults());
        this.setupRangeInput("simSpeed", (value) => {
            this.simulationSpeed = parseFloat(value);
            this.updateValue("simSpeedValue", value + "x");
            localStorage.setItem("simSpeed", value);
        });
        this.setupRangeInput("fpsCap", (value) => {
            this.targetFPS = parseInt(value);
            this.frameInterval = 1000 / this.targetFPS;
            this.updateValue("fpsCapValue", value);
            localStorage.setItem("fpsCap", value);
        });

        // Pendulum controls
        this.setupColorInput("color1", (color) => {
            this.renderer.pendulum1Color = color;
            localStorage.setItem("color1", color);
        });
        this.setupColorInput("color2", (color) => {
            this.renderer.pendulum2Color = color;
            localStorage.setItem("color2", color);
        });
        this.setupRangeInput("length1", (value) => {
            this.simulation.rodLength1 = parseInt(value);
            this.updateValue("length1Value", value);
            localStorage.setItem("length1", value);
        });
        this.setupRangeInput("length2", (value) => {
            this.simulation.rodLength2 = parseInt(value);
            this.updateValue("length2Value", value);
            localStorage.setItem("length2", value);
        });
        this.setupRangeInput("radius1", (value) => {
            this.renderer.bob1Radius = parseInt(value);
            this.updateValue("radius1Value", value);
            localStorage.setItem("radius1", value);
        });
        this.setupRangeInput("radius2", (value) => {
            this.renderer.bob2Radius = parseInt(value);
            this.updateValue("radius2Value", value);
            localStorage.setItem("radius2", value);
        });
    }

    setupButton(id, callback) {
        document.getElementById(id).addEventListener("click", callback);
    }

    setupRangeInput(id, callback) {
        document
            .getElementById(id)
            .addEventListener("input", (e) => callback(e.target.value));
    }

    setupColorInput(id, callback) {
        document
            .getElementById(id)
            .addEventListener("input", (e) => callback(e.target.value));
    }

    updateValue(id, value) {
        document.getElementById(id).textContent = value;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById("pauseBtn");
        pauseBtn.textContent = this.isPaused ? "Resume" : "Pause";
        pauseBtn.classList.toggle("paused");
    }

    restart() {
        Object.assign(this.simulation, CONFIG.initialConditions);
        this.renderer.clearTrails();
    }

    resetToDefaults() {
        // Clear localStorage
        [
            "simSpeed",
            "fpsCap",
            "color1",
            "color2",
            "length1",
            "length2",
            "radius1",
            "radius2",
        ].forEach((key) => localStorage.removeItem(key));

        // Revert to defaults and update UI
        this.simulationSpeed = DEFAULTS.simulationSpeed;
        document.getElementById("simSpeed").value = this.simulationSpeed;
        this.updateValue("simSpeedValue", this.simulationSpeed + "x");

        this.targetFPS = DEFAULTS.targetFPS;
        this.frameInterval = 1000 / this.targetFPS;
        document.getElementById("fpsCap").value = this.targetFPS;
        this.updateValue("fpsCapValue", this.targetFPS);

        this.renderer.pendulum1Color = DEFAULTS.pendulum1Color;
        document.getElementById("color1").value = DEFAULTS.pendulum1Color;

        this.renderer.pendulum2Color = DEFAULTS.pendulum2Color;
        document.getElementById("color2").value = DEFAULTS.pendulum2Color;

        this.simulation.rodLength1 = DEFAULTS.rodLength1;
        document.getElementById("length1").value = DEFAULTS.rodLength1;
        this.updateValue("length1Value", DEFAULTS.rodLength1);

        this.simulation.rodLength2 = DEFAULTS.rodLength2;
        document.getElementById("length2").value = DEFAULTS.rodLength2;
        this.updateValue("length2Value", DEFAULTS.rodLength2);

        this.renderer.bob1Radius = DEFAULTS.bob1Radius;
        document.getElementById("radius1").value = DEFAULTS.bob1Radius;
        this.updateValue("radius1Value", DEFAULTS.bob1Radius);

        this.renderer.bob2Radius = DEFAULTS.bob2Radius;
        document.getElementById("radius2").value = DEFAULTS.bob2Radius;
        this.updateValue("radius2Value", DEFAULTS.bob2Radius);

        // Restart simulation
        this.restart();
    }
}
