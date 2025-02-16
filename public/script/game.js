const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 50, y: 180, width: 30, height: 30, speed: 10 };
const obstacles = [];
let gameRunning = false;
let score = 0;
const difficultyEnum = {
    EASY: String("Легкий"),
    MEDIUM: String("Середній"),
    HARD: String("Важкий")
}

let gameDifficulty = difficultyEnum.EASY;

let lastScore = localStorage.getItem("lastScore") || "немає";
let lastDiff = localStorage.getItem("lastDiff") || "невідомо";

// Параметри рівня складності
let obstacleFrequency = 0.02;
let playerSpeed = 20;

document.getElementById("last-score").innerText = `Попередній результат - ${lastScore}, з важкістю ${lastDiff}`;

// Кнопки вибору рівня складності

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const difficultyButtons = [easyBtn, mediumBtn, hardBtn];
easyBtn.addEventListener("click", () => setDifficulty(20, 0.02, easyBtn, difficultyEnum.EASY));
mediumBtn.addEventListener("click", () => setDifficulty(20, 0.03, mediumBtn, difficultyEnum.MEDIUM));
hardBtn.addEventListener("click", () => setDifficulty(30, 0.05, hardBtn, difficultyEnum.HARD));

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("endBtn").addEventListener("click", endGame);
document.addEventListener("keydown", movePlayer);

function setDifficulty(speed, frequency, button, diff) {
    playerSpeed = speed;
    obstacleFrequency = frequency;
    gameDifficulty = diff;

    difficultyButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    console.log(`Вибрано рівень: Швидкість ${speed}, Частота перешкод ${frequency}`);
}

function startGame() {
    gameRunning = true;
    score = 0;
    obstacles.length = 0;
    requestAnimationFrame(updateGame);

    difficultyButtons.forEach(btn => btn.disabled = true);

    let scores = JSON.parse(localStorage.getItem("gameScores")) || [];
    const lastResult = scores[scores.length - 1]
    document.getElementById("last-score").innerText = `Попередній результат - ${lastResult.score}, з рівнем важкості - ${lastResult.gameDifficulty}`;
}

function endGame() {
    gameRunning = false;
    saveScore();

    difficultyButtons.forEach(btn => btn.disabled = false);
}

function movePlayer(event) {
    if (event.key === "ArrowUp" && player.y > 0) {
        player.y -= playerSpeed;
    }
    if (event.key === "ArrowDown" && player.y + player.height < canvas.height) {
        player.y += playerSpeed;
    }
}

function updateGame() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    if (Math.random() < obstacleFrequency) {
        obstacles.push({ x: canvas.width, y: Math.random() * (canvas.height - 20), width: 20, height: 20, speed: 3 });
    }
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacles[i].speed;
        ctx.fillStyle = "red";
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

        if (
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ) {
            endGame();
            return;
        }
    }
    while (obstacles.length > 0 && obstacles[0].x < -20) {
        obstacles.shift();
        score++;
    }
    document.getElementById("score").innerText = `Очки: ${score}`;
    requestAnimationFrame(updateGame);
}

function saveScore() {
    fetch('/check-auth', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                console.log("Користувач залогінений:", data.email);
                saveRegister(data.email);
            } else {
                console.log("Користувач НЕ залогінений");
            }
            saveLocal();
        })
        .catch(error => console.error("Помилка перевірки авторизації:", error));
}

function saveRegister(email) {
    const result = {
        email,
        date: new Date().toLocaleDateString(),
        score, gameDifficulty
    };

    fetch("/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
    })
        .then(response => response.json())
        .then(data => console.log("Результат збережено:", data))
        .catch(error => console.error("Помилка:", error));
}

function saveLocal() {
    const scoreData = { date: new Date().toLocaleString(), score, gameDifficulty};
    let scores = JSON.parse(localStorage.getItem("gameScores")) || [];
    scores.push(scoreData);
    localStorage.setItem("gameScores", JSON.stringify(scores));
    localStorage.setItem("lastScore", score);
    localStorage.setItem("lastDiff", lastDiff)
}
