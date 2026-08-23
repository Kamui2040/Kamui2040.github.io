(() => {
  "use strict";

  const globalLabels = {
    en: { menu: "K2040 navigation", home: "Home", android: "Android Projects", gaming: "Gaming Mods", projectAreas: "Project Areas", news: "News", about: "About", androidHome: "Android Home", apps: "Apps", updates: "Updates", modsHome: "Mods Home", modProjects: "Mod Projects" },
    de: { menu: "K2040-Navigation", home: "Home", android: "Android-Projekte", gaming: "Gaming Mods", projectAreas: "Projektbereiche", news: "News", about: "Info", androidHome: "Android-Startseite", apps: "Apps", updates: "Updates", modsHome: "Mods-Startseite", modProjects: "Mod-Projekte" },
    "pt-PT": { menu: "Navegação K2040", home: "Início", android: "Projetos Android", gaming: "Gaming Mods", projectAreas: "Áreas de projetos", news: "Notícias", about: "Sobre", androidHome: "Início Android", apps: "Apps", updates: "Atualizações", modsHome: "Início dos Mods", modProjects: "Projetos de Mods" },
    es: { menu: "Navegación K2040", home: "Inicio", android: "Proyectos Android", gaming: "Gaming Mods", projectAreas: "Áreas de proyectos", news: "Noticias", about: "Acerca de", androidHome: "Inicio Android", apps: "Apps", updates: "Actualizaciones", modsHome: "Inicio de Mods", modProjects: "Proyectos de Mods" },
    fr: { menu: "Navigation K2040", home: "Accueil", android: "Projets Android", gaming: "Gaming Mods", projectAreas: "Domaines de projets", news: "Actualités", about: "À propos", androidHome: "Accueil Android", apps: "Apps", updates: "Mises à jour", modsHome: "Accueil des Mods", modProjects: "Projets de Mods" }
  };

  const normalizeLanguage = (value) => {
    const normalized = (value || "").toLowerCase();
    if (normalized.startsWith("de")) return "de";
    if (normalized.startsWith("pt")) return "pt-PT";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("fr")) return "fr";
    return "en";
  };

  const storedLanguage = () => {
    try {
      const value = localStorage.getItem("k2040-language");
      if (value && globalLabels[value]) return value;
    } catch {}
    return normalizeLanguage(document.documentElement.lang || navigator.language);
  };

  const applyGlobalLabels = (language = storedLanguage()) => {
    const copy = globalLabels[language] || globalLabels.en;
    document.querySelectorAll("[data-global-i18n]").forEach((element) => {
      const value = copy[element.dataset.globalI18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-global-aria]").forEach((element) => {
      const value = copy[element.dataset.globalAria];
      if (value) element.setAttribute("aria-label", value);
    });
  };

  const initMenu = (menu) => {
    const items = [...menu.querySelectorAll("[data-global-menu-item]")];

    const reposition = (item) => {
      item.classList.remove("global-menu-item--flip");
      if (!item.open || window.innerWidth <= 760) return;
      requestAnimationFrame(() => {
        const panel = menu.querySelector(".global-menu-panel");
        const submenu = item.querySelector(".global-menu-submenu");
        if (!panel || !submenu) return;
        const panelRect = panel.getBoundingClientRect();
        const submenuWidth = submenu.offsetWidth || 245;
        const gap = 9;
        const margin = 16;
        const fitsRight = panelRect.right + gap + submenuWidth <= window.innerWidth - margin;
        const fitsLeft = panelRect.left - gap - submenuWidth >= margin;
        item.classList.toggle("global-menu-item--flip", !fitsRight && fitsLeft);
      });
    };

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
        reposition(item);
      });
    });

    menu.addEventListener("toggle", () => {
      if (!menu.open) items.forEach((item) => { item.open = false; });
    });

    window.addEventListener("resize", () => {
      items.forEach(reposition);
    }, { passive: true });
  };

  const init = () => {
    document.querySelectorAll("[data-global-menu]").forEach(initMenu);
    applyGlobalLabels();

    document.querySelectorAll("[data-language-option]").forEach((button) => {
      button.addEventListener("click", () => {
        if (globalLabels[button.dataset.languageOption]) applyGlobalLabels(button.dataset.languageOption);
      });
    });

    document.addEventListener("click", (event) => {
      document.querySelectorAll("[data-global-menu][open]").forEach((menu) => {
        if (!menu.contains(event.target)) menu.open = false;
      });
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "k2040-language") applyGlobalLabels(event.newValue || "en");
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
