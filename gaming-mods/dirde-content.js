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
      },
      de: { label: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0.dev0", description: "Natives Linux Mod Menu mit einfacher Oberfläche, 42 Gameplay-Optionen, sicherem Data0-Patching, exakter Wiederherstellung sowie Flatpak- und AppImage-Paketen." },
      "pt-PT": { label: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0.dev0", description: "Mod menu nativo para Linux com uma interface simples, 42 opções de gameplay, patching seguro de Data0, reposição exata e pacotes Flatpak/AppImage." },
      es: { label: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0.dev0", description: "Mod menu nativo para Linux con una interfaz sencilla, 42 opciones de gameplay, parcheado seguro de Data0, restauración exacta y paquetes Flatpak/AppImage." },
      fr: { label: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0.dev0", description: "Mod menu Linux natif avec une interface simple, 42 options de gameplay, un patch Data0 sécurisé, une restauration exacte et des paquets Flatpak/AppImage." }
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
      },
      de: { category: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0 veröffentlicht", summary: "Die erste öffentliche Vorabversion des nativen Linux Ports ist jetzt als Flatpak und AppImage verfügbar." },
      "pt-PT": { category: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0 publicado", summary: "A primeira pré-release pública do port nativo para Linux já está disponível em pacotes Flatpak e AppImage." },
      es: { category: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0 publicado", summary: "La primera pre-release pública del port nativo para Linux ya está disponible en paquetes Flatpak y AppImage." },
      fr: { category: "Dead Island: Riptide", title: "DIRDE UE Linux 0.1.0 publié", summary: "La première préversion publique du portage Linux natif est disponible en paquets Flatpak et AppImage." }
    }
  }, ...window.K2040_CONTENT.updates.filter((update) => update.id !== "dirde-ue-linux-release" && update.id !== "page-launch")];
})();
