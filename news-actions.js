(() => {
  "use strict";

  const STORES = [
    { key: "github", hosts: ["github.com"], label: "GitHub" },
    { key: "nexus", hosts: ["nexusmods.com"], label: "Nexus Mods" },
    { key: "fdroid", hosts: ["f-droid.org"], label: "F-Droid" },
    { key: "apkpure", hosts: ["apkpure.com"], label: "APKPure" },
    { key: "uptodown", hosts: ["uptodown.com"], label: "Uptodown" },
    { key: "onestore", hosts: ["onestore.net"], label: "ONE store", extraIcon: true },
    { key: "openapk", hosts: ["openapk.net"], label: "OpenAPK", extraIcon: true }
  ];

  const storeFor = (link) => {
    let url;
    try { url = new URL(link.href, location.href); } catch { return null; }
    if (!/^https?:$/.test(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    return STORES.find((store) => store.hosts.some((domain) => host === domain || host.endsWith(`.${domain}`))) || null;
  };

  const ensureLabel = (link, text) => {
    const wrapped = link.querySelector(":scope > .external-platform-label");
    if (wrapped) {
      if (wrapped.textContent !== text) wrapped.textContent = text;
      return wrapped;
    }
    if (link.textContent !== text) link.textContent = text;
    return null;
  };

  const decorateExtraStore = (link, store) => {
    const existingIcon = link.querySelector(":scope > .external-platform-icon");
    if (existingIcon) {
      ensureLabel(link, store.label);
      return;
    }

    const icon = document.createElement("span");
    icon.className = `external-platform-icon external-platform-icon--${store.key}`;
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "external-platform-label";
    label.textContent = store.label;
    link.replaceChildren(icon, label);
    link.classList.add("external-platform-link");
    link.dataset.externalPlatform = store.key;
    link.dataset.platformOnlyLabel = "true";
  };

  const decorate = (link) => {
    const store = storeFor(link);
    if (!store) return;

    link.title = store.label;
    if (store.extraIcon) {
      decorateExtraStore(link, store);
      return;
    }

    link.dataset.brand = store.key;
    const existingIcon = link.querySelector(":scope > .external-platform-icon");
    if (existingIcon) {
      ensureLabel(link, store.label);
      return;
    }

    ensureLabel(link, store.label);
  };

  const refresh = () => document.querySelectorAll("a[data-update-link]").forEach(decorate);

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      refresh();
    });
  };

  const init = () => {
    refresh();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
