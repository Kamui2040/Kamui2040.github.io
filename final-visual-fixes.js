(() => {
  "use strict";

  const ICONS = {
    home: "/assets/icons/k2040-home.webp",
    android: "/assets/icons/k2040-android.webp?v=20260826outline1",
    gaming: "/assets/icons/k2040-gaming.webp?v=20260826outline1"
  };

  const labels = {
    en: { home: "Home", android: "Android Projects", gaming: "Gaming Mods" },
    de: { home: "Home", android: "Android-Projekte", gaming: "Gaming Mods" },
    "pt-PT": { home: "Início", android: "Projetos Android", gaming: "Gaming Mods" },
    es: { home: "Inicio", android: "Proyectos Android", gaming: "Gaming Mods" },
    fr: { home: "Accueil", android: "Projets Android", gaming: "Gaming Mods" }
  };

  const footerLinks = [
    { key: "home", href: "/" },
    { key: "android", href: "/K2040-Android-Releases/" },
    { key: "gaming", href: "/K2040-Gaming-Mods/" },
    { key: "github", href: "https://github.com/Kamui2040", label: "GitHub" },
    { key: "nexus", href: "https://next.nexusmods.com/profile/kamui2040", label: "Nexus Mods" },
    { key: "kofi", href: "https://ko-fi.com/k2040", label: "Ko-fi" },
    { key: "instagram", href: "https://www.instagram.com/k2040.projects/", label: "Instagram" }
  ];

  const normalizeLanguage = (value) => {
    const language = (value || "").toLowerCase();
    if (language.startsWith("de")) return "de";
    if (language.startsWith("pt")) return "pt-PT";
    if (language.startsWith("es")) return "es";
    if (language.startsWith("fr")) return "fr";
    return "en";
  };

  const language = () => normalizeLanguage(document.documentElement.lang || navigator.language);
  const labelFor = (item) => item.label || (labels[language()] || labels.en)[item.key] || item.key;

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
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      link.prepend(icon);
    }
    icon.className = `site-family-icon site-family-icon--${family}`;
    icon.src = ICONS[family];
    icon.decoding = "async";
    link.classList.add("site-family-link");
    link.dataset.siteFamilyIcon = "done";
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

  const decorateLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    ensureFamilyIcon(link);
    ensureNexusIcon(link);
  };

  const decorateLinks = (root = document) => {
    if (root instanceof HTMLAnchorElement) decorateLink(root);
    root.querySelectorAll?.("a[href]").forEach(decorateLink);
  };

  const ensureFooter = () => {
    const shell = document.querySelector(".page-shell");
    const main = shell?.querySelector("main");
    if (!shell || !main) return null;

    let footer = shell.querySelector(":scope > .site-footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "site-footer";
      main.after(footer);
    }

    let nav = footer.querySelector(":scope > .footer-links");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "footer-links";
      nav.setAttribute("aria-label", "K2040 links");
      footer.replaceChildren(nav);
    }

    footerLinks.forEach((item) => {
      let link = nav.querySelector(`:scope > a[data-footer-key="${item.key}"]`);
      if (!link) {
        link = document.createElement("a");
        link.className = "text-link";
        link.dataset.footerKey = item.key;
        nav.append(link);
      }
      link.href = item.href;
      const label = link.querySelector(":scope > .external-platform-label");
      if (label) label.textContent = labelFor(item);
      else {
        const icon = link.querySelector(":scope > .site-family-icon, :scope > .external-platform-icon");
        if (icon) {
          [...link.childNodes].filter((node) => node !== icon).forEach((node) => node.remove());
          link.append(document.createTextNode(labelFor(item)));
        } else link.textContent = labelFor(item);
      }
      decorateLink(link);
    });

    [...nav.querySelectorAll(":scope > a[data-footer-key]")].forEach((link) => {
      if (!footerLinks.some((item) => item.key === link.dataset.footerKey)) link.remove();
    });

    return footer;
  };

  const refreshFooter = () => {
    const footer = ensureFooter();
    if (footer) decorateLinks(footer);
  };

  const init = () => {
    refreshFooter();
    decorateLinks();

    new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) decorateLinks(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.addEventListener("change", () => requestAnimationFrame(refreshFooter));
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
