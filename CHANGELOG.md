# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-30

First release.

### Added

- Several villages kept apart, with create, edit, delete, switch and Undo
- Player tag lookup to fill in or refresh a village from the Clash of Clans API
- Home Village: Builder, Research, Pets, Equipment, Walls, and queues with a timeline, lanes and conflict warnings
- Builder Base: upgrades, troops, walls and queues
- Clan Capital: districts, troops and spells
- Dailies: Forge, Helpers and Season Pass
- Mass edit, Achievements and Overview pages
- Light, dark and system themes, and active hours for the upgrade timers
- Backup and data: export, import with Merge or Replace review, and reset with Undo
- Optional cloud sync with GitHub, Google Drive, Dropbox and OneDrive through `@gamerdexapp/gamerdex-sync`
- 19 languages with ICU message catalogs, including right-to-left layout for Arabic
- Region settings for the language, date format and number format
- Dates, times, lists and durations follow the chosen language
- Web manifest, sitemap and robots file, with the tracker pages marked `noindex`

### Security

- No `pnpm audit` advisories at release
