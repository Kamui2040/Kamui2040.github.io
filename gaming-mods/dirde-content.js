(() => {
  const release = {
    id: "dirde-ue-linux",
    href: "https://www.nexusmods.com/deadislandriptide/mods/31",
    available: true,
    strings: {
      en: {
        label: "Dead Island: Riptide",
        title: "DIRDE UE Linux 0.1.0.dev0",
        description: "Native Linux mod menu with a simple GUI, 42 gameplay options, safe Data0 patching, exact restore, and Flatpak/AppImage packages."
      }
    }
  };
  window.K2040_CONTENT = window.K2040_CONTENT || {projects: [], updates: []};
  window.K2040_CONTENT.projects = [release, ...window.K2040_CONTENT.projects.filter((project) => project.id !== release.id)];
  window.K2040_CONTENT.updates = [{
    id: "dirde-ue-linux-release",
    date: "2026-08-22",
    href: "https://www.nexusmods.com/deadislandriptide/mods/31",
    strings: {
      en: {
        category: "Dead Island: Riptide",
        title: "DIRDE UE Linux 0.1.0 released",
        summary: "The first public pre-release of the native Linux port is now available with Flatpak and AppImage packages."
      }
    }
  }, ...window.K2040_CONTENT.updates.filter((update) => update.id !== "dirde-ue-linux-release" && update.id !== "page-launch")];
})();
