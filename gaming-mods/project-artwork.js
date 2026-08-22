(() => {
  const content = window.K2040_CONTENT;
  if (!content?.projects) return;

  const eco = {
    id: "eco-quick-menu-additions",
    href: "projects/project.html?project=eco-quick-menu-additions",
    available: true,
    image: "assets/eco-quick-menu-additions-avatar.png",
    cardMeta: ["AiO", "Single patches", "Released"],
    strings: {
      en: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Choose the all-in-one installer or individual optional compatibility patches." },
      de: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Wähle den All-in-One-Installer oder einzelne optionale Kompatibilitätspatches." },
      "pt-PT": { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Escolha o instalador tudo-em-um ou patches de compatibilidade opcionais individuais." },
      es: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Elige el instalador todo en uno o parches de compatibilidad opcionales individuales." },
      fr: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Choisissez le programme d’installation tout-en-un ou des correctifs de compatibilité facultatifs individuels." }
    }
  };
  const pages = { "dirde-ue-linux": "projects/project.html?project=dirde-ue-linux", "xedit-json-exporter": "projects/project.html?project=xedit-json-exporter" };
  const cardArtwork = {
    "dirde-ue-linux": "assets/dirde-ue-linux-avatar.png",
    "eco-quick-menu-additions": "assets/eco-quick-menu-additions-avatar.png",
    "xedit-json-exporter": "assets/fallout-4-xedit-json-exporter-avatar.png"
  };
  const projects = [];
  for (const project of content.projects) {
    if (project.id === "eco-aio") { projects.push(eco); continue; }
    if (project.id === "eco-single") continue;
    project.href = pages[project.id] || project.href;
    project.image = cardArtwork[project.id];
    project.cardMeta = project.id === "dirde-ue-linux" ? ["Linux", "Gameplay", "Released"] : ["Windows", "Tools", "Released"];
    projects.push(project);
  }
  content.projects = projects;
})();
