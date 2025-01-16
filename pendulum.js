const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
);
let vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
);
canvas.width = vw / 2;
canvas.height = vh * 0.95;

const g = 9.81 * 100;
const rodLength1 = 180;
const rodLength2 = 140;
let angle1 = Math.PI * 0.85;
let angle2 = Math.PI * 0.55;
let angleVelocity1 = 0;
let angleVelocity2 = 0;
let rodStartX = canvas.width / 2;
let rodStartY = canvas.height / 3;

// calculate positions for both pendulums
let rod1EndX = rodStartX + rodLength1 * Math.sin(angle1);
let rod1EndY = rodStartY + rodLength1 * Math.cos(angle1);
let rod2EndX = rod1EndX + rodLength2 * Math.sin(angle2);
let rod2EndY = rod1EndY + rodLength2 * Math.cos(angle2);

// fps control variables
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;
let lastFrameTime = 0;
let fps = 0;
let frameCount = 0;
let lastFPSUpdate = 0;

const trailLength = 500; // number of positions to keep in trail
const trail1 = []; // trail for first pendulum
const trail2 = []; // trail for second pendulum

const targetEnergy = 2500;
const energyAdjustRate = 0.0005;

// pendulum drawing
function drawPendulumRod(gravity) {
    const deltaTime = 1 / 60;
    const damping = 0.9995;

    // Mass of each pendulum bob
    const mass1 = 2;
    const mass2 = 1;

    // Calculate linear velocities from angular velocities
    const velocity1 = angleVelocity1 * rodLength1;
    const velocity2 = angleVelocity2 * rodLength2;

    // Calculate heights of pendulum bobs relative to pivot point
    const height1 = rodLength1 * (1 - Math.cos(angle1));
    const height2 = height1 + rodLength2 * (1 - Math.cos(angle2));

    // Calculate total system energy (kinetic + potential)
    const currentEnergy =
        0.5 * mass1 * velocity1 * velocity1 +
        0.5 * mass2 * velocity2 * velocity2 +
        (mass1 * gravity * height1) / 60 +
        (mass2 * gravity * height2) / 60;

    // Calculate energy adjustment to maintain target energy
    const energyRatio = targetEnergy / (currentEnergy || 1);
    const energyCorrection = 1 + (energyRatio - 1) * energyAdjustRate;

    // Calculate angular acceleration for first pendulum
    const torque1 = -gravity * (2 * mass1 + mass2) * Math.sin(angle1);
    const torque2 = -mass2 * gravity * Math.sin(angle1 - 2 * angle2);
    const centrifugalForce = -2 * Math.sin(angle1 - angle2) * mass2;
    const couplingTerm =
        angleVelocity2 * angleVelocity2 * rodLength2 +
        angleVelocity1 *
            angleVelocity1 *
            rodLength1 *
            Math.cos(angle1 - angle2);
    const inertia1 =
        rodLength1 *
        (2 * mass1 + mass2 - mass2 * Math.cos(2 * angle1 - 2 * angle2));
    const angleAcceleration1 =
        (torque1 + torque2 + centrifugalForce * couplingTerm) / inertia1;

    // Calculate angular acceleration for second pendulum
    const couplingAngle = 2 * Math.sin(angle1 - angle2);
    const pendulum1Energy =
        angleVelocity1 * angleVelocity1 * rodLength1 * (mass1 + mass2);
    const gravityTorque = gravity * (mass1 + mass2) * Math.cos(angle1);
    const transferredEnergy =
        angleVelocity2 *
        angleVelocity2 *
        rodLength2 *
        mass2 *
        Math.cos(angle1 - angle2);
    const inertia2 =
        rodLength2 *
        (2 * mass1 + mass2 - mass2 * Math.cos(2 * angle1 - 2 * angle2));
    const angleAcceleration2 =
        (couplingAngle *
            (pendulum1Energy + gravityTorque + transferredEnergy)) /
        inertia2;

    // Update angular velocities with energy correction
    angleVelocity1 =
        (angleVelocity1 + angleAcceleration1 * deltaTime) *
        damping *
        Math.sqrt(energyCorrection);
    angleVelocity2 =
        (angleVelocity2 + angleAcceleration2 * deltaTime) *
        damping *
        Math.sqrt(energyCorrection);

    // Apply velocity limits
    const maxVelocity = 25;
    angleVelocity1 = Math.max(
        Math.min(angleVelocity1, maxVelocity),
        -maxVelocity
    );
    angleVelocity2 = Math.max(
        Math.min(angleVelocity2, maxVelocity),
        -maxVelocity
    );

    // Update angles
    angle1 += angleVelocity1 * deltaTime;
    angle2 += angleVelocity2 * deltaTime;

    // calculate new positions
    rod1EndX = rodStartX + rodLength1 * Math.sin(angle1);
    rod1EndY = rodStartY + rodLength1 * Math.cos(angle1);
    rod2EndX = rod1EndX + rodLength2 * Math.sin(angle2);
    rod2EndY = rod1EndY + rodLength2 * Math.cos(angle2);

    // draw first pendulum
    ctx.beginPath();
    ctx.moveTo(rodStartX, rodStartY);
    ctx.lineTo(rod1EndX, rod1EndY);
    ctx.stroke();
    drawPendulumBob(rod1EndX, rod1EndY, 15, false);

    // draw second pendulum
    ctx.beginPath();
    ctx.moveTo(rod1EndX, rod1EndY);
    ctx.lineTo(rod2EndX, rod2EndY);
    ctx.stroke();
    drawPendulumBob(rod2EndX, rod2EndY, 15, true);
}

