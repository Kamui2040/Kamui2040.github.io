(() => {
  "use strict";

  const STORES = [
    { key: "github", hosts: ["github.com"], label: "GitHub" },
    { key: "nexus", hosts: ["nexusmods.com"], label: "Nexus Mods" },
    { key: "fdroid", hosts: ["f-droid.org"], label: "F-Droid" },
    { key: "apkpure", hosts: ["apkpure.com"], label: "APKPure" },
    { key: "uptodown", hosts: ["uptodown.com"], label: "Uptodown" },
    { key: "onestore", hosts: ["onestore.net"], label: "ONE store" },
    { key: "openapk", hosts: ["openapk.net"], label: "OpenAPK" }
  ];

  const storeFor = (link) => {
    let url;
    try { url = new URL(link.href, location.href); } catch { return null; }
    const host = url.hostname.toLowerCase();
    return STORES.find((store) => store.hosts.some((domain) => host === domain || host.endsWith(`.${domain}`))) || null;
  };

  const setLabel = (link, label) => {
    const wrapped = link.querySelector(":scope > .external-platform-label");
    if (wrapped) wrapped.textContent = label;
    else link.textContent = label;
    link.title = label;
  };

  const decorateExtraStore = (link, store) => {
    if (!store || !["onestore", "openapk"].includes(store.key) || link.querySelector(":scope > .external-platform-icon")) return;
    const label = document.createElement("span");
    label.className = "external-platform-label";
    label.textContent = store.label;
    const icon = document.createElement("span");
    icon.className = `external-platform-icon external-platform-icon--${store.key}`;
    icon.setAttribute("aria-hidden", "true");
    link.replaceChildren(icon, label);
    link.classList.add("external-platform-link");
    link.dataset.externalPlatform = store.key;
  };

  const refresh = () => {
    document.querySelectorAll("a[data-update-link]").forEach((link) => {
      const store = storeFor(link);
      if (!store) return;
      setLabel(link, store.label);
      decorateExtraStore(link, store);
    });
  };

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
