const stage = document.querySelector("[data-runner-stage]");
const player = document.querySelector("[data-runner-player]");
const startButton = document.querySelector("[data-runner-start]");
const distanceValue = document.querySelector("[data-runner-distance]");
const dodgedValue = document.querySelector("[data-runner-dodged]");
const livesValue = document.querySelector("[data-runner-lives]");
const advantageValue = document.querySelector("[data-runner-advantage]");
const message = document.querySelector("[data-runner-message]");
const messageLabel = document.querySelector("[data-runner-label]");
const messageTitle = document.querySelector("[data-runner-title]");
const messageText = document.querySelector("[data-runner-text]");
const finalStats = document.querySelector("[data-runner-final]");
const controlButtons = Array.from(document.querySelectorAll("[data-runner-control]"));

const START_LIVES = 3;
const MAX_LIVES = 5;

const obstacleTypes = [
  {
    id: "bills",
    label: "BILLS!",
    lane: "ground",
    dodgeText: "Bills avoided. Financial reality can wait.",
    hitText: "A bill clipped Mimi right in the budget.",
  },
  {
    id: "laundry",
    label: "LAUNDRY!",
    lane: "ground",
    dodgeText: "Laundry remains a future-person problem.",
    hitText: "The laundry pile demanded accountability.",
  },
  {
    id: "job",
    label: "JOB!",
    lane: "air",
    dodgeText: "Mimi ducked under professional expectations.",
    hitText: "The job found her during office hours.",
  },
  {
    id: "rent",
    label: "RENT!",
    lane: "ground",
    dodgeText: "Rent was seen and respectfully avoided.",
    hitText: "Rent arrived with terrifying punctuality.",
  },
  {
    id: "dishes",
    label: "DISHES!",
    lane: "ground",
    dodgeText: "The dishes remain emotionally distant.",
    hitText: "A dish made direct contact with reality.",
  },
  {
    id: "diet",
    label: "DIET!",
    lane: "air",
    dodgeText: "Mimi ducked under a salad-shaped demand.",
    hitText: "The salad had questions and no mercy.",
  },
  {
    id: "ironing",
    label: "IRONING!",
    lane: "ground",
    dodgeText: "Wrinkles survive. Mimi survives harder.",
    hitText: "The iron brought structure. Rude.",
  },
];

const pickupTypes = [
  {
    id: "snack",
    label: "SNACK!",
    effect: "life",
    text: "Snack acquired. Mimi remembers why life continues.",
  },
  {
    id: "games",
    label: "GAMES!",
    effect: "slow",
    duration: 10,
    text: "Games acquired. Responsibilities slow down for ten glorious seconds.",
  },
  {
    id: "scrolling",
    label: "SCROLL!",
    effect: "shield",
    text: "Scrolling acquired. The next responsibility becomes background noise.",
  },
];

const resultLevels = [
  {
    min: 2600,
    title: "Professional Consequence Acrobat",
    text: "Mimi has legally outrun paperwork, laundry, and at least one salad-shaped accusation.",
  },
  {
    min: 1700,
    title: "Main Character In Motion",
    text: "The responsibilities were loud, but Mimi was louder in a tiny dramatic way.",
  },
  {
    min: 900,
    title: "Laundry Adjacent Survivor",
    text: "Mimi did not solve the problem, but she created impressive distance from it.",
  },
  {
    min: 0,
    title: "Responsibility Speed Bump",
    text: "Mimi ran bravely until real life tapped her ankle with a clipboard.",
  },
];

