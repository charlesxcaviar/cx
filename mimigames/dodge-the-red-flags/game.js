const stage = document.querySelector("[data-stage]");
const player = document.querySelector("[data-player]");
const seenValue = document.querySelector("[data-seen]");
const peaceValue = document.querySelector("[data-peace]");
const chaosValue = document.querySelector("[data-chaos]");
const moodValue = document.querySelector("[data-mood]");
const startButton = document.querySelector("[data-start]");
const resultTitle = document.querySelector("[data-result-title]");
const resultText = document.querySelector("[data-result-text]");
const moveButtons = Array.from(document.querySelectorAll("[data-move]"));
const batchButtons = Array.from(document.querySelectorAll("[data-batch]"));

const behaviorPairs = {
  guy: [
    ["Mattress on the floor", "Fresh clean sheets"],
    ["Uses ex's Netflix", "Pays his own bills"],
    ["\"U up?\" at 2 AM", "Replies the same day"],
    ["Lives on energy drinks", "Drinks actual water"],
    ["Calls every ex crazy", "Speaks respectfully"],
    ["37 unfinished side hustles", "Finishes what he starts"],
    ["One towel for everything", "Owns multiple towels"],
    ["Owns a sigma course", "Has real hobbies"],
    ["Daily gym mirror selfies", "Asks about your day"],
    ["\"Emotionally unavailable\"", "Communicates clearly"],
    ["Borrows money, forgets", "Pays people back"],
    ["Started 12 podcasts", "Keeps commitments"],
    ["Brags about no sleep", "Takes care of himself"],
    ["Microwaves frozen pizza", "Can cook a meal"],
    ["Ghosts for 3 days", "Says when he's busy"],
    ["Road rage in parking lots", "Stays calm under pressure"],
    ["Never returns shopping carts", "Returns shopping carts"],
    ["Treats waiters badly", "Treats everyone well"],
    ["Three decorative katanas", "Owns a vacuum cleaner"],
    ["Always on 2% battery", "Charges before leaving"],
    ["Never reads instructions", "Builds furniture correctly"],
    ["Crypto but no chair", "Owns a chair"],
    ["Car sounds like boss fight", "Uses turn signals"],
    ["Thinks deodorant is optional", "Smells nice"],
    ["Forgets your birthday", "Remembers little things"],
    ["Follows 8,000 influencers", "Follows through on plans"],
    ["Trust me, bro", "Admits when he's wrong"],
    ["Christmas lights in July", "Changes smoke alarm batteries"],
    ["Calls himself alpha", "Confident without labels"],
    ["\"Could've gone pro\"", "Enjoys life as is"],
    ["Argues with customer service", "Kind to service workers"],
    ["Proudly doesn't read books", "Loves learning"],
    ["Asks for gas money", "Plans thoughtful dates"],
    ["Owns 14 gaming headsets", "Owns matching bedsheets"],
    ["\"Women are complicated\"", "Actually listens"],
    ["Entrepreneur in bio only", "Has a steady job"],
    ["Phone always face down", "Nothing to hide"],
    ["Flirts with every cashier", "Makes you feel special"],
    ["Never deletes old food", "Cleans the fridge"],
    ["Peak male podcast addict", "Thinks for himself"],
  ],
  girl: [
    ["\"Live, Laugh, Love\" wall decal", "Has actual hobbies"],
    ["Owns 14 water bottles", "Drinks from one"],
    ["Says \"he's just a friend\"", "Sets clear boundaries"],
    ["Buys plants, forgets plants", "Keeps plants alive"],
    ["Makes TikToks in public", "Feels no need to perform"],
    ["Has 37 skincare products", "Uses the ones she owns"],
    ["Sends \"k.\"", "Uses complete sentences"],
    ["Starts a fight in a dream", "Separates dreams from reality"],
    ["Keeps emergency exes", "Keeps healthy boundaries"],
    ["Three-hour photo shoot", "Enjoys the actual trip"],
    ["Orders salad, eats your fries", "Orders her own fries"],
    ["Says \"I'm literally crazy\"", "Emotionally stable"],
    ["Owns a ring light", "Owns a bookshelf"],
    ["Has 9 tote bags", "Uses a tote bag"],
    ["Makes friends hate her boyfriend", "Keeps her own opinions"],
    ["Posts cryptic sad quotes", "Talks about problems directly"],
    ["\"Do whatever you want\"", "Says what she wants"],
    ["Astrology before accountability", "Takes responsibility"],
    ["Needs 84 photos of brunch", "Eats brunch while warm"],
    ["Buys crystals for everything", "Solves problems normally"],
    ["Has an emotional support Stanley Cup", "Drinks water from a cup"],
    ["Says \"all my exes were toxic\"", "Learns from relationships"],
    ["Flirts for free desserts", "Pays for dessert"],
    ["Turns every outing into content", "Lives in the moment"],
    ["Screenshots every conversation", "Respects privacy"],
    ["Tests your loyalty weekly", "Trusts until proven otherwise"],
    ["Online shops when sad", "Has a savings account"],
    ["Treats Sephora like therapy", "Has healthier coping skills"],
    ["Calls herself a princess", "Treats others like royalty too"],
    ["Checks your location hourly", "Has her own life"],
    ["Uses baby voice on adults", "Speaks like an adult"],
    ["Creates fake scenarios", "Asks direct questions"],
    ["Makes waiters retake photos", "Says thank you"],
    ["Thinks red flags are projects", "Walks away when needed"],
    ["Owns six identical beige sweaters", "Has a personality"],
    ["Makes her dog an Instagram manager", "Just loves her dog"],
    ["Says \"girl math\" for everything", "Knows where money went"],
    ["Needs a committee to choose dinner", "Makes a decision"],
    ["Keeps gifts from every situationship", "Declutters regularly"],
    ["Sends 47 voice notes", "Gets to the point"],
  ],
};

