# Monetization Plan

Shop Simulators should keep the toy-like, fullscreen game feeling while staying ready for AdSense and HTML5 game ads.

## Current Build

- Real ads are disabled until `window.ShopSimulatorsAdConfig.adsenseClient` is set to a valid `ca-pub-...` publisher ID and `enabled` is changed to `true`.
- `assets/js/site-ads.js` is the only site-wide ad loader. Every page should include it after defining `window.ShopSimulatorsAdConfig`.
- Game pages should not place fixed banner ads inside the game scene.
- Game pages should avoid close right-rail ad boxes and persistent game-list sidebars beside gameplay. Use Auto ads overlays, below-game slots, below-game related links, and natural game breaks instead.
- Same-page hash links are marked with `data-google-vignette="false"` so in-page jumps do not become disruptive transition-ad triggers.

## Page Strategy

- Home page: use the main grid as the product. Auto ads can handle anchors, vignettes, and side rails after the site is approved.
- Game pages: make the playable area the first real experience. Keep visible ad slots and broad game navigation below the game/content, not inside or beside the cafe/shop screen.
- Future informational pages: can use in-page ad slots because there is no frantic gameplay area.

## Game Strategy

- Each game should expose natural ad-break moments through `ShopSimulatorsAds.gameBreak()`.
- Good breaks: after a milestone, after a level/shop-stage transition, when opening a non-gameplay upgrade/customization view, or after several completed orders.
- Bad breaks: during a drag, next to a serve button, during rapid clicking, before the first interaction, or as a forced pre-roll before the game is visible.

## Future Activation

When AdSense is approved:

1. Add the publisher ID in each page config.
2. Change `enabled` to `true`.
3. Turn on `autoAds`.
4. Turn on `h5GameAds` only after testing game-break frequency.
5. Configure overlay formats in AdSense: anchors, vignettes, and side rails.
6. Keep game sections marked with `google-side-rail-overlap="false"` where side rails should not overlap gameplay.
