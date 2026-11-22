/* K2040 | Fresh navigation and page behavior, no legacy CSS or UI dependencies. */
(() => {
  "use strict";
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const dictionaries = window.K2040_COPY || {};
  const allowed = ["en", "de", "pt-PT", "es", "fr"];
  const safeRead = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeWrite = (key,value) => { try { localStorage.setItem(key,value); } catch { /* Private browsing */ } };
  const pathValue = (obj,key) => key.split(".").reduce((cur,part) => cur?.[part],obj);
  const normalize = value => {
    const v = String(value || "").toLowerCase();
    if (v.startsWith("pt")) return "pt-PT";
    return allowed.find(lang => v===lang || v.startsWith(lang+"-")) || null;
  };
  const preferred = () => normalize(safeRead("k2040-language")) ||
    (navigator.languages || [navigator.language]).map(normalize).find(Boolean) || "en";
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const rememberedTheme = safeRead("k2040-theme");
  if (rememberedTheme==="dark" || rememberedTheme==="light") {
    root.dataset.theme = rememberedTheme;
  }
  let language = preferred();
  // The relaunch starts with only local announcements. Future redesigned project
  // sites can opt in one at a time after their new versioned feeds are verified.
  // Never point these sources at legacy release/news endpoints.
  const relaunchFeedSources = Object.freeze([]);
  const siteUpdates=Array.isArray(window.K2040_SITE_NEWS) ? window.K2040_SITE_NEWS : [];
  let updates=[...siteUpdates];
  const header = document.querySelector(".masthead");
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobile = document.querySelector(".mobile-nav");
  const languageSelect = document.querySelector("[data-language]");
  const themeButton = document.querySelector("button[data-theme-toggle]");
  const copy = () => dictionaries[language] || dictionaries.en;
  const renderCopy = () => {
    document.documentElement.lang = language;
    const labels = copy();
    for (const node of document.querySelectorAll("[data-copy]")) {
      const value = pathValue(labels,node.dataset.copy);
      if (typeof value === "string") node.textContent = value;
    }
    for (const node of document.querySelectorAll("[data-copy-aria]")) {
      const value = pathValue(labels,node.dataset.copyAria);
      if (typeof value === "string") node.setAttribute("aria-label",value);
    }
    if (languageSelect) languageSelect.value = language;
    const postTitle = document.querySelector("[data-note-title]");
    const localizedPostTitle = postTitle?.querySelector('[data-post-locale="'+language+'"]')?.textContent;
    const postExcerpt = document.querySelector("[data-note-summary]");
    const localizedPostExcerpt = postExcerpt?.querySelector('[data-post-locale="'+language+'"]')?.textContent;
    document.title = localizedPostTitle ? localizedPostTitle+" — K2040 Projects" : labels.meta[page];
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = localizedPostExcerpt || labels.meta[page+"Desc"];
    renderNews();
    renderTheme();
  };
  const isDark = () => root.dataset.theme === "dark" ||
    (!root.dataset.theme && systemDark.matches);
  const renderTheme = () => {
    if (!themeButton) return;
    const dark = isDark();
    themeButton.setAttribute("aria-pressed",String(dark));
    themeButton.querySelector("span").textContent =
      dark ? copy().controls.themeLight : copy().controls.themeDark;
  };
  themeButton?.addEventListener("click",() => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    safeWrite("k2040-theme",next);
    renderTheme();
  });
  systemDark.addEventListener?.("change",renderTheme);
  const closeMenu = (refocus=false) => {
    if (!toggle || !header) return;
    header.dataset.menuOpen="false";
    toggle.setAttribute("aria-expanded","false");
    mobile?.setAttribute("aria-hidden","true");
    if (refocus) toggle.focus();
  };
  toggle?.addEventListener("click",() => {
    const open = header.dataset.menuOpen!=="true";
    header.dataset.menuOpen=String(open);
    toggle.setAttribute("aria-expanded",String(open));
    mobile?.setAttribute("aria-hidden",String(!open));
  });
  mobile?.addEventListener("click",event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown",event => {
    if (event.key==="Escape" && header?.dataset.menuOpen==="true") closeMenu(true);
  });
  document.addEventListener("click",event => {
    if (header?.dataset.menuOpen==="true" && !header.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize",() => {
    if (window.innerWidth>820 && header?.dataset.menuOpen==="true") closeMenu();
  });
  languageSelect?.addEventListener("change",() => {
    if (!allowed.includes(languageSelect.value)) return;
    language=languageSelect.value;
    safeWrite("k2040-language",language);
    renderCopy();
  });
  const validDate = date => /^\d{4}-\d{2}-\d{2}$/.test(String(date)) &&
    !Number.isNaN(Date.parse(date+"T00:00:00Z"));
  const sortNews = entries => entries.filter(item =>
    item && validDate(item.date) && item.strings?.en?.title)
    .sort((a,b)=>Date.parse(b.publishedAt || b.date+"T00:00:00Z") -
                 Date.parse(a.publishedAt || a.date+"T00:00:00Z"));
  const makeElement = (tag,className,text) => {
    const element=document.createElement(tag);
    if(className) element.className=className;
    if(typeof text==="string") element.textContent=text;
    return element;
  };
  const linkAllowed = value => {
    if (typeof value!=="string") return null;
    try {
      const url = new URL(value,location.href);
      if (!["https:","http:"].includes(url.protocol)) return null;
      // Related project sites remain private during the relaunch.
      if (url.hostname==="kamui2040.github.io" &&
          /^\/(K2040-Gaming-Mods|K2040-Android-Releases|The-Library)\//.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  };
  const renderNews = () => {
    const list = document.querySelector("[data-updates]");
    if (!list) return;
    const count = page==="home" ? 5 : Infinity;
    const entries = sortNews([...updates]).slice(0,count);
    list.replaceChildren();
    if(!entries.length) {
      list.append(makeElement("p","empty-state",copy().news.empty));
      return;
    }
    for (const item of entries) {
      const local = item.strings?.[language] || item.strings.en;
      const card = makeElement("article","update-card");
      const dateCol=makeElement("div","update-card__date");
      const time=makeElement("time",null,
        new Intl.DateTimeFormat(language,{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})
          .format(new Date(item.date+"T00:00:00Z")));
      time.dateTime=item.date;
      const category=makeElement("span","update-card__category",local.category || "");
      dateCol.append(time,category);
      const details=makeElement("div","update-card__content");
      details.append(makeElement("h3",null,local.title || ""));
      if (local.summary) details.append(makeElement("p",null,local.summary));
      const href=linkAllowed(item.href) || (Array.isArray(item.links) ?
        item.links.map(linkAllowed).find(Boolean) : null);
      if (href) {
        const a=makeElement("a","update-card__link",copy().news.read);
        a.href=href;
        if (new URL(href).origin!==location.origin) {
          a.target="_blank";
          a.rel="noopener noreferrer";
        }
        details.append(a);
      }
      card.append(dateCol,details);
      list.append(card);
    }
  };
  // New project feeds use JSON rather than executable cross-site scripts.
  // Future source entry: {path, project, launchId}; the new endpoint must serve:
  // {schema:"k2040-relaunch-v1", project, launchId, entries:[...]}
  // Every entry must explicitly carry the same project and launchId, a
  // relaunch:true marker, and a timezone-aware publishedAt for ordering.
  const newFeedItems = async source => {
    if (!source || !/^(?:\/K2040-Gaming-Mods|\/K2040-Android-Releases|\/The-Library)\/updates\/relaunch\.json$/.test(source.path) ||
        typeof source.project!=="string" || !/^[a-z0-9-]+$/.test(source.project) ||
        typeof source.launchId!=="string" || !/^[a-z0-9-]+$/.test(source.launchId)) return [];
    try {
      const response=await fetch(source.path,{credentials:"omit",mode:"same-origin"});
      if (!response.ok) return [];
      const feed=await response.json();
      if (feed?.schema!=="k2040-relaunch-v1" ||
          feed.project!==source.project || feed.launchId!==source.launchId ||
          !Array.isArray(feed.entries)) return [];
      return feed.entries.filter(item =>
        item?.relaunch===true && item.projectId===source.project &&
        item.launchId===source.launchId && validDate(item.date) &&
        typeof item.publishedAt==="string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(item.publishedAt) &&
        !Number.isNaN(Date.parse(item.publishedAt)) &&
        Date.parse(item.publishedAt)<=Date.now() &&
        item.publishedAt.slice(0,10)===item.date &&
        item.strings?.en?.title
      );
    } catch {
      // A project site may still be private or temporarily unavailable.
      return [];
    }
  };
  const loadRelaunchFeeds = async () => {
    if (!document.querySelector("[data-updates]") || !relaunchFeedSources.length) return;
    const sources=await Promise.all(relaunchFeedSources.map(newFeedItems));
    const deduplicated=new Map();
    for (const item of [...siteUpdates,...sources.flat()]) {
      if (typeof item.id==="string" && item.id) deduplicated.set(item.id,item);
    }
    updates=[...deduplicated.values()];
    renderNews();
  };
  renderCopy();
  loadRelaunchFeeds();
})();
