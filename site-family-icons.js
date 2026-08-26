(() => {
  "use strict";

  const ICONS = {
    home: "/assets/icons/k2040-home.webp",
    android: "/assets/icons/k2040-android.webp?v=20260826outline1",
    gaming: "/assets/icons/k2040-gaming.webp?v=20260826outline1"
  };

  const targetFor = (link) => {
    let url;
    try { url = new URL(link.href, location.href); } catch { return null; }
    const path = url.pathname.replace(/\/+$/, "/");
    if (path.startsWith("/K2040-Android-Releases/")) return "android";
    if (path.startsWith("/K2040-Gaming-Mods/")) return "gaming";
    if (url.hostname === "kamui2040.github.io" && path === "/") return "home";
    return null;
  };

  const decorate = (link) => {
    if (!(link instanceof HTMLAnchorElement) || link.dataset.siteFamilyIcon === "done") return;
    const target = targetFor(link);
    if (!target) return;
    const icon = document.createElement("img");
    icon.className = `site-family-icon site-family-icon--${target}`;
    icon.src = ICONS[target];
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.decoding = "async";
    link.prepend(icon);
    link.classList.add("site-family-link");
    link.dataset.siteFamilyIcon = "done";
  };

  const apply = (root = document) => {
    root.querySelectorAll?.(".about-links a, .site-footer nav a, a[data-site-family-icon]").forEach(decorate);
  };

  const init = () => {
    apply();
    new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.(".about-links a, .site-footer nav a, a[data-site-family-icon]")) decorate(node);
        apply(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
