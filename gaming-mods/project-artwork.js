(() => {
  const artwork = {
    "dirde-ue-linux": "assets/dirde-ue-linux-card.png",
    "eco-aio": "assets/fallout-4-eco-quick-menu-aio.png",
    "eco-single": "assets/fallout-4-eco-quick-menu-single-patches.png",
    "xedit-json-exporter": "assets/fallout-4-xedit-json-exporter-card.png",
  };
  const projectPages = {
    "dirde-ue-linux": "projects/project.html?project=dirde-ue-linux",
    "eco-aio": "projects/project.html?project=eco-aio",
    "eco-single": "projects/project.html?project=eco-single",
    "xedit-json-exporter": "projects/project.html?project=xedit-json-exporter",
  };

  for (const project of window.K2040_CONTENT?.projects || []) {
    if (artwork[project.id]) project.image = artwork[project.id];
    if (projectPages[project.id]) project.href = projectPages[project.id];
  }
})();
