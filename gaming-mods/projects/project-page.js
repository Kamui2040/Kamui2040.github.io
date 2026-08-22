(() => {
  const projects = {
    "dirde-ue-linux": {
      game: "Dead Island: Riptide DE",
      title: "DIRDE UE Linux 0.1.0",
      description: "Native Linux port of the Ultimate Edition Mod Menu.",
      overview: "A native Linux port of FireEyeEian’s original mod menu, with released gameplay options, safe Data0 patching, and restore support.",
      nexus: "https://www.nexusmods.com/deadislandriptide/mods/31",
      github: "https://github.com/Kamui2040/DeadIsland-Riptide-Ultimate-edition-mod-menu/releases/tag/v0.1.0-dev0",
      changelog: "The first public pre-release is available as Flatpak and AppImage packages for x86-64 Linux."
    },
    "eco-aio": {
      game: "Fallout 4",
      title: "ECO Quick Menu Additions AiO",
      description: "All-in-one installer for K2040 ECO Quick Menu compatibility patches.",
      overview: "A single installer for the released ECO Quick Menu compatibility patch collection.",
      image: "../assets/fallout-4-eco-quick-menu-aio.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105461",
      changelog: "See the Nexus Mods page for the current release notes and files."
    },
    "eco-single": {
      game: "Fallout 4",
      title: "ECO Quick Menu Single Patches",
      description: "Individual optional quick-menu compatibility patches for supported weapon mods.",
      overview: "Choose individual optional compatibility patches for supported Fallout 4 weapon mods.",
      image: "../assets/fallout-4-eco-quick-menu-single-patches.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105464",
      changelog: "See the Nexus Mods page for the current release notes and files."
    },
    "xedit-json-exporter": {
      game: "Fallout 4",
      title: "xEdit JSON Exporter",
      description: "Export Fallout 4 plugin data from xEdit to structured JSON.",
      overview: "A generic xEdit/FO4Edit script that exports selected records or complete plugin trees to readable JSON.",
      image: "../assets/fallout-4-xedit-json-exporter.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105775",
      changelog: "See the Nexus Mods page for the current release notes and files."
    }
  };
  const id = new URLSearchParams(location.search).get("project");
  const project = projects[id] || projects["eco-aio"];
  window.K2040_PROJECT = { screenshots: project.screenshots || [] };

  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  const addLink = (container, href, label, brand) => { if (!container || !href) return; const link = document.createElement("a"); link.className = "text-link"; link.href = href; link.textContent = label; if (brand) link.dataset.brand = brand; container.append(link); };

  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${project.title} · K2040 Gaming Mods`;
    setText("[data-project-game]", project.game);
    setText("[data-project-title]", project.title);
    setText("[data-project-description]", project.description);
    setText("[data-project-overview]", project.overview);
    setText("[data-project-changelog]", project.changelog);
    const art = document.querySelector("[data-project-hero-art]");
    if (art && project.image) { const image = document.createElement("img"); image.src = project.image; image.alt = `${project.title} project artwork`; art.append(image); }
    const downloads = document.querySelector("[data-project-downloads]");
    const links = document.querySelector("[data-project-links]");
    addLink(downloads, project.nexus, "Nexus Mods", "nexus");
    addLink(downloads, project.github, "GitHub release", "github");
    addLink(links, project.nexus, "Open Nexus Mods", "nexus");
    addLink(links, project.github, "Open GitHub release", "github");
    const nexus = document.querySelector("[data-project-nexus]");
    if (nexus) nexus.href = project.nexus;
  });
})();
