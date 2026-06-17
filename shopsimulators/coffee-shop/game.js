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
    pauseButton: document.getElementById("pauseButton"),
    resetButton: document.getElementById("resetButton"),
    queueCount: document.getElementById("queueCount"),
    orderList: document.getElementById("orderList"),
    stockGrid: document.getElementById("stockGrid"),
    restockGrid: document.getElementById("restockGrid"),
    pickupTray: document.getElementById("pickupTray"),
    trayItems: document.getElementById("trayItems"),
    trayClearButton: document.getElementById("trayClearButton"),
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
    activeCustomerId: null,
    tray: [],
    currentStreak: 0,
    bestStreak: 0,
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
    house: "../assets/img/coffee-shop/pixel-products/house-coffee.svg",
    latte: "../assets/img/coffee-shop/pixel-products/latte.svg",
    cake: "../assets/img/coffee-shop/pixel-products/cake-slice.svg",
    combo: "../assets/img/coffee-shop/pixel-products/coffee-cake-combo.svg",
    mocha: "../assets/img/coffee-shop/pixel-products/mocha-bundle.svg",
    nitro: "../assets/img/coffee-shop/pixel-products/nitro-cold-brew.svg",
    beans: "../assets/img/coffee-shop/pixel-products/beans-bag.svg",
    cups: "../assets/img/coffee-shop/pixel-products/cup-stack.svg",
    milk: "../assets/img/coffee-shop/pixel-products/milk-carton.svg",
    pastries: "../assets/img/coffee-shop/pixel-products/pastry-box.svg"
  };

  const productCatalog = [
    {
      id: "house",
      name: "House Coffee",
      requirements: { beans: 1, cups: 1 },
      basePrice: 8
    },
    {
      id: "latte",
      name: "Creamy Latte",
      requirements: { beans: 1, cups: 1, milk: 1 },
      basePrice: 13,
      requiresUpgrade: "machine"
    },
    {
      id: "cake",
      name: "Cake Slice",
      requirements: { pastries: 1 },
      basePrice: 11,
      requiresUpgrade: "pastry"
    },
    {
      id: "combo",
      name: "Coffee & Cake",
      requirements: { beans: 1, cups: 1, pastries: 1 },
      basePrice: 18,
      requiresUpgrade: "pastry"
    },
    {
      id: "mocha",
      name: "Mocha Bundle",
      requirements: { beans: 1, cups: 1, milk: 1, pastries: 1 },
      basePrice: 25,
      unlocksWhen: () => state.upgrades.machine > 1 && state.upgrades.pastry > 0
    },
    {
      id: "nitro",
      name: "Nitro Cold Brew",
      requirements: { beans: 2, cups: 1 },
      basePrice: 34,
      requiresUpgrade: "nitro"
    }
  ];

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
  const customerTypes = [
    {
      id: "regular",
      label: "Regular",
      patienceMultiplier: 1.12,
      tipMultiplier: 1.2,
      phrases: ["The usual, please.", "Good to see you again.", "I'll take a {order}."]
    },
    {
      id: "office",
      label: "Office",
      patienceMultiplier: 0.76,
      tipMultiplier: 1.35,
      phrases: ["A {order}, quick please.", "Running to a meeting.", "Need this fast."]
    },
    {
      id: "student",
      label: "Student",
      patienceMultiplier: 1.38,
      tipMultiplier: 0.72,
      phrases: ["Can I get a {order}?", "No rush, just studying.", "A {order} would save me."]
    },
    {
      id: "tourist",
      label: "Tourist",
      patienceMultiplier: 1.0,
      tipMultiplier: 1.0,
      phrases: ["What is cute here?", "One {order}, please.", "This place smells amazing."]
    },
    {
      id: "reviewer",
      label: "Reviewer",
      patienceMultiplier: 0.92,
      tipMultiplier: 1.6,
      reputationMultiplier: 1.8,
      phrases: ["I'm trying your {order}.", "Let's see the house standard.", "Make it memorable."]
    }
  ];

  let state = loadState();
  let lastFrame = performance.now();
  let spawnClock = 0;
  let autoServeClock = 0;
  let autosaveClock = 0;
  let nextCustomerId = Date.now();
  let lastMilestone = currentMilestone().name;
  let adPaused = false;
  let playerPaused = false;
  let pauseStartedAt = null;

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
        queue: [],
        activeCustomerId: null,
        tray: []
      };
      normalizeState(merged);
      return merged;
    } catch (error) {
      return fresh;
    }
  }

  function normalizeState(target) {
    ["money", "todayProfit", "totalEarned", "served", "missed", "reputation", "currentStreak", "bestStreak"].forEach((key) => {
      target[key] = Number.isFinite(Number(target[key])) ? Number(target[key]) : defaultState[key];
    });

    Object.keys(defaultState.supplies).forEach((key) => {
      target.supplies[key] = Number.isFinite(Number(target.supplies[key])) ? Number(target.supplies[key]) : defaultState.supplies[key];
    });

    Object.keys(defaultState.upgrades).forEach((key) => {
      target.upgrades[key] = Number.isFinite(Number(target.upgrades[key])) ? Number(target.upgrades[key]) : defaultState.upgrades[key];
    });

    target.queue = Array.isArray(target.queue) ? target.queue : [];
    target.activeCustomerId = null;
    target.tray = [];
  }

  function saveState(manual) {
    const savedSupplies = { ...state.supplies };
    state.tray.forEach((product) => {
      Object.entries(product.requirements).forEach(([id, amount]) => {
        savedSupplies[id] += amount;
      });
    });

    const savePayload = {
      ...state,
      supplies: savedSupplies,
      queue: [],
      activeCustomerId: null,
      tray: [],
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

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function requestGameAdBreak(type, name) {
    if (!window.ShopSimulatorsAds || typeof window.ShopSimulatorsAds.gameBreak !== "function") {
      return;
    }

    if (typeof window.ShopSimulatorsAds.configureGame === "function") {
      window.ShopSimulatorsAds.configureGame({ sound: "off" });
    }
    window.ShopSimulatorsAds.gameBreak({
      type,
      name,
      beforeAd: () => {
        adPaused = true;
      },
      afterAd: () => {
        adPaused = false;
        lastFrame = performance.now();
      },
      adBreakDone: () => {
        adPaused = false;
        lastFrame = performance.now();
      }
    });
  }

  function maybeRequestProgressAdBreak(unlockedMilestone) {
    if (unlockedMilestone) {
      requestGameAdBreak("next", "coffee_shop_milestone_" + slug(unlockedMilestone.name));
      return;
    }

    if (state.served > 0 && state.served % 10 === 0) {
      requestGameAdBreak("next", "coffee_shop_served_" + state.served);
    }
  }

  function updatePauseControls() {
    dom.pauseButton.classList.toggle("is-paused", playerPaused);
    dom.pauseButton.setAttribute("aria-pressed", playerPaused ? "true" : "false");
    dom.pauseButton.setAttribute("aria-label", playerPaused ? "Resume game" : "Pause game");
    dom.pauseButton.setAttribute("title", playerPaused ? "Resume game" : "Pause game");
    dom.shopScene.classList.toggle("is-paused", playerPaused);
  }

  function setPlayerPaused(paused) {
    if (playerPaused === paused) {
      return;
    }

    const now = performance.now();
    if (paused) {
      pauseStartedAt = now;
    } else if (pauseStartedAt !== null) {
      const pauseDuration = now - pauseStartedAt;
      state.queue.forEach((customer) => {
        if (customer.leaveAt) {
          customer.leaveAt += pauseDuration;
        }
      });
      pauseStartedAt = null;
    }

    playerPaused = paused;
    lastFrame = now;
    updatePauseControls();
    setActivity(playerPaused ? "Game paused." : "Game resumed.");
    renderLive();
  }

  function gameplayPaused() {
    if (!playerPaused) {
      return false;
    }
    setActivity("Resume the game to keep serving.");
    return true;
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

  function cloneProduct(product) {
    return {
      id: product.id,
      name: product.name,
      requirements: { ...product.requirements },
      basePrice: product.basePrice
    };
  }

  function isProductUnlocked(product) {
    if (typeof product.unlocksWhen === "function") {
      return product.unlocksWhen();
    }
    if (product.requiresUpgrade) {
      return state.upgrades[product.requiresUpgrade] > 0;
    }
    return true;
  }

  function getProduct(productId) {
    const product = productCatalog.find((item) => item.id === productId);
    return product && isProductUnlocked(product) ? cloneProduct(product) : null;
  }

  function getOrders() {
    return productCatalog.filter(isProductUnlocked).map(cloneProduct);
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

  function randomCustomerType() {
    const weights = [
      { type: customerTypes[0], weight: 4 },
      { type: customerTypes[1], weight: 3 },
      { type: customerTypes[2], weight: 3 },
      { type: customerTypes[3], weight: 2 },
      { type: customerTypes[4], weight: state.served >= 8 ? 1 : 0 }
    ];
    const total = weights.reduce((sum, item) => sum + item.weight, 0);
    let pick = Math.random() * total;
    for (const item of weights) {
      pick -= item.weight;
      if (pick <= 0) {
        return item.type;
      }
    }
    return customerTypes[0];
  }

  function orderPhrase(type, order) {
    const phrases = type.phrases || customerTypes[0].phrases;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)] || "I'll take a {order}.";
    return phrase.replace("{order}", order.name);
  }

  function createCustomer() {
    if (state.queue.length >= maxQueue()) {
      state.reputation = clamp(state.reputation - 1, 40, 100);
      setActivity("The line is full, so one customer walked by.");
      return;
    }

    const type = randomCustomerType();
    const order = weightedOrder();
    const customer = {
      id: nextCustomerId++,
      name: customerNames[Math.floor(Math.random() * customerNames.length)],
      type: type.id,
      typeLabel: type.label,
      phrase: orderPhrase(type, order),
      order,
      elapsed: 0,
      patience: Math.round(patienceLimit() * type.patienceMultiplier),
      color: customerColors[Math.floor(Math.random() * customerColors.length)],
      skin: skinColors[Math.floor(Math.random() * skinColors.length)],
      mood: "waiting",
      status: "waiting",
      bornAt: performance.now(),
      leaveAt: null
    };

    state.queue.push(customer);
    ensureActiveCustomer();
    renderLive();
  }

  function hasRequirements(order) {
    return Object.entries(order.requirements).every(([id, amount]) => state.supplies[id] >= amount);
  }

  function missingRequirements(order) {
    return Object.entries(order.requirements)
      .filter(([id, amount]) => state.supplies[id] < amount)
      .map(([id]) => {
        const stockItem = stockItems.find((item) => item.id === id);
        return stockItem ? stockItem.name : id;
      });
  }

  function orderPrice(order) {
    return Math.max(1, Math.round(order.basePrice * saleMultiplier()));
  }

  function firstWaitingCustomer() {
    return state.queue.find((customer) => customer.status !== "leaving") || null;
  }

  function activeCustomer() {
    if (!state.activeCustomerId) {
      return null;
    }
    return state.queue.find((customer) => customer.id === state.activeCustomerId && customer.status !== "leaving") || null;
  }

  function ensureActiveCustomer() {
    const first = firstWaitingCustomer();
    if (!first) {
      state.activeCustomerId = null;
      return null;
    }
    if (!activeCustomer() || state.activeCustomerId !== first.id) {
      state.activeCustomerId = first.id;
    }
    return first;
  }

  function selectCustomer(customerId) {
    if (gameplayPaused()) {
      return;
    }

    const first = firstWaitingCustomer();
    if (!first) {
      state.activeCustomerId = null;
      setActivity("No one is waiting yet. Fresh customers arrive every few seconds.");
      renderLive();
      return;
    }

    if (String(first.id) !== String(customerId)) {
      setActivity("Take the front customer's order first.");
      return;
    }

    state.activeCustomerId = first.id;
    setActivity(first.name + " wants " + first.order.name + ". Pick it from the shelf, then ring the bell.");
    renderLive();
  }

  function maxProducible(product) {
    const counts = Object.entries(product.requirements).map(([id, amount]) => {
      if (amount <= 0) {
        return 0;
      }
      return Math.floor((state.supplies[id] || 0) / amount);
    });
    return counts.length ? Math.min(...counts) : 0;
  }

  function consumeRequirements(requirements) {
    Object.entries(requirements).forEach(([id, amount]) => {
      state.supplies[id] -= amount;
    });
  }

  function returnRequirements(requirements) {
    Object.entries(requirements).forEach(([id, amount]) => {
      state.supplies[id] += amount;
    });
  }

  function pickProduct(productId) {
    if (gameplayPaused()) {
      return;
    }

    const product = getProduct(productId);
    if (!product) {
      setActivity("That product is not on the menu yet.");
      return;
    }

    const customer = ensureActiveCustomer();
    if (!customer) {
      setActivity("No order yet. Wait for the next customer to reach the counter.");
      renderLive();
      return;
    }

    if (state.tray.length) {
      setActivity("The pickup tray already has " + state.tray[0].name + ". Ring it or clear the tray.");
      return;
    }

    if (!hasRequirements(product)) {
      const missing = missingRequirements(product).join(", ");
      setActivity("Restock " + missing + " before preparing " + product.name + ".");
      render();
      return;
    }

    consumeRequirements(product.requirements);
    state.tray = [product];
    setActivity("Placed " + product.name + " on the pickup tray for " + customer.name + ".");
    render();
  }

  function clearTray(returnToStock, message) {
    if (gameplayPaused()) {
      return;
    }

    if (returnToStock) {
      state.tray.forEach((product) => returnRequirements(product.requirements));
    }
    state.tray = [];
    if (message) {
      setActivity(message);
    }
    render();
  }

  function customerTypeDetails(customer) {
    return customerTypes.find((type) => type.id === customer.type) || customerTypes[0];
  }

  function tipForCustomer(customer, price) {
    const patienceUsed = customer.elapsed / customer.patience;
    const speedTip = patienceUsed < 0.32 ? 0.24 : patienceUsed < 0.68 ? 0.1 : 0;
    const type = customerTypeDetails(customer);
    const loyaltyTip = state.upgrades.loyalty * 0.06;
    return Math.round(price * (speedTip + loyaltyTip) * type.tipMultiplier);
  }

  function markCustomerLeaving(customer, mood) {
    customer.mood = mood;
    customer.status = "leaving";
    customer.leaveAt = performance.now() + 760;
  }

  function completeOrder(customer, preparedProduct, isCorrect, isAuto) {
    state.activeCustomerId = null;

    if (isCorrect) {
      const price = orderPrice(customer.order);
      const tip = tipForCustomer(customer, price);
      const earned = price + tip;
      state.money += earned;
      state.todayProfit += earned;
      state.totalEarned += earned;
      state.served += 1;
      state.currentStreak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
      state.reputation = clamp(state.reputation + 0.35 + state.currentStreak * 0.02, 40, 100);
      markCustomerLeaving(customer, "happy");
      state.tray = [];

      const unlockedMilestone = checkMilestone();

      showSalePop(earned, tip > 0 ? "tip" : "sale");
      playSaleTone();
      setActivity(
        (unlockedMilestone ? "Milestone unlocked: " + unlockedMilestone.name + ". " : "") +
        (isAuto ? "The barista served " : "You served ") +
        customer.name + " " + customer.order.name + " for " + formatMoney(price) +
        (tip > 0 ? " plus " + formatMoney(tip) + " tip." : ".")
      );
      saveState(false);
      render();

      if (!isAuto) {
        maybeRequestProgressAdBreak(unlockedMilestone);
      }

      return true;
    }

    const type = customerTypeDetails(customer);
    state.currentStreak = 0;
    state.missed += 1;
    state.reputation = clamp(state.reputation - 4 * (type.reputationMultiplier || 1), 40, 100);
    markCustomerLeaving(customer, "annoyed");
    state.tray = [];
    showSalePop(0, "mistake");
    setActivity(customer.name + " wanted " + customer.order.name + ", not " + preparedProduct.name + ". No sale.");
    saveState(false);
    render();
    return false;
  }

  function ringBell() {
    if (gameplayPaused()) {
      return false;
    }

    const customer = ensureActiveCustomer();
    if (!customer) {
      setActivity("No one is at the counter yet.");
      renderLive();
      return false;
    }

    if (!state.tray.length) {
      setActivity("Pick " + customer.order.name + " from the shelf before ringing the bell.");
      renderLive();
      return false;
    }

    const preparedProduct = state.tray[0];
    return completeOrder(customer, preparedProduct, preparedProduct.id === customer.order.id, false);
  }

  function autoServeNext() {
    if (state.tray.length) {
      return false;
    }

    const customer = firstWaitingCustomer();
    if (!customer || !hasRequirements(customer.order)) {
      return false;
    }

    consumeRequirements(customer.order.requirements);
    state.tray = [cloneProduct(customer.order)];
    return completeOrder(customer, state.tray[0], true, true);
  }

  function restock(itemId) {
    if (gameplayPaused()) {
      return;
    }

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
    if (gameplayPaused()) {
      return;
    }

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
      return milestone;
    }
    return null;
  }

  function tick(now) {
    if (adPaused) {
      lastFrame = now;
      requestAnimationFrame(tick);
      return;
    }

    if (playerPaused) {
      lastFrame = now;
      requestAnimationFrame(tick);
      return;
    }

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
      if (customer.status !== "leaving") {
        customer.elapsed += delta;
      }
    });

    const expiredCustomers = state.queue.filter((customer) => customer.status !== "leaving" && customer.elapsed >= customer.patience);
    state.queue = state.queue.filter((customer) => {
      if (customer.status === "leaving") {
        return customer.leaveAt && now < customer.leaveAt;
      }
      return customer.elapsed < customer.patience;
    });
    const lostCustomers = expiredCustomers.length;
    if (lostCustomers > 0) {
      state.missed += lostCustomers;
      state.currentStreak = 0;
      state.reputation = clamp(state.reputation - lostCustomers * 3, 40, 100);
      setActivity(lostCustomers === 1 ? "One customer left the line." : lostCustomers + " customers left the line.");
    }

    if (state.activeCustomerId && !state.queue.some((customer) => customer.id === state.activeCustomerId)) {
      state.activeCustomerId = null;
      if (state.tray.length) {
        state.tray.forEach((product) => returnRequirements(product.requirements));
        state.tray = [];
      }
    }

    ensureActiveCustomer();

    if (state.upgrades.barista > 0) {
      const autoInterval = Math.max(1200, 3800 - state.upgrades.barista * 900 - state.upgrades.machine * 250);
      if (autoServeClock >= autoInterval) {
        autoServeClock = 0;
        autoServeNext();
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

  function showSalePop(amount, kind) {
    const pop = document.createElement("span");
    pop.className = "sale-pop" + (kind ? " sale-pop--" + kind : "");
    pop.textContent = kind === "mistake" ? "Wrong item" : "+" + formatMoney(amount);
    pop.style.setProperty("--x", 29 + Math.round(Math.random() * 16) + "%");
    pop.style.setProperty("--y", 35 + Math.round(Math.random() * 8) + "%");
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
      const isActive = state.activeCustomerId === customer.id;
      const moodClass = customer.mood ? " is-" + customer.mood : "";
      const statusClass = customer.status === "leaving" ? " is-leaving" : "";

      if (!token) {
        token = document.createElement("div");
        token.className = "customer-token";
        token.dataset.customerId = id;
        token.innerHTML = '<span class="order-bubble"></span><span class="customer-head"></span><span class="customer-body"></span><span class="patience"><span></span></span>';
        dom.customerLane.appendChild(token);
      }

      activeIds.add(id);
      token.className =
        "customer-token" +
        (index === 0 ? " is-next" : "") +
        (isActive ? " is-active" : "") +
        (missing.length && customer.status !== "leaving" ? " is-blocked" : "") +
        moodClass +
        statusClass;
      token.style.setProperty("--customer-color", customer.color);
      token.style.setProperty("--skin-color", customer.skin);
      token.style.setProperty("--line-x", position.x + "%");
      token.style.setProperty("--line-y", position.y + "%");
      token.style.setProperty("--queue-z", String(20 + index));
      token.style.setProperty("--patience", clamp(100 - (customer.elapsed / customer.patience) * 100, 0, 100) + "%");
      token.setAttribute("aria-label", customer.name + ", " + customer.typeLabel + ", waiting for " + customer.order.name);

      const bubble = token.querySelector(".order-bubble");
      if (bubble) {
        const bubbleText = customer.status === "leaving"
          ? (customer.mood === "happy" ? "Thanks!" : "Not that one")
          : orderBubbleText(customer);
        bubble.innerHTML = productImage(customer.order.id, "bubble-product", customer.order.name) + '<span>' + escapeHtml(bubbleText) + '</span>';
      }
    });

    dom.customerLane.querySelectorAll(".customer-token").forEach((token) => {
      if (!activeIds.has(token.dataset.customerId)) {
        token.remove();
      }
    });
  }

  function renderQueue() {
    const waitingCustomers = state.queue.filter((customer) => customer.status !== "leaving");
    const active = ensureActiveCustomer();
    dom.queueCount.textContent = waitingCustomers.length + (waitingCustomers.length === 1 ? " waiting" : " waiting");

    if (!waitingCustomers.length) {
      dom.orderList.innerHTML = '<div class="empty-state">Counter ready.</div>';
      dom.serveButton.disabled = true;
      return;
    }

    dom.orderList.innerHTML = waitingCustomers.slice(0, 3).map((customer, index) => {
      const price = orderPrice(customer.order);
      const missing = missingRequirements(customer.order);
      const status = customer.id === active.id
        ? (state.tray.length ? "Tray ready to ring" : "Active ticket")
        : "Waiting";
      const lead = index === 0 ? "Next" : "Waiting";
      const helper = missing.length ? "Needs " + missing.join(", ") : customer.phrase;
      const ariaLabel = lead + " order, " + customer.order.name + " for " + customer.name + ", " + status + ", " + formatMoney(price);
      return (
        '<button class="order-card' + (index === 0 ? " is-next-ticket" : "") + (customer.id === state.activeCustomerId ? " is-active-ticket" : "") + '" type="button" data-order="' + customer.order.id + '" data-customer-id="' + customer.id + '" aria-label="' + escapeHtml(ariaLabel) + '">' +
          productImage(customer.order.id, "order-picture", customer.order.name) +
          '<div class="order-copy">' +
            '<strong>' + escapeHtml(lead + ": " + customer.order.name) + '</strong>' +
            '<span>' + escapeHtml(customer.name + " - " + status) + '</span>' +
            '<span>' + escapeHtml(helper) + '</span>' +
          '</div>' +
          '<em>' + formatMoney(price) + '</em>' +
        '</button>'
      );
    }).join("");

    dom.serveButton.disabled = false;
  }

  function renderStock() {
    const trayProductId = state.tray[0] ? state.tray[0].id : null;
    dom.stockGrid.innerHTML = getOrders().map((product) => {
      const amount = maxProducible(product);
      const missing = missingRequirements(product);
      const empty = amount <= 0;
      const low = amount > 0 && amount <= 2;
      const ariaLabel = empty
        ? product.name + " cannot be prepared. Restock " + missing.join(", ") + "."
        : "Prepare " + product.name + ". " + amount + " available from current supplies.";

      return (
        '<button class="stock-button product-shelf-button' + (empty ? " is-empty" : "") + (low ? " is-low" : "") + (trayProductId === product.id ? " is-selected" : "") + '" type="button" data-pick-product="' + product.id + '" aria-disabled="' + (empty ? "true" : "false") + '" aria-label="' + escapeHtml(ariaLabel) + '" title="' + escapeHtml(ariaLabel) + '">' +
          productImage(product.id, "stock-picture", product.name) +
          '<span class="stock-count">' + amount + '</span>' +
          '<span class="stock-copy">' +
            '<strong>' + escapeHtml(product.name) + '</strong>' +
            '<span>' + escapeHtml(empty ? "Restock " + missing.join(", ") : amount + " ready") + '</span>' +
            '<b>Pick product</b>' +
          '</span>' +
        '</button>'
      );
    }).join("");

    dom.restockGrid.innerHTML = stockItems.map((item) => {
      const locked = item.requires && state.upgrades[item.requires] === 0;
      const unavailable = locked || state.money < item.cost;
      const amount = state.supplies[item.id] || 0;
      const helper = locked ? "Buy Pastry Display" : item.name + ": " + amount;
      const ariaLabel = locked
        ? item.name + " locked. Buy Pastry Display first."
        : "Restock " + item.name + " for " + formatMoney(item.cost) + ". Current stock " + amount + ".";

      return (
        '<button class="restock-button' + (unavailable ? " is-unavailable" : "") + (locked ? " is-locked" : "") + '" type="button" data-restock="' + item.id + '" aria-disabled="' + (unavailable ? "true" : "false") + '" aria-label="' + escapeHtml(ariaLabel) + '" title="' + escapeHtml(helper + " - " + formatMoney(item.cost)) + '">' +
          productImage(item.id, "restock-picture", item.name) +
          '<span class="restock-cost">' + formatMoney(item.cost) + '</span>' +
        '</button>'
      );
    }).join("");
  }

  function renderTray() {
    const item = state.tray[0];
    dom.pickupTray.classList.toggle("is-ready", Boolean(item));
    dom.serveButton.classList.toggle("is-attention", Boolean(item && activeCustomer()));
    dom.trayClearButton.disabled = !item;

    if (!item) {
      dom.trayItems.innerHTML = '<div class="tray-empty">Pick a shelf product.</div>';
      return;
    }

    dom.trayItems.innerHTML =
      '<div class="tray-item">' +
        productImage(item.id, "tray-picture", item.name) +
        '<span>' + escapeHtml(item.name) + '</span>' +
      '</div>';
  }

  function renderUpgrades() {
    dom.upgradeGrid.innerHTML = upgrades.map((upgrade) => {
      const level = state.upgrades[upgrade.id] || 0;
      const maxed = level >= upgrade.max;
      const cost = maxed ? 0 : upgradeCost(upgrade);
      const unavailable = maxed || state.money < cost;
      const costText = maxed ? "Max level" : "Buy " + formatMoney(cost);
      const ariaLabel = upgrade.name + ". Level " + level + " of " + upgrade.max + ". " + upgrade.detail + " " + costText + ".";

      return (
        '<button class="upgrade-button' + (unavailable ? " is-unavailable" : "") + '" type="button" data-upgrade="' + upgrade.id + '" aria-disabled="' + (unavailable ? "true" : "false") + '" aria-label="' + escapeHtml(ariaLabel) + '" title="' + escapeHtml(ariaLabel) + '">' +
          '<span class="upgrade-icon upgrade-icon--' + upgrade.id + '" aria-hidden="true"></span>' +
          '<span class="level-pill">' + level + "/" + upgrade.max + '</span>' +
          '<span class="upgrade-topline">' +
            '<strong>' + upgrade.name + '</strong>' +
          '</span>' +
          '<span>' + upgrade.detail + '</span>' +
          '<b>' + costText + '</b>' +
        '</button>'
      );
    }).join("");
  }

  function renderLive() {
    ensureActiveCustomer();
    renderStats();
    renderScene();
    renderQueue();
    renderTray();
  }

  function render() {
    renderLive();
    renderStock();
    renderUpgrades();
  }

  dom.serveButton.addEventListener("click", () => ringBell());
  dom.orderList.addEventListener("click", (event) => {
    const ticket = event.target.closest("[data-customer-id]");
    if (!ticket) {
      return;
    }

    selectCustomer(ticket.getAttribute("data-customer-id"));
  });

  dom.customerLane.addEventListener("click", (event) => {
    const customer = event.target.closest("[data-customer-id]");
    if (!customer) {
      return;
    }

    selectCustomer(customer.getAttribute("data-customer-id"));
  });

  dom.saveButton.addEventListener("click", () => {
    saveState(true);
    render();
  });
  dom.pauseButton.addEventListener("click", () => {
    setPlayerPaused(!playerPaused);
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
    state.activeCustomerId = null;
    state.tray = [];
    playerPaused = false;
    pauseStartedAt = null;
    updatePauseControls();
    lastMilestone = currentMilestone().name;
    setActivity("Fresh counter, fresh start.");
    render();
  });

  dom.stockGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pick-product]");
    if (!button) {
      return;
    }
    pickProduct(button.getAttribute("data-pick-product"));
  });

  dom.restockGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-restock]");
    if (!button) {
      return;
    }
    restock(button.getAttribute("data-restock"));
  });

  dom.trayClearButton.addEventListener("click", () => {
    if (!state.tray.length) {
      return;
    }
    clearTray(true, "Cleared the pickup tray and returned the product to the shelf.");
  });

  dom.upgradeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-upgrade]");
    if (!button) {
      return;
    }
    buyUpgrade(button.getAttribute("data-upgrade"));
  });

  createCustomer();
  updatePauseControls();
  render();
  requestAnimationFrame(tick);
})();
