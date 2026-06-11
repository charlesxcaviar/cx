const stage = document.querySelector("[data-door-stage]");
const openedValue = document.querySelector("[data-door-opened]");
const luckValue = document.querySelector("[data-door-luck]");
const loreValue = document.querySelector("[data-door-lore]");
const chaosValue = document.querySelector("[data-door-chaos]");

const doorStyles = ["sunset", "mint", "storm", "velvet", "banana", "aqua"];

const doorPersonalities = [
  "humming politely",
  "too clean",
  "slightly warm",
  "wearing confidence",
  "smells like glitter",
  "breathing suspiciously",
  "has tiny paperwork",
  "knows your screen time",
  "vibrating with lore",
  "quietly judging",
  "has a dramatic knob",
  "probably unionized",
];

const outcomePools = {
  blessing: [
    {
      title: "Emergency Main Character Lighting",
      text: "A soft spotlight follows Mimi for the next 12 minutes. No one knows who installed it.",
      badge: "Blessing",
    },
    {
      title: "Snack Appears From Nowhere",
      text: "Mimi receives a snack with no receipt, no explanation, and excellent timing.",
      badge: "Blessing",
    },
    {
      title: "The Queue Moves Faster",
      text: "Every line Mimi stands in becomes briefly cooperative. Society is confused but grateful.",
      badge: "Blessing",
    },
    {
      title: "Perfect Hair Immunity",
      text: "Wind attempts sabotage and fails. Mimi becomes mildly unbearable about it.",
      badge: "Blessing",
    },
    {
      title: "Tiny Administrative Miracle",
      text: "A form fills itself out correctly. Mimi does not ask questions. That is growth.",
      badge: "Blessing",
    },
    {
      title: "Compliment From a Stranger",
      text: "Someone says Mimi looks well-rested. This is legally inaccurate, but emotionally useful.",
      badge: "Blessing",
    },
  ],
  prophecy: [
    {
      title: "The Next Song Is a Sign",
      text: "The universe will communicate through shuffle mode. Mimi will absolutely overinterpret it.",
      badge: "Prophecy",
    },
    {
      title: "A Receipt Will Matter",
      text: "A tiny paper rectangle will become evidence. Keep it, even if it looks useless.",
      badge: "Prophecy",
    },
    {
      title: "Three Notifications Approach",
      text: "One is harmless, one is admin, and one has emotional side effects.",
      badge: "Prophecy",
    },
    {
      title: "The Vibe Will Shift at 4:07",
      text: "No one will know why. Mimi will nod like this was expected.",
      badge: "Prophecy",
    },
    {
      title: "Beware the Confident Puddle",
      text: "It is deeper than it looks and has personal ambitions.",
      badge: "Prophecy",
    },
    {
      title: "The Group Chat Will Summon You",
      text: "Silence is not protection. The chat has already chosen a representative.",
      badge: "Prophecy",
    },
  ],
  insult: [
    {
      title: "The Door Calls Mimi Buffering",
      text: "Mimi is accused of loading at 78%. She denies this while visibly processing.",
      badge: "Insult",
    },
    {
      title: "A Tiny Voice Says 'Interesting Outfit'",
      text: "The tone is legally suspicious. Mimi files this under fashion crimes.",
      badge: "Insult",
    },
    {
      title: "The Knob Says 'Be So For Real'",
      text: "The door hardware has overstepped. Mimi will remember this during awards season.",
      badge: "Insult",
    },
    {
      title: "A Plaque Reads 'Side Character Entrance'",
      text: "Mimi gasps like someone has challenged the entire brand.",
      badge: "Insult",
    },
    {
      title: "The Door Rates Her Posture",
      text: "Three out of ten. Unsolicited. Deeply rude. Technically not wrong.",
      badge: "Insult",
    },
    {
      title: "The Door Asks If She Has Tried Water",
      text: "Mimi has, spiritually. The accusation is still hurtful.",
      badge: "Insult",
    },
  ],
  crisis: [
    {
      title: "Tiny Crisis: Sock Betrayal",
      text: "One sock slides halfway off inside Mimi's shoe. The day changes genre.",
      badge: "Tiny crisis",
    },
    {
      title: "Tiny Crisis: Password Reset",
      text: "The security question asks who Mimi was in 2014. No one survives this honestly.",
      badge: "Tiny crisis",
    },
    {
      title: "Tiny Crisis: Wet Sleeve",
      text: "A sink splashes with malicious accuracy. Mimi briefly considers a rebrand.",
      badge: "Tiny crisis",
    },
    {
      title: "Tiny Crisis: Phone at 1%",
      text: "The charger is somewhere dramatic and unavailable.",
      badge: "Tiny crisis",
    },
    {
      title: "Tiny Crisis: Public Stomach Noise",
      text: "A room goes quiet for one second too long. Mimi enters witness protection emotionally.",
      badge: "Tiny crisis",
    },
    {
      title: "Tiny Crisis: The Bag Handle Snaps",
      text: "Everything survives except trust. Mimi now believes in omens.",
      badge: "Tiny crisis",
    },
  ],
};