function drawPendulumBob(rodEndX, rodEndY, bobRadius, isSecondBob = false) {
    ctx.beginPath();
    ctx.arc(rodEndX, rodEndY, bobRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isSecondBob ? "#a64452" : "#537d8d";
    ctx.fill();
    ctx.stroke();
}

function drawTrails() {
    // draw trail for first pendulum
    ctx.beginPath();
    ctx.strokeStyle = "#537d8d55"; // semi-transparent blue
    for (let i = 0; i < trail1.length - 1; i++) {
        const alpha = i / trail1.length;
        ctx.globalAlpha = alpha;
        ctx.moveTo(trail1[i].x, trail1[i].y);
        ctx.lineTo(trail1[i + 1].x, trail1[i + 1].y);
    }
    ctx.stroke();

    // draw trail for second pendulum
    ctx.beginPath();
    ctx.strokeStyle = "#a6445255"; // semi-transparent red
    for (let i = 0; i < trail2.length - 1; i++) {
        const alpha = i / trail2.length;
        ctx.globalAlpha = alpha;
        ctx.moveTo(trail2[i].x, trail2[i].y);
        ctx.lineTo(trail2[i + 1].x, trail2[i + 1].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

function updateFPSCounter(currentTime) {
    frameCount++;
    if (currentTime - lastFPSUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFPSUpdate = currentTime;
        document.getElementById("fps-counter").textContent = `FPS: ${fps}`;
    }
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    // calculate time since last frame
    const elapsed = currentTime - lastFrameTime;

    // if it's not time for the next frame, wait
    if (elapsed < frameInterval) return;

    // update fps counter
    updateFPSCounter(currentTime);

    // update last frame time, accounting for any excess time
    lastFrameTime = currentTime - (elapsed % frameInterval);

    // clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update trails
    trail1.push({ x: rod1EndX, y: rod1EndY });
    trail2.push({ x: rod2EndX, y: rod2EndY });
    if (trail1.length > trailLength) trail1.shift();
    if (trail2.length > trailLength) trail2.shift();

    // draw trails first, then pendulum
    drawTrails();
    drawPendulumRod(g);
}

lastFrameTime = performance.now();
animate(lastFrameTime);