const state = {
  running: false,
  finished: false,
  entities: [],
  distance: 0,
  dodged: 0,
  lives: START_LIVES,
  advantageType: null,
  advantageTimer: 0,
  streak: 0,
  speed: 280,
  elapsed: 0,
  playerY: 0,
  playerVelocity: 0,
  jumpsLeft: 2,
  ducking: false,
  invincibleTimer: 0,
  obstacleClock: 0,
  pickupClock: 5.8,
  lastFrame: 0,
  animationFrame: 0,
  bestDistance: getBestDistance(),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getBestDistance() {
  try {
    return Number(localStorage.getItem("mimi-run-best") || 0);
  } catch {
    return 0;
  }
}

function saveBestDistance(value) {
  try {
    localStorage.setItem("mimi-run-best", String(value));
  } catch {
    // Local storage can be unavailable in private contexts; the game still works.
  }
}

function formatNumber(value) {
  return Math.max(0, Math.floor(value)).toLocaleString("en-US");
}

function getAdvantageLabel() {
  if (state.advantageType === "games") {
    return `Games ${Math.ceil(state.advantageTimer)}s`;
  }

  if (state.advantageType === "scrolling") {
    return "Scroll 1x";
  }

  return "None";
}

function setAdvantage(type, duration = 0) {
  state.advantageType = type;
  state.advantageTimer = duration;
}

function clearAdvantage() {
  state.advantageType = null;
  state.advantageTimer = 0;
}

function setStageState(stageState) {
  stage.classList.remove("is-idle", "is-playing", "is-finished");
  stage.classList.add(`is-${stageState}`);
}

function setMessage(label, title, text) {
  message.classList.remove("is-final");
  messageLabel.textContent = label;
  messageTitle.textContent = title;
  messageText.textContent = text;
  finalStats.hidden = true;
}

function updateScorebar() {
  distanceValue.textContent = formatNumber(state.distance);
  dodgedValue.textContent = state.dodged;
  livesValue.textContent = state.lives;
  advantageValue.textContent = getAdvantageLabel();
}

function getGroundBottom() {
  return stage.clientWidth < 560 ? 52 : 66;
}

function getEntityBottom(entity) {
  if (entity.kind === "pickup") {
    return getGroundBottom() + (entity.lane === "air" ? 108 : 54);
  }

  return entity.lane === "air" ? getGroundBottom() + 58 : getGroundBottom();
}

function setPlayerVisual() {
  player.style.setProperty("--runner-y", `${state.playerY}px`);
  player.classList.toggle("is-ducking", state.ducking && state.playerY < 4);
  player.classList.toggle("is-jumping", state.playerY > 4);
  player.classList.toggle("is-protected", state.invincibleTimer > 0 || state.advantageType === "scrolling");
  stage.classList.toggle("has-game-advantage", state.advantageType === "games");
}

function clearEntities() {
  state.entities.forEach((entity) => entity.element.remove());
  state.entities = [];
}

function resetState() {
  clearEntities();
  state.running = false;
  state.finished = false;
  state.distance = 0;
  state.dodged = 0;
  state.lives = START_LIVES;
  clearAdvantage();
  state.streak = 0;
  state.speed = 280;
  state.elapsed = 0;
  state.playerY = 0;
  state.playerVelocity = 0;
  state.jumpsLeft = 2;
  state.ducking = false;
  state.invincibleTimer = 0;
  state.obstacleClock = 0.6;
  state.pickupClock = 4.8;
  state.lastFrame = 0;
  stage.classList.remove("is-flow", "has-game-advantage");
  player.classList.remove("react-hit", "react-good", "is-defeated");
  setPlayerVisual();
  updateScorebar();
}

function startGame() {
  cancelAnimationFrame(state.animationFrame);
  resetState();
  state.running = true;
  setStageState("playing");
  startButton.textContent = "Run again";
  setMessage("Mimi status", "Currently escaping consequences", "Jump red circles, duck high red circles, take green circles.");
  stage.focus({ preventScroll: true });
  state.lastFrame = performance.now();
  state.animationFrame = requestAnimationFrame(loop);
}

function getEntityMarkup(entity) {
  return `
    <span>${entity.label}</span>
    <b class="runner-symbol runner-symbol--${entity.id}" aria-hidden="true"></b>
  `;
}

function spawnObstacle() {
  const type = choice(obstacleTypes);
  const element = document.createElement("div");
  const entity = {
    kind: "obstacle",
    id: type.id,
    lane: type.lane,
    label: type.label,
    dodgeText: type.dodgeText,
    hitText: type.hitText,
    x: stage.clientWidth + 70,
    hit: false,
    passed: false,
    hintShown: false,
    element,
  };

  element.className = `runner-entity runner-obstacle runner-obstacle--${type.id} runner-entity--${type.lane}`;
  element.innerHTML = getEntityMarkup(entity);
  stage.append(element);
  updateEntityElement(entity);
  state.entities.push(entity);
}

function spawnPickup() {
  const type = choice(pickupTypes);
  const lane = Math.random() > 0.35 ? "air" : "ground";
  const element = document.createElement("div");
  const entity = {
    kind: "pickup",
    id: type.id,
    lane,
    label: type.label,
    effect: type.effect,
    duration: type.duration || 0,
    text: type.text,
    x: stage.clientWidth + 90,
    hit: false,
    passed: false,
    hintShown: false,
    element,
  };

  element.className = `runner-entity runner-pickup runner-pickup--${type.id} runner-entity--${lane}`;
  element.innerHTML = getEntityMarkup(entity);
  stage.append(element);
  updateEntityElement(entity);
  state.entities.push(entity);
}

function updateEntityElement(entity) {
  entity.element.style.bottom = `${getEntityBottom(entity)}px`;
  entity.element.style.transform = `translate3d(${entity.x}px, 0, 0)`;
}

function getRelativeRect(element) {
  const stageRect = stage.getBoundingClientRect();
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left - stageRect.left,
    right: rect.right - stageRect.left,
    top: rect.top - stageRect.top,
    bottom: rect.bottom - stageRect.top,
    width: rect.width,
  };
}

