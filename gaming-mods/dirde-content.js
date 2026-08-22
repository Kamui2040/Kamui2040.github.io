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
})();
