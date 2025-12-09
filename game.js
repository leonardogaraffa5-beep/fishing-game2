// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

// Game State
let score = 0;
let highScore = localStorage.getItem("fishHighScore") || 0;
let fishList = [];
let gameRunning = false;
let difficulty = "normal";
let rodLevel = 1;
let soundEnabled = true;

// Hook Object
const hook = {
    x: canvas.width / 2,
    y: -50,
    speed: 10,
    size: 25,
    casted: false
};

// Difficulty Data
const DIFF = {
    easy:   { spawn: 1600, speed: 1.3 },
    normal: { spawn: 1100, speed: 2.0 },
    hard:   { spawn: 700,  speed: 3.0 }
};

// Asset Paths
const sprites = {
    common: "https://i.imgur.com/gtSjWre.png",
    rare:   "https://i.imgur.com/ovZpYFp.png",
    golden: "https://i.imgur.com/UxT2vKc.png",
    bomb:   "https://i.imgur.com/PuXhCxj.png",
    shark:  "https://i.imgur.com/6sZfghS.png",
    splash: "https://i.imgur.com/aOvvS8V.png"
};

// Sounds
const sCatch = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_40b9a63a64.mp3");
const sSplash = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c2b8c1e11.mp3");
const bgMusic = new Audio("https://cdn.pixabay.com/download/audio/2021/10/09/audio_c5c66bb798.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.4;

// Start Game
function startGame(diff) {
    difficulty = diff;
    score = 0;
    fishList = [];
    rodLevel = 1;
    hook.speed = 10;

    document.getElementById("ui").style.display = "none";
    document.getElementById("score").style.display = "block";
    updateScore();

    gameRunning = true;
    bgMusic.play();

    setInterval(() => {
        if (gameRunning) spawnFish();
    }, DIFF[difficulty].spawn);
}

// Fish Types
function spawnFish() {
    const chance = Math.random();
    let type = "common";

    if (chance > 0.95) type = "shark";     // dangerous
    else if (chance > 0.85) type = "bomb"; // bad
    else if (chance > 0.70) type = "golden";
    else if (chance > 0.50) type = "rare";

    const size = Math.random() * 30 + 40;

    fishList.push({
        x: -size,
        y: Math.random() * (canvas.height - 200) + 100,
        size,
        type,
        speed: DIFF[difficulty].speed + Math.random() * 2
    });
}

// Casting
canvas.addEventListener("click", (e) => {
    if (!gameRunning) return;
    if (!hook.casted) {
        hook.x = e.clientX;
        hook.y = -20;
        hook.casted = true;
        if (soundEnabled) sSplash.play();
    }
});

// Update
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    let g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#7bd0ff");
    g.addColorStop(1, "#004681");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) updateFish();
    if (gameRunning) updateHook();

    requestAnimationFrame(loop);
}
loop();

// Update Fish
function updateFish() {
    fishList.forEach((fish, i) => {
        fish.x += fish.speed;

        let img = new Image();
        img.src = sprites[fish.type];
        ctx.drawImage(img, fish.x, fish.y, fish.size, fish.size);

        if (hook.casted &&
            Math.abs(hook.x - fish.x) < fish.size / 2 &&
            Math.abs(hook.y - fish.y) < fish.size / 2) {

            handleCatch(fish.type);
            fishList.splice(i, 1);
        }

        if (fish.x > canvas.width + 100) fishList.splice(i, 1);
    });
}

// Catch Handling
function handleCatch(type) {
    if (soundEnabled) sCatch.play();

    if (type === "common") score += 1;
    if (type === "rare") score += 3;
    if (type === "golden") score += 10;
    if (type === "bomb") score -= 5;
    if (type === "shark") score -= 10;

    updateScore();
}

function updateScore() {
    highScore = Math.max(highScore, score);
    localStorage.setItem("fishHighScore", highScore);

    document.getElementById("score").textContent =
        `Score: ${score} | High Score: ${highScore}`;
}

// Hook Update
function updateHook() {
    if (!hook.casted) return;

    hook.y += hook.speed;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(hook.x, 0);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(hook.x, hook.y, hook.size / 3, 0, Math.PI * 2);
    ctx.stroke();

    if (hook.y > canvas.height) hook.casted = false;
}

// Upgrades
function upgradeRod() {
    if (score >= 5) {
        score -= 5;
        rodLevel++;
        hook.speed += 3;
        updateScore();
    }
}

// Sound Toggle
function toggleSound() {
    soundEnabled = !soundEnabled;
    bgMusic.muted = !soundEnabled;

    document.getElementById("soundToggle").textContent =
        soundEnabled ? "🔊" : "🔈";
}
