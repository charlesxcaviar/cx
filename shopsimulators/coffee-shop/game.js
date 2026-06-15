(function () {
  "use strict";

  const SAVE_KEY = "shopSimulatorsCoffeeShopV1";

  const dom = {
    cash: document.getElementById("cashValue"),
    profit: document.getElementById("profitValue"),
    served: document.getElementById("servedValue"),
    reputation: document.getElementById("reputationValue"),
    milestoneName: document.getElementById("milestoneName"),
    milestoneProgress: document.getElementById("milestoneProgress"),
    nextMilestone: document.getElementById("nextMilestone"),
    shopScene: document.getElementById("shopScene"),
    customerLane: document.getElementById("customerLane"),
    salePopLayer: document.getElementById("salePopLayer"),
    serveButton: document.getElementById("serveButton"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton"),
    queueCount: document.getElementById("queueCount"),
    orderList: document.getElementById("orderList"),
    stockGrid: document.getElementById("stockGrid"),
    upgradeGrid: document.getElementById("upgradeGrid"),
    activityLine: document.getElementById("activityLine")
  };

  const defaultState = {
    money: 65,
    todayProfit: 0,
    totalEarned: 0,
    served: 0,
    missed: 0,
    reputation: 100,
    supplies: {
      beans: 9,
      cups: 10,
      milk: 4,
      pastries: 0
    },
    upgrades: {
      machine: 0,
      pastry: 0,
      sign: 0,
      grinder: 0,
      barista: 0,
      seating: 0,
      loyalty: 0,
      nitro: 0
    },
    queue: [],
    lastSaved: null
  };

  const stockItems = [
    {
      id: "beans",
      name: "Coffee Beans",
      amount: 12,
      cost: 18,
      label: "12 servings"
    },
    {
      id: "cups",
      name: "Paper Cups",
      amount: 16,
      cost: 12,
      label: "16 cups"
    },
    {
      id: "milk",
      name: "Cold Milk",
      amount: 10,
      cost: 20,
      label: "10 pours"
    },
    {
      id: "pastries",
      name: "Pastry Box",
      amount: 8,
      cost: 32,
      label: "8 pastries",
      requires: "pastry"
    }
  ];

  const productAssets = {
    house: "../assets/img/coffee-shop/products/house-coffee.svg",
    latte: "../assets/img/coffee-shop/products/latte.svg",
    cake: "../assets/img/coffee-shop/products/cake-slice.svg",
    combo: "../assets/img/coffee-shop/products/coffee-cake-combo.svg",
    mocha: "../assets/img/coffee-shop/products/mocha-bundle.svg",
    nitro: "../assets/img/coffee-shop/products/nitro-cold-brew.svg",
    beans: "../assets/img/coffee-shop/products/beans-bag.svg",
    cups: "../assets/img/coffee-shop/products/cup-stack.svg",
    milk: "../assets/img/coffee-shop/products/milk-carton.svg",
    pastries: "../assets/img/coffee-shop/products/pastry-box.svg"
  };

  const upgrades = [
    {
      id: "machine",
      name: "Espresso Machine",
      detail: "Raises drink prices and unlocks lattes.",
      baseCost: 80,
      max: 3
    },
    {
      id: "pastry",
      name: "Pastry Display",
      detail: "Adds cakes and bundle orders.",
      baseCost: 150,
      max: 2
    },
    {
      id: "sign",
      name: "Outdoor Sign",
      detail: "Brings customers in faster.",
      baseCost: 230,
      max: 3
    },
    {
      id: "grinder",
      name: "Second Grinder",
      detail: "Makes every order more valuable.",
      baseCost: 420,
      max: 3
    },
    {
      id: "barista",
      name: "Hire Barista",
      detail: "Automatically serves the first waiting customer.",
      baseCost: 850,
      max: 2
    },
    {
      id: "seating",
      name: "Cozy Seating",
      detail: "Customers wait longer and the shop holds more demand.",
      baseCost: 1250,
      max: 2
    },
    {
      id: "loyalty",
      name: "Loyalty App",
      detail: "Adds tips to every completed sale.",
      baseCost: 2200,
      max: 2
    },
    {
      id: "nitro",
      name: "Nitro Tap",
      detail: "Unlocks premium cold brew orders.",
      baseCost: 3800,
      max: 1
    }
  ];

  const milestones = [
    { name: "Tiny Counter", earned: 0 },
    { name: "Morning Favorite", earned: 150 },
    { name: "Neighborhood Cafe", earned: 600 },
    { name: "Busy Coffee Bar", earned: 1600 },
    { name: "Small Roastery", earned: 4200 },
    { name: "Local Coffee Empire", earned: 9000 }
  ];

  const customerColors = ["#5c75a8", "#c76d32", "#2f7f72", "#ad5d7b", "#6f7985", "#b08a38"];
  const skinColors = ["#e9b88c", "#d99c6c", "#8b5d3e", "#f0c7a2", "#6d432c"];
  const customerNames = ["Mia", "Noah", "Ava", "Leo", "Ivy", "Owen", "Lena", "Kai", "Nora", "Theo"];

  let state = loadState();
  let lastFrame = performance.now();
  let spawnClock = 0;
  let autoServeClock = 0;
  let autosaveClock = 0;
  let nextCustomerId = Date.now();
  let lastMilestone = currentMilestone().name;

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(defaultState));
  }

  function loadState() {
    const fresh = cloneDefaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || typeof saved !== "object") {
        return fresh;
      }

      const merged = {
        ...fresh,
        ...saved,
        supplies: { ...fresh.supplies, ...(saved.supplies || {}) },
        upgrades: { ...fresh.upgrades, ...(saved.upgrades || {}) },
        queue: []
      };
      normalizeState(merged);
      return merged;
    } catch (error) {
      return fresh;
    }
  }

  function normalizeState(target) {
    ["money", "todayProfit", "totalEarned", "served", "missed", "reputation"].forEach((key) => {
      target[key] = Number.isFinite(Number(target[key])) ? Number(target[key]) : defaultState[key];
    });

    Object.keys(defaultState.supplies).forEach((key) => {
      target.supplies[key] = Number.isFinite(Number(target.supplies[key])) ? Number(target.supplies[key]) : defaultState.supplies[key];
    });

    Object.keys(defaultState.upgrades).forEach((key) => {
      target.upgrades[key] = Number.isFinite(Number(target.upgrades[key])) ? Number(target.upgrades[key]) : defaultState.upgrades[key];
    });
  }

  function saveState(manual) {
    const savePayload = {
      ...state,
      queue: [],
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(savePayload));
    state.lastSaved = savePayload.lastSaved;
    if (manual) {
      setActivity("Shop saved in this browser.");
    }
  }

  function formatMoney(value) {
    return "$" + Math.floor(value).toLocaleString("en-US");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      if (character === "&") {
        return "&amp;";
      }
      if (character === "<") {
        return "&lt;";
      }
      if (character === ">") {
        return "&gt;";
      }
      if (character === '"') {
        return "&quot;";
      }
      return "&#39;";
    });
  }

  function productImage(id, className, altText) {
    const source = productAssets[id] || productAssets.house;
    return (
      '<img class="' + className + '" src="' + source + '" alt="' + escapeHtml(altText || "") + '" loading="lazy" draggable="false">'
    );
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function upgradeCost(upgrade) {
    const level = state.upgrades[upgrade.id] || 0;
    return Math.round(upgrade.baseCost * Math.pow(1.72, level));
  }

  function currentMilestone() {
    let active = milestones[0];
    for (const milestone of milestones) {
      if (state.totalEarned >= milestone.earned) {
        active = milestone;
      }
    }
    return active;
  }

  function nextMilestone() {
    return milestones.find((milestone) => milestone.earned > state.totalEarned) || null;
  }

  function saleMultiplier() {
    return (
      1 +
      state.upgrades.machine * 0.13 +
      state.upgrades.grinder * 0.1 +
      state.upgrades.loyalty * 0.08 +
      (state.reputation - 80) * 0.003
    );
  }

  function getOrders() {
    const orders = [
      {
        id: "house",
        name: "House Coffee",
        requirements: { beans: 1, cups: 1 },
        basePrice: 8
      }
    ];

    if (state.upgrades.machine > 0) {
      orders.push({
        id: "latte",
        name: "Creamy Latte",
        requirements: { beans: 1, cups: 1, milk: 1 },
        basePrice: 13
      });
    }

    if (state.upgrades.pastry > 0) {
      orders.push({
        id: "cake",
        name: "Cake Slice",
        requirements: { pastries: 1 },
        basePrice: 11
      });
      orders.push({
        id: "combo",
        name: "Coffee & Cake",
        requirements: { beans: 1, cups: 1, pastries: 1 },
        basePrice: 18
      });
    }

    if (state.upgrades.machine > 1 && state.upgrades.pastry > 0) {
      orders.push({
        id: "mocha",
        name: "Mocha Bundle",
        requirements: { beans: 1, cups: 1, milk: 1, pastries: 1 },
        basePrice: 25
      });
    }

    if (state.upgrades.nitro > 0) {
      orders.push({
        id: "nitro",
        name: "Nitro Cold Brew",
        requirements: { beans: 2, cups: 1 },
        basePrice: 34
      });
    }

    return orders;
  }

  function weightedOrder() {
    const orders = getOrders();
    const totalWeight = orders.reduce((sum, order, index) => sum + Math.max(1, 6 - index), 0);
    let pick = Math.random() * totalWeight;
    for (let index = 0; index < orders.length; index += 1) {
      pick -= Math.max(1, 6 - index);
      if (pick <= 0) {
        return orders[index];
      }
    }
    return orders[0];
  }

  function spawnInterval() {
    return Math.max(
      2600,
      8200 - state.upgrades.sign * 900 - state.upgrades.seating * 450 - state.upgrades.machine * 180
    );
  }

  function maxQueue() {
    return 4 + state.upgrades.seating * 2 + state.upgrades.barista;
  }

  function patienceLimit() {
    return 22000 + state.upgrades.seating * 5000 + state.upgrades.sign * 900;
  }

  function createCustomer() {
    if (state.queue.length >= maxQueue()) {
      state.reputation = clamp(state.reputation - 1, 40, 100);
      setActivity("The line is full, so one customer walked by.");
      return;
    }

    const customer = {
      id: nextCustomerId++,
      name: customerNames[Math.floor(Math.random() * customerNames.length)],
      order: weightedOrder(),
      elapsed: 0,
      patience: patienceLimit(),
      color: customerColors[Math.floor(Math.random() * customerColors.length)],
      skin: skinColors[Math.floor(Math.random() * skinColors.length)]
    };

    state.queue.push(customer);
    renderLive();
  }

  function hasRequirements(order) {
    return Object.entries(order.requirements).every(([id, amount]) => state.supplies[id] >= amount);
  }

  function missingRequirements(order) {
    return Object.entries(order.requirements)
      .filter(([id, amount]) => state.supplies[id] < amount)
      .map(([id]) => stockItems.find((item) => item.id === id)?.name || id);
  }

  function orderPrice(order) {
    return Math.max(1, Math.round(order.basePrice * saleMultiplier()));
  }

  function serveNext(isAuto) {
    if (!state.queue.length) {
      if (!isAuto) {
        setActivity("No one is waiting yet. Fresh customers arrive every few seconds.");
      }
      return false;
    }

    const customer = state.queue[0];
    if (!hasRequirements(customer.order)) {
      if (!isAuto) {
        const missing = missingRequirements(customer.order).join(", ");
        setActivity("Restock " + missing + " before serving this order.");
      }
      return false;
    }

    Object.entries(customer.order.requirements).forEach(([id, amount]) => {
      state.supplies[id] -= amount;
    });

    const earned = orderPrice(customer.order);
    state.money += earned;
    state.todayProfit += earned;
    state.totalEarned += earned;
    state.served += 1;
    state.reputation = clamp(state.reputation + 0.25, 40, 100);
    state.queue.shift();

    showSalePop(earned);
    playSaleTone();
    checkMilestone();
    setActivity(customer.name + " paid " + formatMoney(earned) + " for " + customer.order.name + ".");
    saveState(false);
    render();
    return true;
  }

  function restock(itemId) {
    const item = stockItems.find((stockItem) => stockItem.id === itemId);
    if (!item) {
      return;
    }

    if (item.requires && state.upgrades[item.requires] === 0) {
      setActivity(item.name + " unlocks after buying the matching upgrade.");
      return;
    }

    if (state.money < item.cost) {
      setActivity("You need " + formatMoney(item.cost) + " to restock " + item.name + ".");
      return;
    }

    state.money -= item.cost;
    state.supplies[item.id] += item.amount;
    setActivity("Restocked " + item.label.toLowerCase() + " for " + formatMoney(item.cost) + ".");
    saveState(false);
    render();
  }

  function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find((item) => item.id === upgradeId);
    if (!upgrade) {
      return;
    }

    const level = state.upgrades[upgrade.id] || 0;
    if (level >= upgrade.max) {
      setActivity(upgrade.name + " is already max level.");
      return;
    }

    const cost = upgradeCost(upgrade);
    if (state.money < cost) {
      setActivity(upgrade.name + " costs " + formatMoney(cost) + ".");
      return;
    }

    state.money -= cost;
    state.upgrades[upgrade.id] = level + 1;

    if (upgrade.id === "pastry" && level === 0) {
      state.supplies.pastries += 6;
    }

    if (upgrade.id === "machine" && level === 0) {
      state.supplies.milk += 4;
    }

    setActivity(upgrade.name + " upgraded. The cafe looks better and earns faster.");
    saveState(false);
    render();
  }

  function checkMilestone() {
    const milestone = currentMilestone();
    if (milestone.name !== lastMilestone) {
      lastMilestone = milestone.name;
      setActivity("Milestone unlocked: " + milestone.name + ".");
    }
  }

  function tick(now) {
    const delta = Math.min(1000, now - lastFrame);
    lastFrame = now;
    spawnClock += delta;
    autoServeClock += delta;
    autosaveClock += delta;

    if (spawnClock >= spawnInterval()) {
      spawnClock = 0;
      createCustomer();
    }

    state.queue.forEach((customer) => {
      customer.elapsed += delta;
    });

    const beforeLength = state.queue.length;
    state.queue = state.queue.filter((customer) => customer.elapsed < customer.patience);
    const lostCustomers = beforeLength - state.queue.length;
    if (lostCustomers > 0) {
      state.missed += lostCustomers;
      state.reputation = clamp(state.reputation - lostCustomers * 3, 40, 100);
      setActivity(lostCustomers === 1 ? "One customer left the line." : lostCustomers + " customers left the line.");
    }

    if (state.upgrades.barista > 0) {
      const autoInterval = Math.max(1200, 3800 - state.upgrades.barista * 900 - state.upgrades.machine * 250);
      if (autoServeClock >= autoInterval) {
        autoServeClock = 0;
        serveNext(true);
      }
    }

    if (autosaveClock >= 3500) {
      autosaveClock = 0;
      saveState(false);
    }

    renderLive();
    requestAnimationFrame(tick);
  }

  function setActivity(message) {
    dom.activityLine.textContent = message;
  }

  function showSalePop(amount) {
    const pop = document.createElement("span");
    pop.className = "sale-pop";
    pop.textContent = "+" + formatMoney(amount);
    pop.style.setProperty("--x", 34 + Math.round(Math.random() * 24) + "%");
    pop.style.setProperty("--y", 43 + Math.round(Math.random() * 16) + "%");
    dom.salePopLayer.appendChild(pop);
    window.setTimeout(() => pop.remove(), 950);
  }

  function playSaleTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return;
      }
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = 620;
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => context.close();
      oscillator.start();
      oscillator.stop(context.currentTime + 0.14);
    } catch (error) {
      return;
    }
  }

  function renderStats() {
    dom.cash.textContent = formatMoney(state.money);
    dom.profit.textContent = formatMoney(state.todayProfit);
    dom.served.textContent = state.served.toLocaleString("en-US");
    dom.reputation.textContent = Math.round(state.reputation) + "%";

    const milestone = currentMilestone();
    const next = nextMilestone();
    dom.milestoneName.textContent = milestone.name;

    if (next) {
      const progress = ((state.totalEarned - milestone.earned) / (next.earned - milestone.earned)) * 100;
      dom.milestoneProgress.style.width = clamp(progress, 0, 100) + "%";
      dom.nextMilestone.textContent = formatMoney(next.earned - state.totalEarned) + " to " + next.name;
    } else {
      dom.milestoneProgress.style.width = "100%";
      dom.nextMilestone.textContent = "All milestones unlocked";
    }
  }

  function queuePosition(index) {
    const positions = [
      { x: 56, y: 43 },
      { x: 64, y: 47 },
      { x: 72, y: 51 },
      { x: 80, y: 55 },
      { x: 88, y: 59 },
      { x: 90, y: 47 },
      { x: 82, y: 43 },
      { x: 74, y: 39 }
    ];
    return positions[Math.min(index, positions.length - 1)];
  }

  function orderBubbleText(customer) {
    return customer.order.name + " " + formatMoney(orderPrice(customer.order));
  }

  function renderScene() {
    dom.shopScene.classList.toggle("has-machine", state.upgrades.machine > 0);
    dom.shopScene.classList.toggle("has-pastry", state.upgrades.pastry > 0);
    dom.shopScene.classList.toggle("has-sign", state.upgrades.sign > 0);
    dom.shopScene.classList.toggle("has-grinder", state.upgrades.grinder > 0);
    dom.shopScene.classList.toggle("has-barista", state.upgrades.barista > 0);
    dom.shopScene.classList.toggle("has-seating", state.upgrades.seating > 0);
    dom.shopScene.classList.toggle("has-loyalty", state.upgrades.loyalty > 0);
    dom.shopScene.classList.toggle("has-nitro", state.upgrades.nitro > 0);
    dom.shopScene.classList.toggle("has-premium", state.totalEarned >= 1600);

    const activeIds = new Set();
    state.queue.slice(0, maxQueue()).forEach((customer, index) => {
      const id = String(customer.id);
      const position = queuePosition(index);
      let token = dom.customerLane.querySelector('[data-customer-id="' + id + '"]');
      const missing = missingRequirements(customer.order);

      if (!token) {
        token = document.createElement("div");
        token.className = "customer-token";
        token.dataset.customerId = id;
        token.innerHTML = '<span class="order-bubble"></span><span class="customer-head"></span><span class="customer-body"></span><span class="patience"><span></span></span>';
        dom.customerLane.appendChild(token);
      }

      activeIds.add(id);
      token.className = "customer-token" + (index === 0 ? " is-next" : "") + (missing.length ? " is-blocked" : "");
      token.style.setProperty("--customer-color", customer.color);
      token.style.setProperty("--skin-color", customer.skin);
      token.style.setProperty("--line-x", position.x + "%");
      token.style.setProperty("--line-y", position.y + "%");
      token.style.setProperty("--queue-z", String(20 + index));
      token.style.setProperty("--patience", clamp(100 - (customer.elapsed / customer.patience) * 100, 0, 100) + "%");
      token.setAttribute("aria-label", customer.name + " waiting for " + customer.order.name);

      const bubble = token.querySelector(".order-bubble");
      if (bubble) {
        bubble.innerHTML = productImage(customer.order.id, "bubble-product", customer.order.name) + '<span>' + escapeHtml(orderBubbleText(customer)) + '</span>';
      }
    });

    dom.customerLane.querySelectorAll(".customer-token").forEach((token) => {
      if (!activeIds.has(token.dataset.customerId)) {
        token.remove();
      }
    });
  }

  function renderQueue() {
    dom.queueCount.textContent = state.queue.length + (state.queue.length === 1 ? " waiting" : " waiting");

    if (!state.queue.length) {
      dom.orderList.innerHTML = '<div class="empty-state">The counter is ready for the next customer.</div>';
      dom.serveButton.disabled = false;
      return;
    }

    dom.orderList.innerHTML = state.queue.slice(0, 3).map((customer, index) => {
      const price = orderPrice(customer.order);
      const missing = missingRequirements(customer.order);
      const status = missing.length ? "Needs " + missing.join(", ") : "Ready";
      const lead = index === 0 ? "Next" : "Waiting";
      return (
        '<div class="order-card" data-order="' + customer.order.id + '">' +
          productImage(customer.order.id, "order-picture", customer.order.name) +
          '<div class="order-copy">' +
            '<strong>' + escapeHtml(lead + ": " + customer.order.name) + '</strong>' +
            '<span>' + escapeHtml(customer.name + " - " + status) + '</span>' +
          '</div>' +
          '<em>' + formatMoney(price) + '</em>' +
        '</div>'
      );
    }).join("");

    dom.serveButton.disabled = false;
  }

  function renderStock() {
    dom.stockGrid.innerHTML = stockItems.map((item) => {
      const locked = item.requires && state.upgrades[item.requires] === 0;
      const unavailable = locked || state.money < item.cost;
      const amount = state.supplies[item.id] || 0;
      const title = locked ? "Locked" : item.name;
      const helper = locked ? "Buy Pastry Display" : item.label + " in stock: " + amount;

      return (
        '<button class="stock-button' + (unavailable ? " is-unavailable" : "") + '" type="button" data-stock="' + item.id + '" data-product="' + item.id + '" aria-disabled="' + (unavailable ? "true" : "false") + '">' +
          productImage(item.id, "stock-picture", item.name) +
          '<span class="stock-copy">' +
            '<strong>' + escapeHtml(title) + '</strong>' +
            '<span>' + escapeHtml(helper) + '</span>' +
            '<b>Restock ' + formatMoney(item.cost) + '</b>' +
          '</span>' +
        '</button>'
      );
    }).join("");
  }

  function renderUpgrades() {
    dom.upgradeGrid.innerHTML = upgrades.map((upgrade) => {
      const level = state.upgrades[upgrade.id] || 0;
      const maxed = level >= upgrade.max;
      const cost = maxed ? 0 : upgradeCost(upgrade);
      const unavailable = maxed || state.money < cost;
      const costText = maxed ? "Max level" : "Buy " + formatMoney(cost);

      return (
        '<button class="upgrade-button' + (unavailable ? " is-unavailable" : "") + '" type="button" data-upgrade="' + upgrade.id + '" aria-disabled="' + (unavailable ? "true" : "false") + '">' +
          '<span class="upgrade-icon upgrade-icon--' + upgrade.id + '" aria-hidden="true"></span>' +
          '<span class="upgrade-topline">' +
            '<strong>' + upgrade.name + '</strong>' +
            '<span class="level-pill">' + level + "/" + upgrade.max + '</span>' +
          '</span>' +
          '<span>' + upgrade.detail + '</span>' +
          '<b>' + costText + '</b>' +
        '</button>'
      );
    }).join("");
  }

  function renderLive() {
    renderStats();
    renderScene();
    renderQueue();
  }

  function render() {
    renderLive();
    renderStock();
    renderUpgrades();
  }

  dom.serveButton.addEventListener("click", () => serveNext(false));
  dom.saveButton.addEventListener("click", () => {
    saveState(true);
    render();
  });
  dom.resetButton.addEventListener("click", () => {
    if (!window.confirm("Reset this coffee shop and start again?")) {
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    state = cloneDefaultState();
    spawnClock = 0;
    autoServeClock = 0;
    autosaveClock = 0;
    lastMilestone = currentMilestone().name;
    setActivity("Fresh counter, fresh start.");
    render();
  });

  dom.stockGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stock]");
    if (!button) {
      return;
    }
    restock(button.getAttribute("data-stock"));
  });

  dom.upgradeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-upgrade]");
    if (!button) {
      return;
    }
    buyUpgrade(button.getAttribute("data-upgrade"));
  });

  createCustomer();
  render();
  requestAnimationFrame(tick);
})();
