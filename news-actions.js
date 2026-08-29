(() => {
  "use strict";

  // Original K2040 AppGallery destination cue. It is not an official HUAWEI logo.
  const APPGALLERY_PATHS = [
    "M22 38V12c0-4 4-7 4-7s4 3 4 7l-4 26h-4Z",
    "M21 38 12 16c-1.5-3.7 1.3-7.7 1.3-7.7s4.8 1 6.3 4.7L25 37l-4 1Z",
    "m20 38-14-13c-2.9-2.7-1.9-7.5-1.9-7.5s4.9-.9 7.8 1.8L24 36l-4 2Z",
    "m27 38 9-22c1.5-3.7-1.3-7.7-1.3-7.7s-4.8 1-6.3 4.7L23 37l4 1Z",
    "m28 38 14-13c2.9-2.7 1.9-7.5 1.9-7.5s-4.9-.9-7.8 1.8L24 36l4 2Z"
  ];

  const STORES = [
    { key: "github", hosts: ["github.com"], label: "GitHub" },
    { key: "nexus", hosts: ["nexusmods.com"], label: "Nexus Mods", footerIcon: true },
    { key: "fdroid", hosts: ["f-droid.org"], label: "F-Droid" },
    { key: "apkpure", hosts: ["apkpure.com"], label: "APKPure" },
    { key: "uptodown", hosts: ["uptodown.com"], label: "Uptodown" },
    { key: "appgallery", hosts: ["appgallery.huawei.com", "url.cloud.huawei.com"], label: "HUAWEI AppGallery", extraIcon: true },
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

  const makeLabel = (text) => {
    const label = document.createElement("span");
    label.className = "external-platform-label";
    label.textContent = text;
    return label;
  };

  const finishDirectDecoration = (link, store, icon) => {
    link.replaceChildren(icon, makeLabel(store.label));
    link.classList.add("external-platform-link");
    link.dataset.externalPlatform = store.key;
    link.dataset.platformOnlyLabel = "true";
  };

  const decorateWithFooterIcon = (link, store) => {
    const source = document.querySelector(`.k2040-footer-link[data-footer-key="${store.key}"] .k2040-icon`);
    if (!source) return false;

    const current = link.querySelector(":scope > .k2040-icon");
    if (current) {
      ensureLabel(link, store.label);
      return true;
    }

    const icon = source.cloneNode(true);
    icon.classList.add("external-platform-icon", `external-platform-icon--${store.key}`);
    delete link.dataset.brand;
    finishDirectDecoration(link, store, icon);
    return true;
  };

  const addAppGalleryCue = (icon) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("focusable", "false");
    APPGALLERY_PATHS.forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", "currentColor");
      path.setAttribute("d", pathData);
      svg.append(path);
    });
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("fill", "currentColor");
    circle.setAttribute("cx", "24");
    circle.setAttribute("cy", "38");
    circle.setAttribute("r", "4");
    svg.append(circle);
    icon.append(svg);
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
    if (store.key === "appgallery") addAppGalleryCue(icon);
    finishDirectDecoration(link, store, icon);
  };

  const decorate = (link) => {
    const store = storeFor(link);
    if (!store) return;

    link.title = store.label;

    if (store.footerIcon) {
      decorateWithFooterIcon(link, store);
      return;
    }

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

    // Replacing the plain label guarantees a child-list mutation so the shared
    // external icon decorator sees this newly branded News action immediately.
    link.textContent = store.label;
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
