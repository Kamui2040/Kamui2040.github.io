(() => {
  const projects = {
    "dirde-ue-linux": {
      game: "Dead Island: Riptide DE",
      title: "DIRDE UE Linux 0.1.0",
      description: "Native Linux port of the Ultimate Edition Mod Menu.",
      overview: "A native Linux port of FireEyeEian’s original mod menu, with released gameplay options, safe Data0 patching, and restore support.",
      nexus: "https://www.nexusmods.com/deadislandriptide/mods/31",
      originalNexus: "https://www.nexusmods.com/deadislandriptide/mods/3",
      github: "https://github.com/Kamui2040/DeadIsland-Riptide-Ultimate-edition-mod-menu/releases/tag/v0.1.0-dev0",
      changelog: [
        "0.1.0.dev0 — First public pre-release of the native Linux port of FireEyeEian’s Dead Island Riptide Ultimate Edition mod menu."
      ],
      features: [
        "Movement: reduced sprint and jump stamina, running with weapons, and better movement.",
        "Combat: bullet penetration and instant door breaking.",
        "Loot: improved loot, more ammo, deeper pockets, and increased durability.",
        "Comfort: 90% less sunflare, removed reverb and echo, and skipped intro videos.",
        "Vehicles: vehicle NoClip.",
        "Camera and firearms: 72/82 FOV options, improved weapon upgrades, and aiming adjustments.",
        "Zombies: One Hit, Hard, and Headshot Only difficulties, plus five zombie sizes.",
        "Forced spawns: Butchers, Rams, Bloaters, Thugs, Suiciders, and armed or melee bandits.",
        "Weather and time: night, rain, storms, and darker-night variants.",
        "Safe native Linux Data0 patching with backup and exact restore support, plus Flatpak and AppImage packages for x86-64 Linux."
      ],
      screenshots: [
        {
          src: "../assets/dirde-ue-linux-main-window.png",
          alt: "DIRDE UE Linux main application window showing the gameplay configuration options",
          caption: "Main application window"
        },
        {
          src: "../assets/dirde-ue-linux-about.png",
          alt: "DIRDE UE Linux About dialog with project and attribution details",
          caption: "About and attribution"
        }
      ]
    },
    "eco-aio": {
      game: "Fallout 4",
      title: "ECO Quick Menu Additions AiO",
      description: "All-in-one installer for K2040 ECO Quick Menu compatibility patches.",
      overview: "A single installer for the released ECO Quick Menu compatibility patch collection.",
      image: "../assets/fallout-4-eco-quick-menu-aio.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105461",
      features: [
        "Adds quick-menu compatibility support for supported Fallout 4 weapon mods through one all-in-one installer.",
        "FOMOD installer detects supported active weapons in the load order.",
        "All patches are ESL-flagged ESP files.",
        "Removes unnecessary edits and reorganizes menus for a more consistent workflow.",
        "Includes conditions for attachment-dependent options to reduce invalid menu choices.",
        "Shows a notification after the quick-menu injection completes successfully."
      ],
      changelog: [
        "1.0.1.11 — Added AER15 support and its MEC-R7 variant; split DKS-501 and AER15 variants into separate groups.",
        "1.0.0.9 — Added a patch for the H&K 45C Mk24.",
        "1.0.0.8 — Added patches for AQUILA and the X12 Plasmacaster.",
        "1.0.0.6 — Added patches for DKS-501 Redux and ACR-W17.",
        "1.0.0.4 — Initial release with patches for the HK USP, DKS-501, .357 Cattleman Revolver, and MW19 FAL."
      ]
    },
    "eco-single": {
      game: "Fallout 4",
      title: "ECO Quick Menu Single Patches",
      description: "Individual optional quick-menu compatibility patches for supported weapon mods.",
      overview: "Choose individual optional compatibility patches for supported Fallout 4 weapon mods.",
      image: "../assets/fallout-4-eco-quick-menu-single-patches.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105464",
      features: [
        "Provides individual optional patches that add weapon-specific quick-menu support.",
        "All patches are ESL-flagged ESP files.",
        "Lets players install only the patches for the weapons they use.",
        "Uses streamlined edits and reorganized menus for a more consistent workflow.",
        "Includes conditions for attachment-dependent options to reduce invalid menu choices.",
        "Shows a notification after the quick-menu injection completes successfully."
      ],
      changelog: ["1.0 — Current published release. Nexus Mods does not list detailed changelog notes for this project."]
    },
    "xedit-json-exporter": {
      game: "Fallout 4",
      title: "xEdit JSON Exporter",
      description: "Export Fallout 4 plugin data from xEdit to structured JSON.",
      overview: "A generic xEdit/FO4Edit script that exports selected records or complete plugin trees to readable JSON.",
      image: "../assets/fallout-4-xedit-json-exporter.png",
      nexus: "https://www.nexusmods.com/fallout4/mods/105775",
      features: [
        "Exports a complete plugin or selected records from xEdit to structured JSON.",
        "Read-only processing for ESP, ESL, and ESM files.",
        "Preserves the hierarchy shown in xEdit, including records, fields, subrecords, arrays, and nested elements.",
        "Creates filenames with exported record signatures when exporting selected records.",
        "Adds a summary of record types and counts for use by people and external tooling.",
        "Automatically names the output from the plugin and selected records when no filename is supplied."
      ],
      changelog: [
        "1.5 — Fixed full-plugin automatic naming so ESP, ESL, and ESM exports do not append every exported signature.",
        "1.4 — First public version."
      ]
    }
  };
  const id = new URLSearchParams(location.search).get("project");
  const project = projects[id] || projects["eco-aio"];
  window.K2040_PROJECT = { screenshots: project.screenshots || [] };

  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  const renderList = (selector, items) => { const list = document.querySelector(selector); if (!list || !Array.isArray(items)) return; list.replaceChildren(...items.map((item) => { const entry = document.createElement("li"); entry.textContent = item; return entry; })); };
  const addLink = (container, href, label, brand) => { if (!container || !href) return; const link = document.createElement("a"); link.className = "text-link"; link.href = href; link.textContent = label; if (brand) link.dataset.brand = brand; container.append(link); };

  document.addEventListener("DOMContentLoaded", () => {
    document.title = `${project.title} · K2040 Gaming Mods`;
    setText("[data-project-game]", project.game);
    setText("[data-project-title]", project.title);
    setText("[data-project-description]", project.description);
    setText("[data-project-overview]", project.overview);
    renderList("[data-project-changelog]", project.changelog);
    const features = document.querySelector("[data-project-features-section]");
    if (features && project.features?.length) { renderList("[data-project-features]", project.features); features.hidden = false; }
    const art = document.querySelector("[data-project-hero-art]");
    if (art && project.image) { const image = document.createElement("img"); image.src = project.image; image.alt = `${project.title} project artwork`; art.append(image); }
    const downloads = document.querySelector("[data-project-downloads]");
    const links = document.querySelector("[data-project-links]");
    addLink(downloads, project.nexus, "Nexus Mods", "nexus");
    addLink(downloads, project.github, "GitHub release", "github");
    addLink(links, project.nexus, "Open Nexus Mods", "nexus");
    addLink(links, project.originalNexus, "Open original mod", "nexus");
    addLink(links, project.github, "Open GitHub release", "github");
    const nexus = document.querySelector("[data-project-nexus]");
    if (nexus) nexus.href = project.nexus;
  });
})();
