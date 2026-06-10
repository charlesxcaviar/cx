const data = window.mimiVillainOriginData;
const stage = document.querySelector("[data-villain-stage]");

if (!data) {
  throw new Error("Missing villain origin data. Load data.js before game.js.");
}

const state = {
  selectedCategory: null,
  selectedOrigin: null,
  reaction: null,
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

function setStage(content, className = "") {
  stage.className = `villain-stage ${className}`.trim();
  stage.innerHTML = content;
}

function renderMimi(variant = "normal") {
  return `<div class="villain-mimi villain-mimi--${variant}" aria-hidden="true"><span></span></div>`;
}

function renderStart() {
  state.selectedCategory = null;
  state.selectedOrigin = null;
  state.reaction = null;

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
  const categories = data.categories.map((category) => `
    <button type="button" class="villain-category" data-action="category" data-category="${escapeHTML(category.name)}">
      <span>${escapeHTML(category.name)}</span>
      <small>${escapeHTML(category.description)}</small>
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
  state.selectedCategory = categoryName;
  const options = sample(getOriginsForCategory(categoryName), 3);
  const cards = options.map((origin) => `
    <button type="button" class="mystery-card" data-action="origin" data-origin-id="${origin.id}">
      <span>${escapeHTML(origin.cardTitle)}</span>
      <small>${escapeHTML(origin.teaser)}</small>
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
      <div class="mystery-card-grid">
        ${cards}
      </div>
      <button type="button" class="text-button" data-action="category-choice">Back to categories</button>
    </div>
  `, "villain-stage--cards");
}

function renderFateSpin() {
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

function renderMeter(origin) {
  const numericStages = data.meter.stages.filter((stageItem) => {
    const numeric = Number(stageItem.value.replace("%", ""));
    return Number.isFinite(numeric) && numeric > 0 && numeric < 100;
  });
  const stages = sample(numericStages, 4).sort((a, b) => Number(a.value.replace("%", "")) - Number(b.value.replace("%", "")));
  const sequence = [{ value: "0%", label: "Mimi is still technically normal." }, ...stages, { value: "100%", label: "VILLAIN ERA: UNREASONABLE." }];

  setStage(`
    <div class="villain-panel villain-panel--center">
      ${renderMimi("transforming")}
      <p class="villain-kicker">${escapeHTML(choice(data.meter.transformationLines))}</p>
      <h2>Villain meter</h2>
      <div class="villain-meter">
        <div class="villain-meter__fill" data-meter-fill></div>
      </div>
      <div class="villain-meter__readout" data-meter-readout>0% | Mimi is still technically normal.</div>
    </div>
  `, "villain-stage--meter");

  const fill = stage.querySelector("[data-meter-fill]");
  const readout = stage.querySelector("[data-meter-readout]");
  let index = 0;

  const timer = window.setInterval(() => {
    index += 1;
    const item = sequence[Math.min(index, sequence.length - 1)];
    const numeric = item.value.match(/\d+/);
    const width = numeric ? numeric[0] : 100;

    fill.style.width = `${width}%`;
    readout.textContent = `${item.value} | ${item.label}`;

    if (index >= sequence.length - 1) {
      window.clearInterval(timer);
      window.setTimeout(() => renderResult(origin, "chaos"), 520);
    }
  }, 520);
}

function renderCalmResult(origin) {
  setStage(`
    <div class="villain-panel result-card">
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
      </div>
      <button type="button" class="primary-button villain-action" data-action="start">
        ${escapeHTML(choice(data.ui.playAgainButtons))}
      </button>
    </div>
  `, "villain-stage--result");
}

function renderResult(origin) {
  const threat = choice(data.ui.threatLevels);

  setStage(`
    <div class="villain-panel result-card">
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
      </div>
      <button type="button" class="primary-button villain-action" data-action="start">
        ${escapeHTML(choice(data.ui.playAgainButtons))}
      </button>
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

  if (action === "mode-choice" || action === "choose-path") {
    renderModeChoice();
  }

  if (action === "category-choice") {
    renderCategoryChoice();
  }

  if (action === "category") {
    renderMysteryCards(button.dataset.category);
  }

  if (action === "fate") {
    renderFateSpin();
  }

  if (action === "origin") {
    renderReveal(getOriginById(button.dataset.originId));
  }

  if (action === "react") {
    state.reaction = button.dataset.reaction;
    if (state.reaction === "calm") {
      renderCalmResult(state.selectedOrigin);
    } else {
      renderMeter(state.selectedOrigin);
    }
  }
});

renderStart();
