const stage = document.querySelector("[data-stage]");
const player = document.querySelector("[data-player]");
const seenValue = document.querySelector("[data-seen]");
const peaceValue = document.querySelector("[data-peace]");
const chaosValue = document.querySelector("[data-chaos]");
const moodValue = document.querySelector("[data-mood]");
const startButton = document.querySelector("[data-start]");
const stageMessage = document.querySelector("[data-stage-message]");
const resultLabel = document.querySelector("[data-result-label]");
const finalFace = document.querySelector("[data-final-face]");
const finalScore = document.querySelector("[data-final-score]");
const resultTitle = document.querySelector("[data-result-title]");
const resultText = document.querySelector("[data-result-text]");
const moveButtons = Array.from(document.querySelectorAll("[data-move]"));
const batchButtons = Array.from(document.querySelectorAll("[data-batch]"));
const difficultyButtons = Array.from(document.querySelectorAll("[data-difficulty]"));

const difficultySettings = {
  easy: {
    label: "Easy",
    peacePenalty: 0,
    maxActiveDesktop: 3,
    maxActiveMobile: 1,
    spawnDesktop: 2.1,
    spawnMobile: 2.45,
    speedMin: 7.5,
    speedRange: 2.5,
  },
  normal: {
    label: "Normal",
    peacePenalty: 1,
    maxActiveDesktop: 3,
    maxActiveMobile: 2,
    spawnDesktop: 1.55,
    spawnMobile: 1.9,
    speedMin: 10.5,
    speedRange: 3.5,
  },
  hard: {
    label: "Hard",
    peacePenalty: 2,
    maxActiveDesktop: 4,
    maxActiveMobile: 2,
    spawnDesktop: 1.12,
    spawnMobile: 1.45,
    speedMin: 14,
    speedRange: 4.5,
  },
};

const behaviorPairs = window.mimiRedFlagBehaviorPairs;

if (!behaviorPairs) {
  throw new Error("Missing behavior data. Load behaviors.js before game.js.");
}

