const data = window.mimiVillainOriginData;
const stage = document.querySelector("[data-villain-stage]");

if (!data) {
  throw new Error("Missing villain origin data. Load data.js before game.js.");
}

const state = {
  playMode: null,
  selectedCategory: null,
  selectedOrigin: null,
  reaction: null,
  chaosLevel: 0,
  lastImpact: null,
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function sample(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function getOriginsForCategory(categoryName) {
  return data.origins.filter((origin) => origin.category === categoryName);
}

function getOriginById(id) {
  return data.origins.find((origin) => origin.id === Number(id));
}

function getReactionButtons() {
  return {
    calm: choice(data.reactionButtons.calm),
    chaos: choice(data.reactionButtons.chaos),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getOriginImpact(origin) {
  const categoryBase = {
    "Food Crimes": 14,
    "Phone Betrayals": 15,
    "Public Humiliation": 16,
    "Home Inconveniences": 13,
    "Social Damage": 17,
    "Technology Betrayal": 16,
    "Weather/Comfort Crimes": 12,
    "Shopping/Public Chaos": 15,
  };

  const text = `${origin.category} ${origin.cardTitle} ${origin.teaser} ${origin.inconvenience} ${origin.villainName}`.toLowerCase();
  let impact = categoryBase[origin.category] || 14;

  if (/(calm down|declines|birthday|notification|charger|wi-fi|wifi|printer|password|customer|waiter|slowly|public|humiliation|embarrass|text|emoji|phone)/.test(text)) {
    impact += 2;
  }

  if (/(leak|stain|coin|vending|queue|cart|package|delivery|remote|battery|receipt|button|app|screen|sauce|fries|coffee|snack)/.test(text)) {
    impact += 1;
  }

  if (/(tiny|slightly|lukewarm|one angle|one important|mystery|minor)/.test(text)) {
    impact -= 1;
  }

  impact += (origin.id % 3) - 1;

  return clamp(impact, 10, 20);
}

function getChaosStage(value) {
  if (value >= 100) {
    return "Mimizilla!";
  }

  if (value >= 66) {
    return "Bringer of chaos";
  }

  if (value >= 33) {
    return "Dangerous Potato";
  }

  return "Still reasonable";
}

function applyOriginImpact(origin, reaction) {
  const amount = getOriginImpact(origin);
  const direction = reaction === "chaos" ? 1 : -1;
  const previous = state.chaosLevel;
  const current = clamp(previous + (amount * direction), 0, 100);

  state.chaosLevel = current;
  state.lastImpact = {
    amount,
    current,
    previous,
    reaction,
  };
}

function setStage(content, className = "") {
  stage.className = `villain-stage ${className}`.trim();
  stage.innerHTML = content;
}

function renderMimi(variant = "normal") {
  return `<div class="villain-mimi villain-mimi--${variant}" aria-hidden="true"><span></span></div>`;
}

function renderStart() {
  state.playMode = null;
  state.selectedCategory = null;
  state.selectedOrigin = null;
  state.reaction = null;
  state.chaosLevel = 0;
  state.lastImpact = null;

  setStage(`
    <div class="villain-panel villain-panel--center">
      ${renderMimi("normal")}
      <p class="villain-kicker">Villain origin machine</p>
      <h2>${escapeHTML(choice(data.ui.startLines))}</h2>
      <button type="button" class="primary-button villain-action" data-action="mode-choice">
        ${escapeHTML(choice(data.ui.beginButtons))}
      </button>
    </div>
  `, "villain-stage--start");
}

function renderModeChoice() {
  state.playMode = null;
  state.selectedCategory = null;
  state.selectedOrigin = null;
  state.reaction = null;
  state.chaosLevel = 0;
  state.lastImpact = null;

  setStage(`
    <div class="villain-panel villain-panel--center">
      ${renderMimi("curious")}
      <p class="villain-kicker">Choose the mechanism</p>
      <h2>How should Mimi find her breaking point?</h2>
      <div class="villain-mode-grid">
        <button type="button" class="villain-mode-card villain-mode-card--cards" data-action="category-choice">
          <span>Mystery Cards</span>
          <small>Pick a category, then choose one of three hidden inconveniences.</small>
        </button>
        <button type="button" class="villain-mode-card villain-mode-card--wheel" data-action="fate">
          <span>Misery Wheel</span>
          <small>Let fate pick one tiny disaster immediately.</small>
        </button>
      </div>
    </div>
  `, "villain-stage--mode");
}

function renderCategoryChoice() {
  state.playMode = "cards";
  state.selectedOrigin = null;
  state.reaction = null;

  const categories = data.categories.map((category) => `
    <button type="button" class="villain-category" data-action="category" data-category="${escapeHTML(category.name)}">
      <span>${escapeHTML(category.name)}</span>
    </button>
  `).join("");

  setStage(`
    <div class="villain-panel">
      <div class="villain-stage-head">
        ${renderMimi("normal")}
        <div>
          <p class="villain-kicker">Choose the crime scene</p>
          <h2>${escapeHTML(choice(data.ui.categoryIntroLines))}</h2>
        </div>
      </div>
      <div class="villain-category-grid">
        ${categories}
      </div>
      <button type="button" class="text-button" data-action="mode-choice">Back to game modes</button>
    </div>
  `, "villain-stage--choice");
}

function renderMysteryCards(categoryName) {
  state.playMode = "cards";
  state.selectedCategory = categoryName;
  state.selectedOrigin = null;
  state.reaction = null;

  const options = sample(getOriginsForCategory(categoryName), 3);
  const cards = options.map((origin, index) => `
    <button
      type="button"
      class="mystery-card-choice"
      data-action="origin"
      data-origin-id="${origin.id}"
      style="--deal-delay: ${100 + (index * 150)}ms; --deal-x: ${index === 0 ? "90px" : index === 1 ? "0px" : "-90px"}; --deal-rotate: ${index === 0 ? "-8deg" : index === 1 ? "2deg" : "8deg"};"
    >
      <span class="mystery-card">
        <span class="mystery-card__title">${escapeHTML(origin.cardTitle)}</span>
      </span>
      <span class="mystery-card-teaser">${escapeHTML(origin.teaser)}</span>
    </button>
  `).join("");

  setStage(`
    <div class="villain-panel">
      <div class="villain-stage-head villain-stage-head--compact">
        ${renderMimi("curious")}
        <div>
          <p class="villain-kicker">${escapeHTML(categoryName)}</p>
          <h2>Pick Mimi's breaking point.</h2>
        </div>
      </div>
      <div class="mystery-deck-zone">
        <div class="mystery-deck" aria-hidden="true"></div>
        <button type="button" class="text-button mystery-redeal-button" data-action="redeal" data-category="${escapeHTML(categoryName)}">
          Deal a new hand
        </button>
      </div>
      <div class="mystery-card-grid">
        ${cards}
      </div>
      <button type="button" class="text-button" data-action="category-choice">Back to categories</button>
    </div>
  `, "villain-stage--cards");
}

function renderFateSpin() {
  state.playMode = "wheel";
  state.selectedCategory = null;
  state.reaction = null;

  const origin = choice(data.origins);
  state.selectedOrigin = origin;

  setStage(`
    <div class="villain-panel villain-panel--center">
      ${renderMimi("curious")}
      <p class="villain-kicker">Fate is spinning</p>
      <div class="misery-wheel" aria-hidden="true"></div>
      <h2>${escapeHTML(choice(data.ui.wheelStopLines))}</h2>
    </div>
  `, "villain-stage--fate");

  window.setTimeout(() => {
    renderReveal(origin);
  }, 1150);
}

function renderReveal(origin) {
  state.selectedOrigin = origin;
  const buttons = getReactionButtons();

  setStage(`
    <div class="villain-panel">
      <div class="villain-stage-head">
        ${renderMimi("shocked")}
        <div>
          <p class="villain-kicker">${escapeHTML(choice(data.meter.revealLines))}</p>
          <h2>${escapeHTML(origin.inconvenience)}</h2>
        </div>
      </div>
      <div class="reaction-grid">
        <button type="button" class="reaction-button reaction-button--calm" data-action="react" data-reaction="calm">
          ${escapeHTML(buttons.calm)}
        </button>
        <button type="button" class="reaction-button reaction-button--chaos" data-action="react" data-reaction="chaos">
          ${escapeHTML(buttons.chaos)}
        </button>
      </div>
    </div>
  `, "villain-stage--reveal");
}

function renderResultActions() {
  return `
    <div class="result-actions">
      <button type="button" class="primary-button villain-action" data-action="repeat-play">
        ${escapeHTML(choice(data.ui.playAgainButtons))}
      </button>
      <button type="button" class="text-button result-menu-button" data-action="mode-choice">
        Main menu
      </button>
    </div>
  `;
}

function repeatSelectedMode() {
  if (state.playMode === "wheel") {
    renderFateSpin();
    return;
  }

  if (state.playMode === "cards" && state.selectedCategory) {
    renderMysteryCards(state.selectedCategory);
    return;
  }

  renderModeChoice();
}

function renderPersistentVillainMeter() {
  const stageLabel = getChaosStage(state.chaosLevel);
  const impact = state.lastImpact;
  const impactLabel = impact
    ? `${impact.reaction === "chaos" ? "+" : "-"}${impact.amount}% ${impact.reaction === "chaos" ? "chaos" : "calm"}`
    : "No change yet";
  const impactClass = impact ? `result-villain-meter__impact--${impact.reaction}` : "";

  return `
    <aside class="result-villain-meter" aria-label="Mimi villain meter">
      <div class="result-villain-meter__top">
        <span>Villain meter</span>
        <strong>${state.chaosLevel}%</strong>
        <small>${escapeHTML(stageLabel)}</small>
      </div>
      <div class="result-villain-meter__scale">
        <div class="result-villain-meter__track">
          <div class="result-villain-meter__fill" style="--meter-from: ${impact ? impact.previous : 0}%; --meter-height: ${state.chaosLevel}%"></div>
          <span class="result-villain-meter__tick result-villain-meter__tick--0"></span>
          <span class="result-villain-meter__tick result-villain-meter__tick--33"></span>
          <span class="result-villain-meter__tick result-villain-meter__tick--66"></span>
          <span class="result-villain-meter__tick result-villain-meter__tick--100"></span>
        </div>
        <div class="result-villain-meter__labels" aria-hidden="true">
          <span>Mimizilla!</span>
          <span>Bringer of chaos</span>
          <span>Dangerous Potato</span>
          <span>Still reasonable</span>
        </div>
      </div>
      <p class="result-villain-meter__impact ${impactClass}">${escapeHTML(impactLabel)}</p>
    </aside>
  `;
}

function renderMeter(origin) {
  const previous = state.lastImpact ? state.lastImpact.previous : 0;
  const current = state.chaosLevel;
  const impact = state.lastImpact ? state.lastImpact.amount : 0;

  setStage(`
    <div class="villain-panel villain-panel--center">
      ${renderMimi("transforming")}
      <p class="villain-kicker">${escapeHTML(choice(data.meter.transformationLines))}</p>
      <h2>Villain meter</h2>
      <div class="villain-meter">
        <div class="villain-meter__fill" data-meter-fill style="width: ${previous}%"></div>
      </div>
      <div class="villain-meter__readout" data-meter-readout>${previous}% | ${escapeHTML(getChaosStage(previous))}</div>
    </div>
  `, "villain-stage--meter");

  const fill = stage.querySelector("[data-meter-fill]");
  const readout = stage.querySelector("[data-meter-readout]");

  window.requestAnimationFrame(() => {
    fill.style.width = `${current}%`;
    readout.textContent = `${current}% | +${impact}% chaos | ${getChaosStage(current)}`;
  });

  window.setTimeout(() => renderResult(origin), 920);
}

function renderCalmResult(origin) {
  setStage(`
    <div class="villain-panel result-card">
      <div class="result-card__layout">
        <div class="result-card__content">
          <div class="result-card__hero">
            ${renderMimi("normal")}
            <div>
              <p class="villain-kicker">Villain era postponed</p>
              <h2>Mimi Remains Legally Harmless</h2>
              <p>${escapeHTML(origin.calmOutcome)}</p>
            </div>
          </div>
          <div class="result-details">
            <div><span>Origin Event</span><strong>${escapeHTML(origin.inconvenience)}</strong></div>
            <div><span>Mimi's Statement</span><strong>“I am fine in a way that will be discussed later.”</strong></div>
            <div><span>Choice Impact</span><strong>-${state.lastImpact.amount}% chaos</strong></div>
            <div><span>Current Stage</span><strong>${escapeHTML(getChaosStage(state.chaosLevel))}</strong></div>
          </div>
          ${renderResultActions()}
        </div>
        ${renderPersistentVillainMeter()}
      </div>
    </div>
  `, "villain-stage--result");
}

function renderResult(origin) {
  const threat = choice(data.ui.threatLevels);

  setStage(`
    <div class="villain-panel result-card">
      <div class="result-card__layout">
        <div class="result-card__content">
          <div class="result-card__hero">
            ${renderMimi("villain")}
            <div>
              <p class="villain-kicker">Mimi has become...</p>
              <h2>${escapeHTML(origin.villainName)}</h2>
              <p>${escapeHTML(origin.story)}</p>
            </div>
          </div>
          <div class="result-details">
            <div><span>Origin Event</span><strong>${escapeHTML(origin.inconvenience)}</strong></div>
            <div><span>Villain Power</span><strong>${escapeHTML(origin.power)}</strong></div>
            <div><span>Weakness</span><strong>${escapeHTML(origin.weakness)}</strong></div>
            <div><span>Catchphrase</span><strong>${escapeHTML(origin.catchphrase)}</strong></div>
            <div><span>Threat Level</span><strong>${escapeHTML(threat)}</strong></div>
            <div><span>Choice Impact</span><strong>+${state.lastImpact.amount}% chaos</strong></div>
          </div>
          ${renderResultActions()}
        </div>
        ${renderPersistentVillainMeter()}
      </div>
    </div>
  `, "villain-stage--result");
}

stage.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === "start") {
    renderStart();
  }

  if (action === "repeat-play") {
    repeatSelectedMode();
  }

  if (action === "mode-choice" || action === "choose-path") {
    renderModeChoice();
  }

  if (action === "category-choice") {
    renderCategoryChoice();
  }

  if (action === "category") {
    renderMysteryCards(button.dataset.category);
  }

  if (action === "redeal") {
    renderMysteryCards(button.dataset.category || state.selectedCategory);
  }

  if (action === "fate") {
    renderFateSpin();
  }

  if (action === "origin") {
    renderReveal(getOriginById(button.dataset.originId));
  }

  if (action === "react") {
    state.reaction = button.dataset.reaction;
    applyOriginImpact(state.selectedOrigin, state.reaction);

    if (state.reaction === "calm") {
      renderCalmResult(state.selectedOrigin);
    } else {
      renderMeter(state.selectedOrigin);
    }
  }
});

renderStart();
