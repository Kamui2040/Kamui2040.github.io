# K2040 Projects Front Page

Static GitHub Pages gateway for the public K2040 project pages.

## Purpose

- shared K2040 banner and page-header pattern;
- automatic and manual light/dark appearance;
- English, German, European Portuguese, Spanish, and French;
- browser-language detection with English fallback;
- dedicated gateway cards for Android projects and gaming mods;
- compact, data-driven project updates;
- a short About section and public support/profile links.

## Structure

- `index.html` — main gateway structure and reusable templates;
- `styles.css` — shared responsive light/dark design;
- `site.js` — shared theme, language, project-card, and update rendering;
- `translations.js` — main gateway translations;
- `content.js` — main gateway and update data;
- `gaming-mods/index.html` — dedicated Gaming Mods page;
- `gaming-mods/translations.js` — Gaming Mods translations;
- `gaming-mods/content.js` — released public mod data.

## Expanding the site

Add a new gateway by appending one object to `K2040_CONTENT.projects` in the relevant `content.js` file.

Add a project update by appending one object to `K2040_CONTENT.updates`.

Each object carries its own strings for `en`, `de`, `pt-PT`, `es`, and `fr`. English is used as the fallback.

The Gaming Mods page lists only released public projects that are approved for publication.

## Banner

The pages currently load the published K2040 banner from the Android Releases site. A later asset-cleanup change may copy it into this repository without changing the page layout.

## Publication

- Main gateway: `https://kamui2040.github.io/`
- Gaming Mods: `https://kamui2040.github.io/gaming-mods/`
