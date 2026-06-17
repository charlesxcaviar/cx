# Shop Simulator Gameplay Research

## Sources Reviewed

- Supermarket Simulator: https://store.steampowered.com/app/2670630/Supermarket_Simulator/
- Winkeltje: The Little Shop: https://store.steampowered.com/app/949290/Winkeltje_The_Little_Shop/
- Travellers Rest: https://store.steampowered.com/app/1139980/Travellers_Rest/
- Cat Cafe Manager: https://store.steampowered.com/app/1354830/Cat_Cafe_Manager/
- Good Pizza, Great Pizza: https://store.steampowered.com/app/770810/Good_Pizza_Great_Pizza__Cooking_Simulator_Game/
- Papa's Freezeria Deluxe: https://store.steampowered.com/app/2291760/Papas_Freezeria_Deluxe/
- Pizza Frenzy gameplay reference: https://en.wikipedia.org/wiki/Pizza_Frenzy
- Kenney Food Kit: https://kenney.nl/assets/food-kit
- Kenney UI Pack: https://kenney.nl/assets/ui-pack
- Kenney Tiny Town: https://kenney.nl/assets/tiny-town

## What Good Shop Sims Have In Common

### 1. The Best Actions Are Physical, Not Abstract

Good Pizza, Great Pizza and Papa's Freezeria are not just "serve customer" games. They make the player perform satisfying steps: sauce, toppings, blending, slicing, serving, or station switching. The pleasure comes from touching the business process.

Application for Coffee Shop:
- Replace generic serve flow with physical coffee actions.
- Click a customer's order bubble/ticket to make it active.
- Click/drag cup, beans, milk, pastry, ice, or cake from visible shelves.
- Drop chosen items onto a prep mat or pickup counter.
- Click the service bell only after the prepared order matches the ticket.

### 2. Orders Need Personality And Friction

Good Pizza uses quirky customers and many custom orders. Papa's uses many customers, ingredients, seasonal items, and score details. The customer is not just a timer; the customer is a small puzzle.

Application for Coffee Shop:
- Add customer archetypes: student, office worker, tourist, regular, picky reviewer, sleepy commuter.
- Give each archetype a small behavior difference:
  - Student tolerates waiting but tips little.
  - Office worker pays more but loses patience fast.
  - Regular gives streak bonuses.
  - Reviewer affects reputation more strongly.
- Use short order phrasing instead of only item names, such as "Need a latte, extra quick" or "Coffee and cake, please."

### 3. Speed Plus Accuracy Creates The Hook

Papa's rewards accuracy and speed. Good Pizza punishes refunds and rewards satisfied customers. Pizza Frenzy is built around matching the right product to the right customer quickly. This creates a clean loop: see need, act correctly, get paid.

Application for Coffee Shop:
- Track two hidden scores per served order:
  - Accuracy: did the selected product match?
  - Wait: how long did the customer wait?
- Reward:
  - Perfect order: base price + tip + happy pop.
  - Slow but correct: base price only.
  - Wrong item: refund, reputation hit, customer leaves.
- Add a tiny receipt/result popup: "+$12", "+$3 tip", or "Wrong item".

### 4. Visible Stock Is More Fun Than Inventory Text

Supermarket Simulator emphasizes placing goods on shelves, ordering stock, unpacking, and managing product display. Winkeltje emphasizes buying, selling, keeping stock, and displays. The stock should be visible and spatial.

Application for Coffee Shop:
- Shelf products should visually deplete as stock goes down.
- Restocking should fill shelf slots, not just increment a number.
- When beans are low, the beans bag shelf slot should look nearly empty.
- Stock clicks should feel like grabbing a product from the shelf.

### 5. Progress Should Change The Room

Supermarket Simulator, Winkeltje, Travellers Rest, and Cat Cafe Manager all make growth visible through layout, furniture, decor, recipes, staff, or expansion. The room itself becomes the progress meter.

Application for Coffee Shop:
- Each upgrade should visibly add or improve something in the cafe:
  - Espresso Machine: machine appears on counter, unlocks latte.
  - Pastry Display: pastry case fills up, unlocks cake.
  - Outdoor Sign: door area gets sign, faster customer spawn.
  - Second Grinder: grinder appears, higher prices.
  - Barista: helper appears behind counter, occasional auto prep.
  - Cozy Seating: more tables, longer patience.
  - Loyalty App: tablet/register glows, more tips.
  - Nitro Tap: tap appears, unlocks cold brew.

### 6. Day/Shift Rhythm Helps Retention

