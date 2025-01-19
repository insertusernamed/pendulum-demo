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
        this.initializeDarkMode();
        this.updateChaosButton(); // Add this line
        this.initializeMobileMenu();
    }

    initializeControls() {
        // Remove modal controls section

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
        this.setupButton("randomizeBtn", () => {
            this.randomizeAll();
            this.updateChaosButton();
        });
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

    initializeDarkMode() {
        const darkMode = localStorage.getItem("darkMode") === "true";
        document.documentElement.setAttribute(
            "data-theme",
            darkMode ? "dark" : "light"
        );

        document
            .getElementById("darkModeToggle")
            .addEventListener("click", () => {
                const isDark =
                    document.documentElement.getAttribute("data-theme") ===
                    "dark";
                const newTheme = isDark ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", newTheme);
                localStorage.setItem("darkMode", !isDark);

                // Update button text
                const btn = document.getElementById("darkModeToggle");
                btn.innerHTML = isDark ? "🌙 Dark Mode" : "☀️ Light Mode";
            });

        // Set initial button text
        const btn = document.getElementById("darkModeToggle");
        btn.innerHTML = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    }

    initializeMobileMenu() {
        const menuBtn = document.getElementById("mobileMenuBtn");
        const sidebar = document.getElementById("sidebarContainer");

        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            menuBtn.textContent = sidebar.classList.contains("active")
                ? "✕ Close"
                : "☰ Controls";
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (
                sidebar.classList.contains("active") &&
                !sidebar.contains(e.target) &&
                e.target !== menuBtn
            ) {
                sidebar.classList.remove("active");
                menuBtn.textContent = "☰ Controls";
            }
        });
    }

    setupButton(id, callback) {
        document.getElementById(id).addEventListener("click", callback);
    }

    setupRangeInput(id, callback) {
        const input = document.getElementById(id);
        input.addEventListener("input", (e) => {
            let value = e.target.value;
            if (id === "length1" || id === "length2") {
                value = parseInt(value) * this.simulation.scale;
            }
            callback(value);
        });
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

    randomizeAll() {
        // Randomize colors
        const randomColor = () =>
            "#" + Math.floor(Math.random() * 16777215).toString(16);
        this.renderer.pendulum1Color = randomColor();
        this.renderer.pendulum2Color = randomColor();
        document.getElementById("color1").value = this.renderer.pendulum1Color;
        document.getElementById("color2").value = this.renderer.pendulum2Color;

        // Randomize lengths
        this.simulation.rodLength1 = Math.floor(Math.random() * 250) + 50; // 50-300
        this.simulation.rodLength2 = Math.floor(Math.random() * 250) + 50;
        document.getElementById("length1").value = this.simulation.rodLength1;
        document.getElementById("length2").value = this.simulation.rodLength2;
        this.updateValue("length1Value", this.simulation.rodLength1);
        this.updateValue("length2Value", this.simulation.rodLength2);

        // Randomize bob sizes
        this.renderer.bob1Radius = Math.floor(Math.random() * 25) + 5; // 5-30
        this.renderer.bob2Radius = Math.floor(Math.random() * 25) + 5;
        document.getElementById("radius1").value = this.renderer.bob1Radius;
        document.getElementById("radius2").value = this.renderer.bob2Radius;
        this.updateValue("radius1Value", this.renderer.bob1Radius);
        this.updateValue("radius2Value", this.renderer.bob2Radius);

        // Randomize simulation settings
        this.simulationSpeed = (Math.random() * 1.9 + 0.1).toFixed(1); // 0.1-2.0
        document.getElementById("simSpeed").value = this.simulationSpeed;
        this.updateValue("simSpeedValue", this.simulationSpeed + "x");

        // Randomize starting angles
        Object.assign(this.simulation, {
            angle1: Math.random() * Math.PI * 2,
            angle2: Math.random() * Math.PI * 2,
            angleVelocity1: 0,
            angleVelocity2: 0,
        });

        // Save all new values to localStorage
        localStorage.setItem("color1", this.renderer.pendulum1Color);
        localStorage.setItem("color2", this.renderer.pendulum2Color);
        localStorage.setItem("length1", this.simulation.rodLength1);
        localStorage.setItem("length2", this.simulation.rodLength2);
        localStorage.setItem("radius1", this.renderer.bob1Radius);
        localStorage.setItem("radius2", this.renderer.bob2Radius);
        localStorage.setItem("simSpeed", this.simulationSpeed);

        // Clear trails for the new configuration
        this.renderer.clearTrails();
    }

    // Add these new methods
    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 65%)`;
    }

    updateChaosButton() {
        const btn = document.getElementById("randomizeBtn");
        const bgColor = this.generateRandomColor();
        const textColor = this.getContrastColor(bgColor);

        btn.style.background = bgColor;
        btn.style.color = textColor;
    }

    getContrastColor(backgroundColor) {
        // Convert HSL background to RGB to calculate contrast
        const match = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return "#000000";

        const l = parseInt(match[3]); // Get lightness value
        return l > 60 ? "#000000" : "#ffffff";
    }
}