const outcomeMeta = {
  blessing: {
    label: "Blessing",
    icon: "+",
    mimi: "happy",
    effect: { luck: 2, lore: 0, chaos: -1 },
    reveal: "The door chooses mercy.",
  },
  prophecy: {
    label: "Prophecy",
    icon: "?",
    mimi: "curious",
    effect: { luck: 0, lore: 2, chaos: 1 },
    reveal: "The door says this will make sense later.",
  },
  insult: {
    label: "Insult",
    icon: "!",
    mimi: "offended",
    effect: { luck: -1, lore: 1, chaos: 2 },
    reveal: "The door wakes up and chooses disrespect.",
  },
  crisis: {
    label: "Tiny Crisis",
    icon: "*",
    mimi: "shocked",
    effect: { luck: -1, lore: 0, chaos: 3 },
    reveal: "The door opens directly into a problem.",
  },
};

const state = {
  opened: 0,
  luck: 0,
  lore: 0,
  chaos: 0,
  round: [],
  selectedDoor: null,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}

function updateScorebar() {
  openedValue.textContent = state.opened;
  luckValue.textContent = state.luck;
  loreValue.textContent = state.lore;
  chaosValue.textContent = state.chaos;
}

function getFateTitle() {
  if (state.chaos >= 10) {
    return "Mimi is becoming door lore";
  }

  if (state.luck >= 8) {
    return "Mimi is suspiciously blessed";
  }

  if (state.lore >= 8) {
    return "Mimi has too many prophecies";
  }

  if (state.opened >= 4) {
    return "Mimi is developing a door habit";
  }

  return "Choose a suspicious door";
}

function renderMimi(variant = "normal") {
  return `<div class="door-mimi door-mimi--${variant}" aria-hidden="true"><span></span></div>`;
}

function buildRound() {
  const types = shuffle(["blessing", "prophecy", "insult", "crisis"]);
  const personalities = shuffle(doorPersonalities);
  const styles = shuffle(doorStyles);

  state.round = types.map((type, index) => ({
    id: index + 1,
    type,
    style: styles[index % styles.length],
    personality: personalities[index],
    outcome: choice(outcomePools[type]),
  }));
  state.selectedDoor = null;
}

function renderStage() {
  const doors = state.round.map((door) => `
    <button
      type="button"
      class="suspicious-door suspicious-door--${escapeHTML(door.style)}"
      data-door-id="${door.id}"
      aria-label="Open door ${door.id}"
    >
      <span class="suspicious-door__number">${door.id}</span>
      <span class="suspicious-door__shape">
        <span class="suspicious-door__knob"></span>
      </span>
      <span class="suspicious-door__plaque">${escapeHTML(door.personality)}</span>
    </button>
  `).join("");

  stage.className = "door-stage is-choosing";
  stage.innerHTML = `
    <div class="door-backdrop" aria-hidden="true"></div>
    <div class="door-stage-head">
      ${renderMimi("normal")}
      <div>
        <p class="door-kicker">Round ${state.opened + 1}</p>
        <h2>${escapeHTML(getFateTitle())}</h2>
        <p>One door is kind, one is rude, one is ominous, and one has a tiny crisis holding a clipboard.</p>
      </div>
    </div>
    <div class="door-grid" aria-label="Suspicious doors">
      ${doors}
    </div>
    <div class="door-footer">
      <button type="button" class="text-button" data-door-action="shuffle">Shuffle the hallway</button>
      <button type="button" class="text-button" data-door-action="reset">Reset fate</button>
    </div>
  `;
}

