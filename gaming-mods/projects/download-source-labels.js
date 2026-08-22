(() => {
  "use strict";

  const supportedLanguages = ["en", "de", "pt-PT", "es", "fr"];
  const originalModLabels = {
    en: "Original mod · Nexus Mods",
    de: "Original-Mod · Nexus Mods",
    "pt-PT": "Mod original · Nexus Mods",
    es: "Mod original · Nexus Mods",
    fr: "Mod original · Nexus Mods"
  };

  const currentLanguage = (() => {
    const hashLanguage = location.hash.slice(1);
    if (supportedLanguages.includes(hashLanguage)) {
      return hashLanguage;
    }

    try {
      const storedLanguage = localStorage.getItem("k2040-language");
      return supportedLanguages.includes(storedLanguage) ? storedLanguage : "en";
    } catch {
      return "en";
    }
  })();

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".project-detail-page main a[data-brand]").forEach((link) => {
      const brand = link.dataset.brand;
      const href = link.href;

      if (brand === "github") {
        link.textContent = "GitHub Releases";
        return;
      }

      if (brand === "nexus") {
        link.textContent = href === "https://www.nexusmods.com/deadislandriptide/mods/3"
          ? originalModLabels[currentLanguage]
          : "Nexus Mods";
      }
    });
  });
})();
