(() => {
  "use strict";

  const ICONS = {
    home: "/assets/icons/k2040-home.webp",
    android: "/assets/icons/k2040-android.webp?v=20260826outline2",
    gaming: "/assets/icons/k2040-gaming.webp?v=20260826outline2"
  };

  const footerLinks = [
    ["/", "Home"],
    ["/K2040-Android-Releases/", "Android Projects"],
    ["/K2040-Gaming-Mods/", "Gaming Mods"],
    ["https://github.com/Kamui2040", "GitHub"],
    ["https://next.nexusmods.com/profile/kamui2040", "Nexus Mods"],
    ["https://ko-fi.com/k2040", "Ko-fi"],
    ["https://www.instagram.com/k2040.projects/", "Instagram"]
  ];

  const familyFor = (link) => {
    let url;
    try { url = new URL(link.href, location.href); } catch { return null; }
    const path = url.pathname.replace(/\/+$/, "/");
    if (url.hostname === "kamui2040.github.io" && path === "/") return "home";
    if (path.startsWith("/K2040-Android-Releases/")) return "android";
    if (path.startsWith("/K2040-Gaming-Mods/")) return "gaming";
    return null;
  };

  const ensureFamilyIcon = (link) => {
    const family = familyFor(link);
    if (!family) return;
    let icon = link.querySelector(":scope > .site-family-icon");
    if (!icon) {
      icon = document.createElement("img");
      icon.className = `site-family-icon site-family-icon--${family}`;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      link.prepend(icon);
    }
    icon.src = ICONS[family];
    icon.decoding = "async";
    link.classList.add("site-family-link");
  };

  const ensureNexusIcon = (link) => {
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const host = url.hostname.toLowerCase();
    if (!(host === "nexusmods.com" || host.endsWith(".nexusmods.com"))) return;

    let icon = link.querySelector(":scope > .external-platform-icon");
    if (!icon) {
      const labelText = link.textContent.trim() || "Nexus Mods";
      link.textContent = "";
      icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "external-platform-label";
      label.textContent = labelText;
      link.append(icon, label);
    }
    icon.className = "external-platform-icon external-platform-icon--nexus external-platform-icon--monogram";
    link.classList.add("external-platform-link");
    link.dataset.externalPlatform = "nexus";
  };

  const decorateLinks = (root = document) => {
    root.querySelectorAll?.("a[href]").forEach((link) => {
      ensureFamilyIcon(link);
      ensureNexusIcon(link);
    });
  };

  const ensureFooter = () => {
    document.querySelectorAll(".about-section .about-links").forEach((links) => links.remove());

    const shell = document.querySelector(".page-shell");
    const main = shell?.querySelector("main");
    if (!shell || !main) return;

    let footer = shell.querySelector(":scope > .site-footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "site-footer";
      main.after(footer);
    }

    const nav = document.createElement("nav");
    nav.className = "footer-links";
    nav.setAttribute("aria-label", "K2040 links");
    footerLinks.forEach(([href, label]) => {
      const link = document.createElement("a");
      link.className = "text-link";
      link.href = href;
      link.textContent = label;
      nav.append(link);
    });
    footer.replaceChildren(nav);
    decorateLinks(footer);
  };

  let queued = false;
  const refresh = () => {
    queued = false;
    ensureFooter();
    decorateLinks();
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  };

  const init = () => {
    refresh();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