const state = {
  running: false,
  selectedBatch: "guy",
  deck: [],
  activeCards: [],
  nextIndex: 0,
  seen: 0,
  peace: 0,
  chaos: 0,
  playerX: 50,
  inputX: 0,
  activeInput: new Map(),
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

function buildDeck(batchName) {
  const pairs = batchName === "mixed"
    ? [...behaviorPairs.guy, ...behaviorPairs.girl]
    : behaviorPairs[batchName];

  return pairs.flatMap(([red, green]) => [
    { kind: "red", text: red },
    { kind: "green", text: green },
  ]);
}

function getLanePositions() {
  return stage.clientWidth < 560 ? [28, 72] : [17, 39, 61, 83];
}

function getMaxActiveCards() {
  return stage.clientWidth < 560 ? 1 : 3;
}

function getSpawnDelay() {
  return stage.clientWidth < 560 ? 2.45 : 2.1;
}

function getAvailableLane() {
  const lanes = getLanePositions();

  for (let offset = 0; offset < lanes.length; offset += 1) {
    const index = (state.laneCursor + offset) % lanes.length;
    const lane = lanes[index];
    const blocked = state.activeCards.some((active) => (
      !active.resolved && Math.abs(active.x - lane) < 1 && active.y < 24
    ));

    if (!blocked) {
      state.laneCursor = (index + 1) % lanes.length;
      return lane;
    }
  }

  return null;
}

function setPlayerPosition(value) {
  state.playerX = clamp(value, 8, 92);
  player.style.left = `calc(${state.playerX}% - 36px)`;
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
  const ending = score > 0
    ? "Mimi survived with standards intact."
    : score < 0
      ? "Mimi is emotionally holding a tiny fire extinguisher."
      : "Mimi remains neutral, which is suspiciously mature.";

  state.running = false;
  cancelAnimationFrame(state.animationFrame);
  updateScorebar();
  startButton.textContent = "Play again";
  resultTitle.textContent = "Final score";
  resultText.textContent = `${ending} Peace: ${state.peace}. Chaos: ${state.chaos}. Score: ${score}.`;
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
    speed: 7.5 + Math.random() * 2.5,
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
      state.chaos += 1;
      active.element.classList.add("is-red");
      resultTitle.textContent = "Red flag collected";
      resultText.textContent = `"${active.item.text}" has entered Mimi's emotional file cabinet.`;
    } else {
      state.peace += 1;
      active.element.classList.add("is-green");
      resultTitle.textContent = "Green flag collected";
      resultText.textContent = `"${active.item.text}" restored one tiny unit of faith.`;
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
    resultTitle.textContent = "Red flag dodged";
    resultText.textContent = `"${active.item.text}" drifted away without touching Mimi's peace.`;
  } else {
    resultTitle.textContent = "Green flag missed";
    resultText.textContent = `"${active.item.text}" was healthy, and tragically, just out of reach.`;
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
  updateInputDirection();
  setPlayerPosition(50);
  updateScorebar();
  startButton.textContent = "Restart";
  resultTitle.textContent = "Current verdict";
  resultText.textContent = "Mimi is neutral, observant, and trying not to collect suspicious behavior.";
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

batchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectBatch(button.dataset.batch);
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