Papa's uses workdays, holidays, specials, minigames, stickers, and unlocks. Good Pizza uses chapters, events, and story beats. A shift ending gives a natural moment to show progress without interrupting the game.

Application for Coffee Shop:
- Add a 2-3 minute "shift" timer later.
- At shift end, show compact in-scene receipt:
  - Orders served
  - Revenue
  - Tips
  - Missed customers
  - Best streak
  - New unlocks
- Then reopen the cafe with slightly harder demand.

### 7. Customers Should Form A Real Line

Time-management shop games make queue pressure visible. If the player sees a line growing, the pressure is immediate and understandable.

Application for Coffee Shop:
- Keep the current visual line but improve it:
  - Door entry animation.
  - Footstep movement to queue spots.
  - First customer steps closer to counter.
  - Leaving customer exits through door, not just disappears.

### 8. Discovery And Ads Should Stay Outside The Toy

Neal.fun-style pages work because the toy is the page. If the game is one-screen, broad SEO content and game lists should live on the homepage or separate pages, not below the toy. Desktop side rails can use the far page edges later.

Application for Shop Simulators:
- Game page: one-screen toy only.
- Homepage: discovery grid and SEO copy.
- Future optional pages: "Best shop simulator games", "How to play", etc., if we need text content.
- Monetization priority: side rails, not vignettes or anchors on game pages.

## Asset Direction

### Current Coffee Shop Asset Direction

- Generated pixel cafe background remains the main art anchor.
- Coffee Shop now uses custom pixel-style product/restock/bell sprites in `assets/img/coffee-shop/pixel-products/`.
- Older smooth product SVGs remain in `assets/img/coffee-shop/products/`, but the pixel-products set is preferred for Coffee Shop.
- Customer tokens are CSS-built, but now use blockier pixel-compatible styling.
- Tray, tickets, stock badges, sale popups, and money HUD are styled to match the pixel cafe.

### Add Later

- Product shelf slot states: full, half, empty.
- More detailed product-on-shelf depletion sprites.
- More customer outfit/hair variants.
- Door entry/exit frames.
- More detailed upgrade prop overlays.
- Shift summary / receipt panel.

### Safe Asset Sources

- Kenney Food Kit: CC0, good for product and kitchen items.
- Kenney UI Pack: CC0, useful for small icons and clean buttons if we need them.
- Kenney Tiny Town: CC0, useful for pixel-style environment props.
- OpenGameArt / itch.io: useful later, but each asset needs license tracking.

## Implemented Coffee Shop V2 Baseline

The core tactile loop from this research has now been applied.

Implemented:
- Active front customer/order.
- Visible customer line.
- Product picking from the shelf.
- Prepared product on the pickup tray.
- Bell checks the tray against the active order.
- Correct order pays money/tips and gives happy feedback.
- Wrong order causes no sale, reputation loss, and annoyed feedback.
- Restock crates refill supplies.
- Upgrades can be bought and have visual prop overlays.
- Cash/reputation/served/profit HUD is visible in the scene.
- Save, pause, and reset controls exist.
- Pause freezes spawning, patience timers, automation, and autosave ticking.
- Coffee Shop uses pixel-compatible local sprites and styling.

## Best Next Improvement Sequence

1. Shelf depletion visuals
   - Make shelf slots show clearer full/low/empty states.
   - Restock should visibly refill shelf/display areas, not only change count badges.

2. Customer movement polish
   - Door entry animation.
   - Footstep movement into queue spots.
   - Served customers exit through the door more clearly.
   - More customer visual variety.

3. Upgrade prop polish
   - Make each upgrade object better match the background art.
   - Show higher upgrade levels with richer prop states.

4. Shift summary
   - Compact receipt appears inside the game scene after a short shift.
   - This becomes a natural future H5 ad-break moment only if we later enable H5 ads.

5. Multi-item orders
   - Add tray slots for two or three products.
   - Let customers request bundles with clearer preparation steps.

## Design Principle

The player should feel like they are doing shop work with their hands: reading orders, grabbing products, placing them, ringing the bell, watching money pop, and seeing the cafe physically improve.

## Coffee Shop V2 Blueprint For This Project

### Constraints We Should Design Around

- The game page should remain one focused, one-screen toy. No content should sit below the game.
- The far left and far right browser edges should stay quiet for future side-rail ads.
- All primary play actions should happen inside the cafe scene, on natural shop objects when possible.
- The game must still work as a simple static web app: HTML, CSS, and vanilla JavaScript.
- Mobile can compress the panels, but desktop should feel like a real shop counter.
- Use the main art's natural aspect ratio when possible. Coffee Shop currently uses the cafe background ratio, not an arbitrary 16:9 crop.

