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
      de: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Wähle den AiO-Installer oder einzelne optionale Kompatibilitätspatches." },
      "pt-PT": { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Escolha o instalador AiO ou patches de compatibilidade opcionais individuais." },
      es: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Elige el instalador AiO o parches de compatibilidad opcionales individuales." },
      fr: { label: "Fallout 4", title: "ECO Quick Menu Additions", description: "Choisissez l’installateur AiO ou des patchs de compatibilité individuels facultatifs." }
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
  const cardDescriptions = {
    "dirde-ue-linux": {
      en: "Native Linux port with 42 configurable gameplay options.",
      de: "Nativer Linux Port mit 42 konfigurierbaren Gameplay-Optionen.",
      "pt-PT": "Port nativo para Linux com 42 opções de gameplay.",
      es: "Port nativo para Linux con 42 opciones de gameplay.",
      fr: "Portage Linux natif avec 42 options de gameplay."
    },
    "eco-quick-menu-additions": {
      en: "AiO installer and individual Quick Menu compatibility patches.",
      de: "AiO-Installer und einzelne Quick-Menu-Kompatibilitätspatches.",
      "pt-PT": "Instalador AiO e patches individuais para o Quick Menu.",
      es: "Instalador AiO y parches individuales para el Quick Menu.",
      fr: "Installateur AiO et patchs individuels pour le Quick Menu."
    },
    "xedit-json-exporter": {
      en: "Export xEdit/FO4Edit records and plugins to readable JSON.",
      de: "Exportiert xEdit-/FO4Edit-Records und Plugins als lesbares JSON.",
      "pt-PT": "Exporta registos e plugins do xEdit/FO4Edit para JSON legível.",
      es: "Exporta registros y plugins de xEdit/FO4Edit a JSON legible.",
      fr: "Exporte les enregistrements et plugins xEdit/FO4Edit en JSON lisible."
    }
  };
  for (const project of content.projects) {
    const descriptions = cardDescriptions[project.id];
    if (!descriptions) continue;
    for (const [language, description] of Object.entries(descriptions)) project.strings[language].description = description;
  }
  const updateCopy = {
    "xedit-json-exporter-added": {
      en: { title: "xEdit JSON Exporter added", summary: "xEdit JSON Exporter now has a dedicated project page with its official Nexus Mods link." },
      de: { title: "xEdit JSON Exporter hinzugefügt", summary: "xEdit JSON Exporter hat jetzt eine eigene Projektseite mit dem offiziellen Nexus Mods Link." },
      "pt-PT": { title: "xEdit JSON Exporter adicionado", summary: "O xEdit JSON Exporter tem agora uma página própria com o link oficial do Nexus Mods." },
      es: { title: "xEdit JSON Exporter añadido", summary: "xEdit JSON Exporter ya tiene una página propia con el enlace oficial de Nexus Mods." },
      fr: { title: "xEdit JSON Exporter ajouté", summary: "xEdit JSON Exporter dispose maintenant de sa propre page avec le lien officiel Nexus Mods." }
    },
    "single-patches": {
      en: { title: "ECO Quick Menu Single Patches updated" }, de: { title: "ECO Quick Menu Single Patches aktualisiert" },
      "pt-PT": { title: "ECO Quick Menu Single Patches atualizado" }, es: { title: "ECO Quick Menu Single Patches actualizado" }, fr: { title: "ECO Quick Menu Single Patches mis à jour" }
    },
    "aio-update": {
      en: { title: "ECO Quick Menu Additions AiO updated" }, de: { title: "ECO Quick Menu Additions AiO aktualisiert" },
      "pt-PT": { title: "ECO Quick Menu Additions AiO atualizado" }, es: { title: "ECO Quick Menu Additions AiO actualizado" }, fr: { title: "ECO Quick Menu Additions AiO mis à jour" }
    }
  };
  for (const update of content.updates || []) {
    const copy = updateCopy[update.id];
    if (!copy) continue;
    for (const [language, strings] of Object.entries(copy)) Object.assign(update.strings[language], strings);
  }
})();