const state = {
  running: false,
  selectedBatch: "guy",
  selectedDifficulty: "normal",
  deck: [],
  activeCards: [],
  nextIndex: 0,
  seen: 0,
  peace: 0,
  chaos: 0,
  playerX: 50,
  inputX: 0,
  activeInput: new Map(),
  dragging: false,
  dragPointerId: null,
  pointerTargetX: null,
  lastFrame: 0,
  animationFrame: 0,
  spawnClock: 0,
  laneCursor: 0,
  runId: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function buildBehaviorPool(batchName) {
  const pairs = batchName === "mixed"
    ? [...behaviorPairs.guy, ...behaviorPairs.girl]
    : behaviorPairs[batchName];

  return {
    red: pairs.map(([red]) => ({ kind: "red", text: red })),
    green: pairs.map(([, green]) => ({ kind: "green", text: green })),
  };
}

function sampleItems(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function buildDeck(batchName) {
  const pool = buildBehaviorPool(batchName);
  const selectedRed = sampleItems(pool.red, 20);
  const selectedGreen = sampleItems(pool.green, 20);

  return shuffle([...selectedRed, ...selectedGreen]);
}

function getLanePositions() {
  return stage.clientWidth < 560 ? [28, 72] : [17, 39, 61, 83];
}

function getMaxActiveCards() {
  const settings = difficultySettings[state.selectedDifficulty];
  return stage.clientWidth < 560 ? settings.maxActiveMobile : settings.maxActiveDesktop;
}

function getSpawnDelay() {
  const settings = difficultySettings[state.selectedDifficulty];
  return stage.clientWidth < 560 ? settings.spawnMobile : settings.spawnDesktop;
}

function getAvailableLane() {
  const lanes = getLanePositions();
  const available = lanes.filter((lane) => (
    !state.activeCards.some((active) => (
      !active.resolved && Math.abs(active.x - lane) < 1 && active.y < 24
    ))
  ));

  if (available.length === 0) {
    return null;
  }

  const randomLane = available[Math.floor(Math.random() * available.length)];
  state.laneCursor = lanes.indexOf(randomLane);

  return randomLane;
}

function setPlayerPosition(value) {
  state.playerX = clamp(value, 8, 92);
  player.style.left = `calc(${state.playerX}% - 36px)`;
}

function setPlayerFromPointer(clientX) {
  const rect = stage.getBoundingClientRect();
  const position = ((clientX - rect.left) / rect.width) * 100;
  state.pointerTargetX = clamp(position, 8, 92);
}

function updatePointerRun() {
  if (!state.dragging || state.pointerTargetX === null) {
    return;
  }

  const distance = state.pointerTargetX - state.playerX;

  if (Math.abs(distance) < 1.5) {
    releaseInput("stage-drag");
    return;
  }

  holdInput("stage-drag", distance > 0 ? 1 : -1);
}

function updateInputDirection() {
  const total = Array.from(state.activeInput.values()).reduce((sum, value) => sum + value, 0);
  state.inputX = clamp(total, -1, 1);
}

function holdInput(source, direction) {
  state.activeInput.set(source, direction);
  updateInputDirection();
}

function releaseInput(source) {
  state.activeInput.delete(source);
  updateInputDirection();
}

function updateMood() {
  const balance = state.peace - state.chaos;
  const mood = balance >= 2 ? "happy" : balance <= -2 ? "chaotic" : "neutral";

  player.classList.remove("is-happy", "is-chaotic", "is-neutral");
  player.classList.add(`is-${mood}`);
  moodValue.textContent = mood[0].toUpperCase() + mood.slice(1);
}

function updateScorebar() {
  seenValue.textContent = `${state.seen}/${state.deck.length}`;
  peaceValue.textContent = state.peace;
  chaosValue.textContent = state.chaos;
  updateMood();
}

function setStageState(stageState) {
  stage.classList.remove("is-idle", "is-playing", "is-finished");
  stage.classList.add(`is-${stageState}`);
}

function setCurrentMessage(title, text, label = "Mimi's read") {
  resultLabel.textContent = label;
  resultTitle.textContent = title;
  resultText.textContent = text;
  finalFace.hidden = true;
  finalScore.hidden = true;
}

function getShareableResult(score) {
  if (score >= 12) {
    return {
      title: "Green Flag Scholar",
      face: "happy",
      verdict: "Mimi has standards, hydration, and a suspiciously organized emotional filing system.",
    };
  }

  if (score >= 5) {
    return {
      title: "Certified Peace Collector",
      face: "happy",
      verdict: "Mimi dodged enough nonsense to leave with her sparkle mostly attached.",
    };
  }

  if (score >= 0) {
    return {
      title: "Neutral Chaos Analyst",
      face: "neutral",
      verdict: "Mimi saw the signs, made a few choices, and is now requesting a snack and a debrief.",
    };
  }

  if (score >= -7) {
    return {
      title: "Chaos Collector",
      face: "chaotic",
      verdict: "Mimi collected suspicious behavior like loyalty points at the worst store in town.",
    };
  }

  return {
    title: "Red Flag Magnet",
    face: "chaotic",
    verdict: "Mimi did not dodge the flags. Mimi became a tiny museum of them.",
  };
}

function showFinalMessage(score) {
  const result = getShareableResult(score);

  resultLabel.textContent = "Final assessment";
  resultTitle.textContent = result.title;
  resultText.textContent = result.verdict;
  finalScore.textContent = `Score ${score} | Peace ${state.peace} | Chaos ${state.chaos}`;
  finalFace.className = `final-face final-face--${result.face}`;
  finalFace.hidden = false;
  finalScore.hidden = false;
}

function showPopText(active, messages, tone) {
  const pop = document.createElement("div");

  pop.className = `score-pop score-pop--${tone}`;
  pop.textContent = messages.join(" ");
  pop.style.left = `${active.x}%`;
  pop.style.top = `${Math.max(active.y, 8)}%`;
  stage.append(pop);

  window.setTimeout(() => {
    pop.remove();
  }, 760);
}

function reactMimi(tone) {
  player.classList.remove("react-good", "react-bad");
  void player.offsetWidth;
  player.classList.add(tone === "good" ? "react-good" : "react-bad");

  window.setTimeout(() => {
    player.classList.remove("react-good", "react-bad");
  }, 360);
}

function rectanglesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function setCardPosition(active) {
  active.element.style.left = `${active.x}%`;
  active.element.style.top = `${active.y}%`;
}

function createCardElement(item) {
  const element = document.createElement("div");
  const text = document.createElement("span");

  element.className = "falling-card";
  element.style.setProperty("--tilt", `${Math.random() > 0.5 ? 1 : -1}deg`);
  text.textContent = item.text;
  element.append(text);
  stage.prepend(element);

  return element;
}

function removeActiveCard(active) {
  active.element.remove();
  state.activeCards = state.activeCards.filter((cardState) => cardState !== active);
  maybeFinishGame();
}

function clearActiveCards() {
  state.activeCards.forEach((active) => active.element.remove());
  state.activeCards = [];
}

function finishGame() {
  const score = state.peace - state.chaos;

  state.running = false;
  cancelAnimationFrame(state.animationFrame);
  updateScorebar();
  startButton.textContent = "Play again?";
  setStageState("finished");
  stageMessage.classList.add("is-final");
  showFinalMessage(score);
}

function maybeFinishGame() {
  if (state.running && state.nextIndex >= state.deck.length && state.activeCards.length === 0) {
    finishGame();
  }
}

function spawnNextCard(startY = null) {
  if (!state.running || state.nextIndex >= state.deck.length) {
    maybeFinishGame();
    return;
  }

  if (state.activeCards.length >= getMaxActiveCards()) {
    return;
  }

  const lane = getAvailableLane();

  if (lane === null) {
    return;
  }

  const item = state.deck[state.nextIndex];
  const element = createCardElement(item);
  const active = {
    item,
    element,
    x: lane,
    y: startY ?? -22 - Math.random() * 10,
    speed: difficultySettings[state.selectedDifficulty].speedMin
      + Math.random() * difficultySettings[state.selectedDifficulty].speedRange,
    resolved: false,
    runId: state.runId,
  };

  state.nextIndex += 1;
  state.seen = state.nextIndex;
  state.activeCards.push(active);
  setCardPosition(active);
  updateScorebar();
}

function resolveCard(active, wasCaught) {
  if (active.resolved) {
    return;
  }

  active.resolved = true;

  if (wasCaught) {
    if (active.item.kind === "red") {
      const penalty = difficultySettings[state.selectedDifficulty].peacePenalty;
      const lostPeace = Math.min(state.peace, penalty);
      const messages = ["+1 chaos"];

      state.chaos += 1;
      state.peace -= lostPeace;
      if (lostPeace > 0) {
        messages.push(`-${lostPeace} peace`);
      }
      active.element.classList.add("is-red");
      showPopText(active, messages, "bad");
      reactMimi("bad");
      setCurrentMessage(
        "Red flag collected",
        lostPeace > 0
          ? `"${active.item.text}" stole ${lostPeace} peace point${lostPeace === 1 ? "" : "s"}.`
          : `"${active.item.text}" has entered Mimi's emotional file cabinet.`
      );
    } else {
      state.peace += 1;
      active.element.classList.add("is-green");
      showPopText(active, ["+1 peace"], "good");
      reactMimi("good");
      setCurrentMessage(
        "Green flag collected",
        `"${active.item.text}" restored one tiny unit of faith.`
      );
    }

    updateScorebar();

    window.setTimeout(() => {
      if (active.runId === state.runId) {
        removeActiveCard(active);
      }
    }, 180);

    return;
  }

  if (active.item.kind === "red") {
    setCurrentMessage(
      "Red flag dodged",
      `"${active.item.text}" drifted away without touching Mimi's peace.`
    );
  } else {
    setCurrentMessage(
      "Green flag missed",
      `"${active.item.text}" was healthy, and tragically, just out of reach.`
    );
  }

  removeActiveCard(active);
}

function updateSpawning(delta) {
  state.spawnClock += delta;

  if (state.spawnClock >= getSpawnDelay()) {
    state.spawnClock = 0;
    spawnNextCard();
  }
}

function tick(timestamp) {
  if (!state.running) {
    return;
  }

  const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.04);
  state.lastFrame = timestamp;

  updatePointerRun();

  if (state.inputX !== 0) {
    setPlayerPosition(state.playerX + state.inputX * 54 * delta);
  }

  updateSpawning(delta);

  const playerRect = player.getBoundingClientRect();

  state.activeCards.slice().forEach((active) => {
    if (active.resolved) {
      return;
    }

    active.y += active.speed * delta;
    setCardPosition(active);

    if (active.y > 108) {
      resolveCard(active, false);
      return;
    }

    if (rectanglesOverlap(playerRect, active.element.getBoundingClientRect())) {
      resolveCard(active, true);
    }
  });

  maybeFinishGame();
  state.animationFrame = requestAnimationFrame(tick);
}

function startGame() {
  cancelAnimationFrame(state.animationFrame);
  state.runId += 1;
  clearActiveCards();
  state.running = true;
  state.deck = shuffle(buildDeck(state.selectedBatch));
  state.nextIndex = 0;
  state.seen = 0;
  state.peace = 0;
  state.chaos = 0;
  state.spawnClock = getSpawnDelay();
  state.laneCursor = 0;
  state.lastFrame = performance.now();
  state.activeInput.clear();
  state.dragging = false;
  state.dragPointerId = null;
  state.pointerTargetX = null;
  updateInputDirection();
  setPlayerPosition(50);
  updateScorebar();
  startButton.textContent = "Restart";
  setStageState("playing");
  stageMessage.classList.remove("is-final");
  setCurrentMessage(
    "Current verdict",
    "Mimi is reading the room, one suspicious bubble at a time."
  );
  for (let index = 0; index < Math.min(1, getMaxActiveCards()); index += 1) {
    spawnNextCard(-18 - index * 34);
  }
  state.spawnClock = 0;
  state.animationFrame = requestAnimationFrame(tick);
}

function selectBatch(batchName) {
  if (state.running) {
    return;
  }

  state.selectedBatch = batchName;
  batchButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.batch === batchName);
  });

  state.deck = buildDeck(batchName);
  state.seen = 0;
  state.peace = 0;
  state.chaos = 0;
  updateScorebar();
}

