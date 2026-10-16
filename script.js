"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  // Screens
  const loginScreen = $("loginScreen");
  const creatorScreen = $("creatorScreen");
  const gameScreen = $("gameScreen");

  // Buttons & Inputs
  const playerNameInput = $("playerName");
  const loginBtn = $("loginBtn");
  const loginError = $("loginError");
  const enterGameBtn = $("enterGameBtn");
  const backBtn = $("backBtn");
  const startBtn = $("startBtn");
  const exitBtn = $("exitBtn");

  // Game Elements
  const currentPlayer = $("currentPlayer");
  const creatorPlayerName = $("creatorPlayerName");
  const scoreDisplay = $("score");
  const bestScoreDisplay = $("bestScore");
  const timeDisplay = $("timeLeft");
  const arena = $("arena");
  const target = $("target");
  const arenaMessage = $("arenaMessage");
  const gameStatus = $("gameStatus");

  // Game State
  let playerName = "";
  let score = 0;
  let bestScore = 0;
  let timeLeft = 30;
  let timer = null;
  let playing = false;

  // --- Screen Management (Step by Step) ---
  function showScreen(screenToShow) {
    // Hide all pages, then show only the requested page.
    [loginScreen, creatorScreen, gameScreen].forEach((screen) => {
      screen.classList.add("hidden");
      screen.classList.remove("active");
    });

    screenToShow.classList.remove("hidden");
    screenToShow.classList.add("active");
  }

  // --- Local Storage ---
  function getStorageKey(name) {
    return "neonHuntBest_" + name.trim().toLocaleLowerCase();
  }

  function readBestScore(name) {
    try {
      return Number(localStorage.getItem(getStorageKey(name))) || 0;
    } catch (error) {
      return 0;
    }
  }

  function saveBestScore(name, value) {
    try {
      localStorage.setItem(getStorageKey(name), String(value));
    } catch (error) {
      gameStatus.textContent = "ذخیره رکورد در این مرورگر امکان‌پذیر نیست.";
    }
  }

  // --- Login Logic ---
  function login() {
    const name = playerNameInput.value.trim();

    if (!name) {
      loginError.textContent = "اول اسمت رو وارد کن!";
      playerNameInput.focus();
      return;
    }

    playerName = name;
    bestScore = readBestScore(playerName);

    loginError.textContent = "";
    currentPlayer.textContent = playerName;
    if (creatorPlayerName) creatorPlayerName.textContent = playerName;
    bestScoreDisplay.textContent = bestScore;

    // Go to Step 2: Creator Screen
    showScreen(creatorScreen);
  }

  // --- Game Logic ---
  function enterGame() {
    // Go to Step 3: Game Screen
    showScreen(gameScreen);
    resetGameDisplay();
    gameStatus.textContent = "برای شروع، دکمه شروع بازی رو بزن.";
  }

  function resetGameDisplay() {
    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    bestScoreDisplay.textContent = bestScore;

    target.classList.add("hidden");
    arenaMessage.classList.remove("hidden");
    arenaMessage.innerHTML = `
      <div class="target-icon-large">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
      </div>
      <h3>آماده‌ای؟</h3>
      <p>در ۳۰ ثانیه، هدف‌های نئونی رو بزن!</p>
    `;

    startBtn.innerHTML = `شروع بازی <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
  }

  function moveTarget() {
    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;
    const targetSize = 45; // Matches CSS width

    const maxX = Math.max(0, arenaWidth - targetSize);
    const maxY = Math.max(0, arenaHeight - targetSize);

    target.style.left = Math.floor(Math.random() * maxX) + "px";
    target.style.top = Math.floor(Math.random() * maxY) + "px";
  }

  function startGame() {
    clearInterval(timer);
    playing = true;

    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    arenaMessage.classList.add("hidden");
    target.classList.remove("hidden");

    startBtn.innerHTML = `در حال اجرا...`;
    startBtn.disabled = true;
    startBtn.style.opacity = "0.6";

    gameStatus.textContent = "بزن به هدف‌ها! وقتت داره می‌گذره.";

    // Initial move
    moveTarget();

    timer = setInterval(function () {
      timeLeft--;
      timeDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        finishGame();
      }
    }, 1000);
  }

  function finishGame() {
    clearInterval(timer);
    timer = null;
    playing = false;

    target.classList.add("hidden");
    arenaMessage.classList.remove("hidden");

    if (score > bestScore) {
      bestScore = score;
      saveBestScore(playerName, bestScore);
    }

    bestScoreDisplay.textContent = bestScore;

    arenaMessage.innerHTML = `
      <h3>بازی تموم شد!</h3>
      <p>امتیازت: <span class="neon-cyan">${score}</span> | رکوردت: <span class="neon-pink">${bestScore}</span></p>
    `;

    gameStatus.textContent =
      score > 0
        ? `آفرین ${playerName}! دوباره بازی کن و رکوردت رو بشکن.`
        : "این بار نشد؛ دوباره امتحان کن!";

    startBtn.innerHTML = `بازی دوباره <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
  }

  function stopGame() {
    clearInterval(timer);
    timer = null;
    playing = false;
    target.classList.add("hidden");
  }

  // --- Event Listeners ---
  loginBtn.addEventListener("click", login);

  playerNameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") login();
  });

  playerNameInput.addEventListener("input", function () {
    loginError.textContent = "";
  });

  enterGameBtn.addEventListener("click", enterGame);

  backBtn.addEventListener("click", function () {
    // Go back to Step 1: Login
    showScreen(loginScreen);
    playerNameInput.focus();
  });

  startBtn.addEventListener("click", function () {
    if (!playing) startGame();
  });

  target.addEventListener("click", function () {
    if (!playing) return;

    score++;
    scoreDisplay.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      bestScoreDisplay.textContent = bestScore;
      saveBestScore(playerName, bestScore);
    }

    moveTarget();
  });

  exitBtn.addEventListener("click", function () {
    stopGame();
    // Go back to Step 1: Login
    showScreen(loginScreen);
    playerNameInput.focus();
  });

  // Initialize first screen (Login)
  showScreen(loginScreen);
});