function intersects(first, second, padding = 8) {
  return !(
    first.right - padding < second.left + padding ||
    first.left + padding > second.right - padding ||
    first.bottom - padding < second.top + padding ||
    first.top + padding > second.bottom - padding
  );
}

function showPop(text, x, y, variant = "good") {
  const pop = document.createElement("div");
  pop.className = `runner-pop runner-pop--${variant}`;
  pop.textContent = text;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  stage.append(pop);
  window.setTimeout(() => pop.remove(), 760);
}

function showActionHint(text, variant = "bad") {
  const playerRect = getRelativeRect(player);
  const hint = document.createElement("div");
  hint.className = `runner-action-hint runner-action-hint--${variant}`;
  hint.textContent = text;
  hint.style.left = `${playerRect.left + (playerRect.width / 2)}px`;
  hint.style.top = `${playerRect.top - 10}px`;
  stage.append(hint);
  window.setTimeout(() => hint.remove(), 720);
}

function reactPlayer(variant) {
  player.classList.remove("react-hit", "react-good");
  void player.offsetWidth;
  player.classList.add(variant === "hit" ? "react-hit" : "react-good");
}

function jump() {
  if (!state.running) {
    startGame();
    return;
  }

  if (state.jumpsLeft <= 0 || state.ducking) {
    return;
  }

  state.playerVelocity = state.jumpsLeft === 2 ? 720 : 590;
  state.jumpsLeft -= 1;
  state.ducking = false;
  setPlayerVisual();
}

function setDuck(active) {
  if (!state.running) {
    return;
  }

  state.ducking = active && state.playerY < 8;
  setPlayerVisual();
}

function handleObstacleHit(entity, playerRect) {
  entity.hit = true;
  entity.element.classList.add("is-hit");

  if (state.invincibleTimer > 0) {
    state.dodged += 1;
    state.streak += 1;
    showPop("safe", playerRect.left + 48, playerRect.top, "good");
    return;
  }

  if (state.advantageType === "scrolling") {
    clearAdvantage();
    state.invincibleTimer = 0.55;
    state.dodged += 1;
    state.streak += 1;
    reactPlayer("good");
    setMessage("Scrolling shield", "Responsibility ignored", "The next problem became background noise.");
    showPop("free dodge", playerRect.left + 48, playerRect.top, "good");
    return;
  }

  state.lives = clamp(state.lives - 1, 0, MAX_LIVES);
  state.streak = 0;
  state.invincibleTimer = 0.85;
  reactPlayer("hit");
  setMessage("Responsibility contact", entity.label, entity.hitText);
  showPop("-1 life", playerRect.left + 42, playerRect.top, "bad");

  if (state.lives <= 0) {
    finishGame(`${entity.label} caught Mimi.`);
  }
}

function handlePickup(entity, playerRect) {
  entity.hit = true;
  entity.element.classList.add("is-collected");
  reactPlayer("good");

  if (entity.effect === "life") {
    state.lives = clamp(state.lives + 1, 0, MAX_LIVES);
    showPop("+1 life", playerRect.left + 46, playerRect.top, "good");
  }

  if (entity.effect === "slow") {
    setAdvantage("games", entity.duration);
    showPop("slow 10s", playerRect.left + 46, playerRect.top, "good");
  }

  if (entity.effect === "shield") {
    setAdvantage("scrolling");
    showPop("free dodge", playerRect.left + 46, playerRect.top, "good");
  }

  setMessage("Pickup", entity.label, entity.text);
}

function handleDodge(entity, playerRect) {
  entity.passed = true;
  state.dodged += 1;
  state.streak += 1;
  state.distance += 28 + Math.min(state.streak * 3, 45);

  if (state.streak % 5 === 0) {
    stage.classList.add("is-flow");
    setMessage("Main character streak", `${state.streak} in a row`, "Mimi is moving like the credits are already rolling.");
    showPop(`${state.streak} streak`, playerRect.left + 54, playerRect.top, "good");
  } else if (Math.random() > 0.6) {
    setMessage("Dodged", entity.label, entity.dodgeText);
  }
}

function updateActionHints() {
  const triggerX = stage.clientWidth < 560 ? 250 : 390;

  state.entities.forEach((entity) => {
    if (entity.hintShown || entity.hit || entity.passed || entity.x > triggerX || entity.x < 76) {
      return;
    }

    entity.hintShown = true;

    if (entity.kind === "pickup") {
      showActionHint("Take!", "good");
      return;
    }

    showActionHint(entity.lane === "air" ? "Duck!" : "Jump!", "bad");
  });
}

