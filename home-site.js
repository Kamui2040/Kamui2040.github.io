(() => {
  "use strict";

  const languageKey = "k2040-language";
  const supported = ["en", "de", "pt-PT", "es", "fr"];
  const labels = {
    en: { menu: "K2040 navigation", home: "Home", android: "Android Projects", gaming: "Gaming Mods", projectAreas: "Project Areas", news: "News", about: "About", androidHome: "Android Home", apps: "Apps", updates: "Updates", modsHome: "Mods Home", modProjects: "Mod Projects", newsEyebrow: "Latest", newsTitle: "News", newsDescription: "Meaningful public changes and the latest updates from K2040 projects.", viewAll: "View all news", aboutDescription: "A central place for K2040 apps, game mods, tools, releases, documentation, and public updates.", newsMeta: "News · K2040 Projects", latestUpdate: "Latest update" },
    de: { menu: "K2040-Navigation", home: "Home", android: "Android-Projekte", gaming: "Gaming Mods", projectAreas: "Projektbereiche", news: "News", about: "Info", androidHome: "Android-Startseite", apps: "Apps", updates: "Updates", modsHome: "Mods-Startseite", modProjects: "Mod-Projekte", newsEyebrow: "Neu", newsTitle: "News", newsDescription: "Wichtige öffentliche Änderungen und die neuesten Updates der K2040-Projekte.", viewAll: "Alle News anzeigen", aboutDescription: "Ein zentraler Ort für K2040-Apps, Spiele-Mods, Tools, Veröffentlichungen, Dokumentation und öffentliche Updates.", newsMeta: "News · K2040 Projects", latestUpdate: "Neuestes Update" },
    "pt-PT": { menu: "Navegação K2040", home: "Início", android: "Projetos Android", gaming: "Gaming Mods", projectAreas: "Áreas de projetos", news: "Notícias", about: "Sobre", androidHome: "Início Android", apps: "Apps", updates: "Atualizações", modsHome: "Início dos Mods", modProjects: "Projetos de Mods", newsEyebrow: "Novidades", newsTitle: "Notícias", newsDescription: "Alterações públicas importantes e as atualizações mais recentes dos projetos K2040.", viewAll: "Ver todas as notícias", aboutDescription: "Um local central para apps K2040, mods de jogos, ferramentas, lançamentos, documentação e atualizações públicas.", newsMeta: "Notícias · K2040 Projects", latestUpdate: "Atualização mais recente" },
    es: { menu: "Navegación K2040", home: "Inicio", android: "Proyectos Android", gaming: "Gaming Mods", projectAreas: "Áreas de proyectos", news: "Noticias", about: "Acerca de", androidHome: "Inicio Android", apps: "Apps", updates: "Actualizaciones", modsHome: "Inicio de Mods", modProjects: "Proyectos de Mods", newsEyebrow: "Novedades", newsTitle: "Noticias", newsDescription: "Cambios públicos importantes y las últimas actualizaciones de los proyectos K2040.", viewAll: "Ver todas las noticias", aboutDescription: "Un lugar central para aplicaciones K2040, mods de juegos, herramientas, lanzamientos, documentación y actualizaciones públicas.", newsMeta: "Noticias · K2040 Projects", latestUpdate: "Última actualización" },
    fr: { menu: "Navigation K2040", home: "Accueil", android: "Projets Android", gaming: "Gaming Mods", projectAreas: "Domaines de projets", news: "Actualités", about: "À propos", androidHome: "Accueil Android", apps: "Apps", updates: "Mises à jour", modsHome: "Accueil des Mods", modProjects: "Projets de Mods", newsEyebrow: "Nouveautés", newsTitle: "Actualités", newsDescription: "Les changements publics importants et les dernières mises à jour des projets K2040.", viewAll: "Voir toutes les actualités", aboutDescription: "Un point central pour les applications K2040, les mods de jeux, les outils, les versions, la documentation et les mises à jour publiques.", newsMeta: "Actualités · K2040 Projects", latestUpdate: "Dernière mise à jour" }
  };

  const normalize = (value) => {
    const tag = (value || "").toLowerCase();
    if (tag.startsWith("de")) return "de";
    if (tag.startsWith("pt")) return "pt-PT";
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("fr")) return "fr";
    return "en";
  };

  const currentLanguage = () => {
    try {
      const saved = localStorage.getItem(languageKey);
      if (supported.includes(saved)) return saved;
    } catch {}
    return normalize(document.documentElement.lang || navigator.language);
  };

  let language = currentLanguage();
  let feeds = { android: [], gaming: [] };
  let combined = [];

  const localStrings = (entry) => entry?.strings?.[language] || entry?.strings?.en || {};
  const updateTime = (entry) => {
    const value = Date.parse(`${entry?.date || ""}T00:00:00Z`);
    return Number.isNaN(value) ? null : value;
  };
  const sorted = (entries = combined) => entries
    .map((entry, index) => ({ entry, index, time: updateTime(entry) }))
    .sort((left, right) => {
      if (left.time === null && right.time === null) return left.index - right.index;
      if (left.time === null) return 1;
      if (right.time === null) return -1;
      if (left.time !== right.time) return right.time - left.time;
      return left.index - right.index;
    })
    .map(({ entry }) => entry);

  const formatDate = (date) => new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));

  const applyLabels = () => {
    const copy = labels[language] || labels.en;
    document.querySelectorAll("[data-home-i18n]").forEach((element) => {
      const value = copy[element.dataset.homeI18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-home-aria]").forEach((element) => {
      const value = copy[element.dataset.homeAria];
      if (value) element.setAttribute("aria-label", value);
    });
    if (document.body.classList.contains("news-page")) {
      document.title = copy.newsMeta;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = copy.newsDescription;
    }
  };

  const renderNews = () => {
    const list = document.querySelector("[data-update-list]");
    const template = document.querySelector("#update-card-template");
    if (!list || !template) return;

    const entries = document.body.classList.contains("news-page") ? sorted() : sorted().slice(0, 5);
    list.replaceChildren();

    for (const update of entries) {
      const strings = localStrings(update);
      const fragment = template.content.cloneNode(true);
      const time = fragment.querySelector("[data-update-date]");
      time.dateTime = update.date;
      time.textContent = formatDate(update.date);
      fragment.querySelector("[data-update-category]").textContent = strings.category || "";
      fragment.querySelector("[data-update-title]").textContent = strings.title || "";
      fragment.querySelector("[data-update-summary]").textContent = strings.summary || "";
      const link = fragment.querySelector("[data-update-link]");
      if (update.href) {
        link.href = update.href;
        link.textContent = window.K2040_TRANSLATIONS?.[language]?.actions?.readMore || "Read more";
      } else {
        link.remove();
      }
      list.append(fragment);
    }
  };

  const projectAreaForCard = (card) => {
    let url;
    try { url = new URL(card.href, location.href); } catch { return null; }
    if (url.pathname.startsWith("/K2040-Android-Releases/")) return "android";
    if (url.pathname.startsWith("/K2040-Gaming-Mods/")) return "gaming";
    return null;
  };

  const renderProjectAreas = () => {
    if (!document.body.classList.contains("projects-home-page")) return;
    const copy = labels[language] || labels.en;

    document.querySelectorAll("[data-project-grid] > a.project-card").forEach((card) => {
      const area = projectAreaForCard(card);
      const latest = area ? sorted(feeds[area]).at(0) : null;
      card.querySelector(":scope > .project-latest")?.remove();
      if (!latest) return;

      const strings = localStrings(latest);
      const block = document.createElement("div");
      block.className = "project-latest";

      const label = document.createElement("span");
      label.className = "project-latest-label";
      label.textContent = copy.latestUpdate;

      const title = document.createElement("strong");
      title.textContent = strings.title || strings.category || "";

      const time = document.createElement("time");
      time.dateTime = latest.date;
      time.textContent = formatDate(latest.date);

      block.append(label, title, time);
      const footer = card.querySelector(":scope > .card-footer");
      if (footer) card.insertBefore(block, footer);
      else card.append(block);
    });
  };

  const render = () => {
    renderNews();
    renderProjectAreas();
  };

  const loadScriptData = async (url, selector) => {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    const source = await response.text();
    const sandbox = {};
    new Function("window", `"use strict";\n${source}`)(sandbox);
    const value = selector(sandbox);
    return Array.isArray(value) ? value : [];
  };

  const loadFeeds = async () => {
    const results = await Promise.allSettled([
      loadScriptData("/K2040-Android-Releases/updates/latest.js", (box) => box.K2040_CONTENT?.updates),
      loadScriptData("/K2040-Gaming-Mods/updates/2026.js", (box) => box.K2040_GAMING_UPDATES)
    ]);

    feeds = {
      android: results[0].status === "fulfilled" ? results[0].value : [],
      gaming: results[1].status === "fulfilled" ? results[1].value : []
    };
    combined = [...feeds.android, ...feeds.gaming];
    render();
  };

  const init = () => {
    applyLabels();
    combined = [];
    render();

    const select = document.querySelector("[data-language-select]");
    select?.addEventListener("change", () => {
      if (!supported.includes(select.value)) return;
      language = select.value;
      applyLabels();
      requestAnimationFrame(render);
    });

    loadFeeds().catch(() => render());
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
