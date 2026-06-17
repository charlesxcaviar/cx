# Monetization Plan

Shop Simulators should keep the toy-like, fullscreen game feeling while staying ready for AdSense and HTML5 game ads.

## Current Build

- Real ads are disabled until `window.ShopSimulatorsAdConfig.adsenseClient` is set to a valid `ca-pub-...` publisher ID and `enabled` is changed to `true`.
- `assets/js/site-ads.js` is the only site-wide ad loader. Every page should include it after defining `window.ShopSimulatorsAdConfig`.
- Game pages should not place fixed banner ads inside the game scene.
- Game pages should avoid close right/left ad boxes, persistent game-list sidebars, and below-game content sections.
- Game pages should use centered one-screen gameplay with quiet far-left/far-right browser gutters for future side rails.
- Coffee Shop currently uses a larger centered game canvas matched to the cafe art ratio, while still preserving side gutters for future ads.
- Game controls, progress, orders, stock, upgrades, pause/save/reset, and feedback should stay inside the game screen.
- Game sections should keep `google-side-rail-overlap="false"` where side rails should not overlap gameplay.
- Vignette ads are intentionally disabled for the site experience. Internal links are marked with `data-google-vignette="false"` as a code-level guard against link-triggered vignettes.

## Page Strategy

- Home page: use the main grid as the product. Auto ads should prioritize side rails on desktop after approval/testing.
- Game pages: make the playable area the whole experience. Keep game controls, progress, inventory, orders, and upgrade actions inside the game screen.
- Game pages should not rely on below-game ad/content blocks. Return-to-home navigation handles discovery, and future side rails handle the Neal.fun-style desktop ad area.
- Future informational pages: can use in-page ad slots because there is no frantic gameplay area.
- Future SEO/discovery content should live on the homepage or separate informational pages, not below the games.

## Game Strategy

- Each game should expose natural ad-break moments through `ShopSimulatorsAds.gameBreak()`.
- Good breaks: after a milestone, after a shift summary, after a level/shop-stage transition, when opening a non-gameplay customization view, or after several completed orders.
- Bad breaks: during product picking, while an item is on the tray, next to the bell/register, during rapid clicking, while a customer is actively waiting, before the first interaction, or as a forced pre-roll before the game is visible.
- Pause should freeze gameplay, but pausing itself should not trigger an ad.
- The best future ad-break UI is a receipt/shift summary, not an interruption in the middle of serving.

## Future Activation

When AdSense is approved:

1. Add the publisher ID in each page config.
2. Change `enabled` to `true`.
3. Turn on `autoAds`.
4. Turn on `h5GameAds` only after testing game-break frequency.
5. Keep `vignetteAds: false` in page config unless the site strategy changes.
6. In the AdSense dashboard, keep Vignette ads turned off and do not allow additional vignette triggers.
7. Configure overlay formats around side rails first.
8. Avoid anchors on game pages unless future testing proves they do not cover gameplay, controls, or the money HUD.
9. Keep game sections marked with `google-side-rail-overlap="false"` where side rails should not overlap gameplay.
10. Test desktop, mobile, and ad-blocked sessions before enabling ads broadly.