function startRound() {
  buildRound();
  renderStage();
  updateScorebar();
}

function applyOutcome(type) {
  const effect = outcomeMeta[type].effect;
  state.opened += 1;
  state.luck = clamp(state.luck + effect.luck, 0, 99);
  state.lore = clamp(state.lore + effect.lore, 0, 99);
  state.chaos = clamp(state.chaos + effect.chaos, 0, 99);
}

function getStatLine(type) {
  const effect = outcomeMeta[type].effect;
  const parts = [];

  if (effect.luck !== 0) {
    parts.push(`${effect.luck > 0 ? "+" : ""}${effect.luck} luck`);
  }

  if (effect.lore !== 0) {
    parts.push(`${effect.lore > 0 ? "+" : ""}${effect.lore} lore`);
  }

  if (effect.chaos !== 0) {
    parts.push(`${effect.chaos > 0 ? "+" : ""}${effect.chaos} chaos`);
  }

  return parts.join(" | ");
}

function getDoorById(id) {
  return state.round.find((door) => door.id === Number(id));
}

function revealDoor(id) {
  const door = getDoorById(id);

  if (!door || state.selectedDoor) {
    return;
  }

  state.selectedDoor = door;
  applyOutcome(door.type);
  updateScorebar();

  const meta = outcomeMeta[door.type];
  const unpicked = state.round
    .filter((item) => item.id !== door.id)
    .map((item) => `<span>${item.id}: ${escapeHTML(outcomeMeta[item.type].label)}</span>`)
    .join("");

  stage.className = `door-stage is-revealed door-stage--${door.type}`;
  stage.innerHTML = `
    <div class="door-backdrop" aria-hidden="true"></div>
    <div class="door-result-layout">
      <div class="door-open-scene">
        <div class="door-result-mimi">
          ${renderMimi(meta.mimi)}
        </div>
        <div class="opened-door opened-door--${escapeHTML(door.style)} opened-door--${door.type}" aria-hidden="true">
          <span>${escapeHTML(meta.icon)}</span>
        </div>
      </div>
      <div class="door-result-card">
        <p class="door-kicker">${escapeHTML(meta.reveal)}</p>
        <h2>${escapeHTML(door.outcome.title)}</h2>
        <p>${escapeHTML(door.outcome.text)}</p>
        <div class="door-result-badge door-result-badge--${door.type}">
          ${escapeHTML(door.outcome.badge)} | ${escapeHTML(getStatLine(door.type))}
        </div>
        <div class="door-other-outcomes" aria-label="Other doors">
          ${unpicked}
        </div>
        <div class="door-actions">
          <button type="button" class="primary-button" data-door-action="next">Pick another door</button>
          <button type="button" class="text-button result-menu-button" data-door-action="reset">Reset fate</button>
        </div>
      </div>
    </div>
  `;
}

function resetGame() {
  state.opened = 0;
  state.luck = 0;
  state.lore = 0;
  state.chaos = 0;
  startRound();
}

stage.addEventListener("click", (event) => {
  const doorButton = event.target.closest("[data-door-id]");

  if (doorButton) {
    revealDoor(doorButton.dataset.doorId);
    return;
  }

  const actionButton = event.target.closest("[data-door-action]");

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.doorAction;

  if (action === "next" || action === "shuffle") {
    startRound();
  }

  if (action === "reset") {
    resetGame();
  }
});

resetGame();