function selectDifficulty(difficultyName) {
  if (state.running) {
    return;
  }

  state.selectedDifficulty = difficultyName;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.difficulty === difficultyName);
  });
}

batchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectBatch(button.dataset.batch);
  });
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectDifficulty(button.dataset.difficulty);
  });
});

moveButtons.forEach((button) => {
  const direction = Number(button.dataset.move);
  const source = `button-${direction}`;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (button.setPointerCapture) {
      button.setPointerCapture(event.pointerId);
    }
    holdInput(source, direction);
  });

  button.addEventListener("pointerup", (event) => {
    if (button.hasPointerCapture && button.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    releaseInput(source);
  });

  button.addEventListener("pointercancel", () => {
    releaseInput(source);
  });
});

stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  event.preventDefault();
  state.dragging = true;
  state.dragPointerId = event.pointerId;

  if (stage.setPointerCapture) {
    stage.setPointerCapture(event.pointerId);
  }

  setPlayerFromPointer(event.clientX);
  updatePointerRun();
});

stage.addEventListener("pointermove", (event) => {
  if (!state.dragging || event.pointerId !== state.dragPointerId) {
    return;
  }

  event.preventDefault();
  setPlayerFromPointer(event.clientX);
  updatePointerRun();
});

function stopDragging(event) {
  if (event.pointerId !== state.dragPointerId) {
    return;
  }

  if (stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId);
  }

  state.dragging = false;
  state.dragPointerId = null;
  state.pointerTargetX = null;
  releaseInput("stage-drag");
}

stage.addEventListener("pointerup", stopDragging);
stage.addEventListener("pointercancel", stopDragging);

startButton.addEventListener("click", startGame);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    holdInput("key-left", -1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    holdInput("key-right", 1);
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    releaseInput("key-left");
  }

  if (event.key === "ArrowRight") {
    releaseInput("key-right");
  }
});

window.addEventListener("blur", () => {
  state.activeInput.clear();
  updateInputDirection();
});

setPlayerPosition(state.playerX);
selectBatch(state.selectedBatch);
selectDifficulty(state.selectedDifficulty);
