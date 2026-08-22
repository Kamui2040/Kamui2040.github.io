(() => {
  "use strict";

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
          ? "Original mod · Nexus Mods"
          : "Nexus Mods";
      }
    });
  });
})();
