# K2040 Projects Front Page

Initial static GitHub Pages scaffold for the `Kamui2040/Kamui2040.github.io` repository.

## Purpose

- shared K2040 banner and page-header pattern;
- automatic and manual light/dark appearance;
- English, German, European Portuguese, Spanish, and French;
- browser-language detection with English fallback;
- dedicated gateway cards for Android projects and future gaming mods;
- compact, data-driven project updates;
- a short About section and public support/profile links.

## Structure

- `index.html` — semantic page structure and reusable templates;
- `styles.css` — shared responsive light/dark design;
- `site.js` — theme, language, project-card, and update rendering;
- `translations.js` — interface translations;
- `content.js` — expandable project gateway and update data.

## Expanding the site

Add a new gateway by appending one object to `K2040_CONTENT.projects`.

Add a project update by appending one object to `K2040_CONTENT.updates`.

Each object carries its own strings for `en`, `de`, `pt-PT`, `es`, and `fr`. English is used as the fallback.

## Banner

The initial page loads the published K2040 banner from the Android Releases site. A later asset-cleanup change may copy it into this repository without changing the page layout.

## Publication

Published URL: `https://kamui2040.github.io/`
