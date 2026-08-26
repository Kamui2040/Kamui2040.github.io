# Repository Guidelines

## Scope

Keep this repository limited to the public K2040 landing site, authorized or licensed assets, localization, and verified public project information.

## Maintenance

GitHub is the authoritative working surface for this project. A permanent local checkout is not required. When local-only validation is necessary, use a temporary Linux/Bazzite working copy and remove it when it is no longer useful.

Keep `main` stable and use focused branches and pull requests for normal changes. GitHub Actions and cloud CI are not used for this project.

## Public content

Only publish information that is already verified and public. Official project and release pages remain authoritative for downloads and versions; do not duplicate mutable release truth unnecessarily.

The Main site consumes the canonical public update feeds from the Android and Gaming sites. Keep site-specific release and project updates in those source feeds instead of copying the same mutable facts into this repository. Once a confirmed update is added to the appropriate source feed, the Main site should relay it automatically.

The Main homepage News block combines both source feeds, sorts newest first, and shows the latest five entries. Main update/news presentation remains text-only for readability. Project-area cards may show a compact latest-update summary derived from the same feeds, without copying update records into this repository.

Keep supported languages, themes, navigation, links, and the shared K2040 visual system consistent when they are affected by a change.

Use only authorized, licensed, or properly attributed assets. Keep durable asset provenance in the repository when it is needed for public reuse.

## Validation

Before merging an affected change, check relevant links, local assets, localization, desktop and mobile navigation, responsive layout, and diff cleanliness. Validate only what the change can affect.

Routine GitHub Pages publication caused by normal repository changes is allowed. External announcements, campaigns, and unrelated publication require separate approval.