### Target Player Loop

1. A customer walks in from the door and joins the line.
2. The first customer shows an order bubble or ticket.
3. The player clicks the ticket/customer to make the order active.
4. The player clicks or drags products from shelves to the pickup counter.
5. The selected product appears physically on the tray.
6. The player clicks the service bell on the counter.
7. The game checks the tray against the active order.
8. Correct service gives money, tip, and happy feedback.
9. Wrong service gives a refund/mistake pop and reputation loss.
10. The customer leaves through the door and the line advances.

This loop borrows the physical station feeling from cooking games, the visible shelf/stock behavior from store simulators, and the cozy customer personality from cafe/restaurant sims.

### Screen Layout Direction

- Back wall: shelves, product slots, upgrade objects, menu board.
- Door area: customer entry/exit and queue start.
- Counter/table: prep tray, service bell, register, active order.
- Cafe floor: waiting line and a few tables/customers for atmosphere.
- Cash HUD: visible, attractive, and readable; cash is more important than secondary stats.
- No bottom detached button strip.

### Product Interaction

- Each product should have a real sprite on a shelf: coffee, latte, pastry, cake, cold brew, tea.
- Clicking a shelf item places that item onto the tray.
- If the product is out of stock, the shelf slot should look empty and do a small shake.
- Restocking should fill shelf slots visually. Ideally it should be a shelf/crate click, not a normal button.
- Later, multi-item orders can use a tray with two or three slots.

### Customer Behavior

- Customers need small readable states:
  - entering
  - waiting
  - ordering
  - happy
  - annoyed
  - leaving
- The line should use fixed queue spots so people visibly move forward.
- The first customer should stand closer to the counter than the rest.
- Patience should be shown near the customer or order bubble, not in a separate management panel.
- Customer types should affect pacing: fast office worker, patient student, high-tip regular, reputation-sensitive reviewer.

### Upgrade Behavior

Every upgrade should change the room visually:

- Espresso Machine: appears on counter, unlocks latte.
- Pastry Display: appears beside register, unlocks cake.
- Outdoor Sign: appears near door, increases foot traffic.
- Second Grinder: appears on shelf/counter, increases coffee profit.
- Barista Helper: character appears behind counter, can auto-clear simple orders later.
- Cozy Seating: adds better tables/chairs, increases patience.
- Loyalty App: register/tablet appears, improves tips.
- Nitro Tap: tap appears behind counter, unlocks cold brew.

If an upgrade cannot be represented visually, it should probably wait.

### Asset Plan

Use a layered approach:

- Background: one cute cafe room image.
- Props: shelves, counter, tables, register, door sign, machines.
- Products: transparent product sprites, one per sellable item.
- Characters: small customer sprites or tokens with expression variants.
- Feedback: tiny popups for money, tip, mistake, patience loss.
- UI: minimal panels that look like objects in the shop, such as chalkboards, receipts, labels, tags, and tray slots.

Kenney is the safest external source to start from because the Food Kit, UI Pack, and Tiny Town pages list CC0 licenses. For itch.io/OpenGameArt, we should only add assets after saving the license and author in `assets/ASSET_CREDITS.md`.

### Current Code Pattern

Coffee Shop now uses these concepts:

- `state.activeCustomerId`: the customer/ticket currently being prepared.
- `state.tray`: selected product IDs waiting on the counter.
- `productCatalog`: product id, name, price, stock requirements, image mapping, unlock requirement.
- `renderTray()`: shows prepared products on the pickup counter.
- `pickProduct(productId)`: moves product from shelf stock to tray.
- `ringBell()`: validates tray vs active order instead of simply serving the first queue item.
- `completeOrder()`: handles money, tips, reputation, mood, and exit animation.
- `clearTray()`: returns prepared product requirements when manually clearing the tray.
- `setPlayerPaused()`: freezes gameplay timing without saving pause state.

The important shift is that the bell should not be the whole action. The bell should be the final confirmation after the player has physically prepared something.

### Recommendation

For the next Coffee Shop pass, polish the already-implemented tactile loop:

1. Improve shelf full/low/empty visuals.
2. Improve customer entry/exit animation.
3. Improve upgrade prop detail and level states.
4. Add a compact shift summary/receipt.
5. Consider multi-item tray orders once the single-item loop feels excellent.