function updateCollisions() {
  const playerRect = getRelativeRect(player);

  state.entities.forEach((entity) => {
    if (entity.hit) {
      return;
    }

    const entityRect = getRelativeRect(entity.element);

    if (intersects(playerRect, entityRect, entity.kind === "pickup" ? 2 : 8)) {
      if (entity.kind === "pickup") {
        handlePickup(entity, playerRect);
      } else {
        handleObstacleHit(entity, playerRect);
      }
      return;
    }

    if (entity.kind === "obstacle" && !entity.passed && entityRect.right < playerRect.left) {
      handleDodge(entity, playerRect);
    }
  });
}

function getEffectiveSpeed() {
  return state.speed * (state.advantageType === "games" ? 0.58 : 1);
}

function updateEntities(delta) {
  const speed = getEffectiveSpeed();

  state.entities.forEach((entity) => {
    entity.x -= speed * delta;
    updateEntityElement(entity);
  });

  state.entities = state.entities.filter((entity) => {
    const keep = entity.x > -190 && !(entity.hit && entity.x < stage.clientWidth - 160);

    if (!keep) {
      entity.element.remove();
    }

    return keep;
  });
}

function updateSpawning(delta) {
  const obstacleDelta = delta * (state.advantageType === "games" ? 0.52 : 1);
  state.obstacleClock -= obstacleDelta;
  state.pickupClock -= delta;

  if (state.obstacleClock <= 0) {
    spawnObstacle();
    const pressure = Math.min(state.elapsed / 70, 0.38);
    state.obstacleClock = 1.08 - pressure + (Math.random() * 0.34);
  }

  if (state.pickupClock <= 0) {
    spawnPickup();
    state.pickupClock = 6.4 + (Math.random() * 3.6);
  }
}

function updatePlayer(delta) {
  state.playerVelocity -= 1900 * delta;
  state.playerY += state.playerVelocity * delta;

  if (state.playerY <= 0) {
    state.playerY = 0;
    state.playerVelocity = 0;
    state.jumpsLeft = 2;
  }

  if (state.playerY > 0) {
    state.ducking = false;
  }

  setPlayerVisual();
}

function updateAdvantage(delta) {
  if (state.advantageType !== "games") {
    return;
  }

  state.advantageTimer -= delta;

  if (state.advantageTimer <= 0) {
    clearAdvantage();
  }
}

function loop(timestamp) {
  if (!state.running) {
    return;
  }

  const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.032);
  state.lastFrame = timestamp;
  state.elapsed += delta;
  state.speed = Math.min(280 + (state.elapsed * 6.8), 560);
  state.distance += state.speed * delta * (state.streak >= 8 ? 0.16 : 0.12);
  state.invincibleTimer = Math.max(0, state.invincibleTimer - delta);

  if (state.streak < 5) {
    stage.classList.remove("is-flow");
  }

  updateAdvantage(delta);
  updatePlayer(delta);
  updateSpawning(delta);
  updateEntities(delta);
  updateActionHints();
  updateCollisions();
  setPlayerVisual();
  updateScorebar();

  state.animationFrame = requestAnimationFrame(loop);
}

function getResult() {
  const distance = Math.floor(state.distance);
  return resultLevels.find((level) => distance >= level.min) || resultLevels[resultLevels.length - 1];
}

function finishGame(reason) {
  if (!state.running) {
    return;
  }

  state.running = false;
  state.finished = true;
  cancelAnimationFrame(state.animationFrame);
  setStageState("finished");
  player.classList.add("is-defeated");
  stage.classList.remove("is-flow", "has-game-advantage");

  const finalDistance = Math.floor(state.distance);
  if (finalDistance > state.bestDistance) {
    state.bestDistance = finalDistance;
    saveBestDistance(finalDistance);
  }

  const result = getResult();
  message.classList.add("is-final");
  messageLabel.textContent = reason;
  messageTitle.textContent = result.title;
  messageText.textContent = result.text;
  finalStats.hidden = false;
  finalStats.innerHTML = `
    <span>${formatNumber(finalDistance)} distance</span>
    <span>${state.dodged} dodged</span>
    <span>${formatNumber(state.bestDistance)} best</span>
  `;
  startButton.textContent = "Run again";
}

function handleKeyDown(event) {
  if (event.repeat && event.key !== "ArrowDown" && event.key.toLowerCase() !== "s") {
    return;
  }

  if (event.code === "Space" || event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    event.preventDefault();
    jump();
  }

  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    event.preventDefault();
    setDuck(true);
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    setDuck(false);
  }
}

startButton.addEventListener("click", startGame);

stage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  jump();
});

controlButtons.forEach((button) => {
  const control = button.dataset.runnerControl;

  if (control === "jump") {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      jump();
    });
  }

  if (control === "duck") {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setDuck(true);
    });
    button.addEventListener("pointerup", () => setDuck(false));
    button.addEventListener("pointercancel", () => setDuck(false));
    button.addEventListener("pointerleave", () => setDuck(false));
  }
});

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => setDuck(false));

resetState();
