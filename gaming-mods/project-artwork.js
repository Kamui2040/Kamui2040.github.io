(() => {
  const artwork = {
    "eco-aio": "assets/fallout-4-eco-quick-menu-aio.png",
    "eco-single": "assets/fallout-4-eco-quick-menu-single-patches.png",
    "xedit-json-exporter": "assets/fallout-4-xedit-json-exporter.png",
  };

  for (const project of window.K2040_CONTENT?.projects || []) {
    if (artwork[project.id]) project.image = artwork[project.id];
  }
})();
