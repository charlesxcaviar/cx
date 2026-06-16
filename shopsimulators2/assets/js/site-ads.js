(function () {
  "use strict";

  const config = window.ShopSimulatorsAdConfig || {};
  const publisherId = String(config.adsenseClient || "").trim();
  const hasPublisherId = /^ca-pub-\d{6,}$/.test(publisherId);
  const adsEnabled = config.enabled === true && hasPublisherId;
  const h5GameAdsEnabled = adsEnabled && config.h5GameAds === true;
  let scriptLoaded = false;

  function completeWithoutAd(options, status) {
    if (options && typeof options.adBreakDone === "function") {
      window.setTimeout(() => {
        options.adBreakDone({ breakStatus: status || "disabled" });
      }, 0);
    }
  }

  function installAdQueue() {
    window.adsbygoogle = window.adsbygoogle || [];

    if (typeof window.adBreak !== "function") {
      window.adBreak = function (options) {
        window.adsbygoogle.push(options);
      };
    }

    if (typeof window.adConfig !== "function") {
      window.adConfig = function (options) {
        window.adsbygoogle.push(options);
      };
    }
  }

  function loadAdSenseScript() {
    if (!adsEnabled || scriptLoaded || document.querySelector("script[data-shop-simulators-adsense]")) {
      return false;
    }

    installAdQueue();

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.shopSimulatorsAdsense = "true";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(publisherId);

    if (config.adFrequencyHint) {
      script.dataset.adFrequencyHint = String(config.adFrequencyHint);
    }

    if (config.adBreakTest === true) {
      script.dataset.adbreakTest = "on";
    }

    document.head.appendChild(script);
    scriptLoaded = true;
    return true;
  }

  function configureGame(options) {
    if (!h5GameAdsEnabled) {
      return false;
    }

    loadAdSenseScript();
    window.adConfig({
      preloadAdBreaks: (options && options.preloadAdBreaks) || config.preloadAdBreaks || "auto",
      sound: (options && options.sound) || config.sound || "off"
    });
    return true;
  }

  function gameBreak(options) {
    if (!h5GameAdsEnabled || typeof window.adBreak !== "function") {
      completeWithoutAd(options, adsEnabled ? "unavailable" : "disabled");
      return false;
    }

    const placement = {
      type: (options && options.type) || "next",
      name: (options && options.name) || "game_break"
    };

    ["beforeAd", "afterAd", "beforeReward", "adDismissed", "adViewed", "adBreakDone"].forEach((key) => {
      if (options && typeof options[key] === "function") {
        placement[key] = options[key];
      }
    });

    window.adBreak(placement);
    return true;
  }

  function protectSamePageLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.setAttribute("data-google-vignette", "false");
    });
  }

  if (adsEnabled && (config.autoAds === true || config.h5GameAds === true)) {
    loadAdSenseScript();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectSamePageLinks);
  } else {
    protectSamePageLinks();
  }

  window.ShopSimulatorsAds = {
    enabled: adsEnabled,
    h5GameAdsEnabled,
    load: loadAdSenseScript,
    configureGame,
    gameBreak
  };
})();
