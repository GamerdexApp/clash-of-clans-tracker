# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 19 languages with ICU message catalogs, including right-to-left layout for Arabic
- Region settings for the language, date format and number format
- Dates, times, lists and durations follow the chosen language

### Changed

- Update dependencies to latest (Next.js 16.3, React 19.3, Tailwind 4.3, nanoid 6, clash-of-clans-data 0.18)
- Update GitHub Actions (checkout v7, setup-node v7, pnpm/action-setup v6)
- Dependabot now runs monthly
- Fetch player data with native `fetch` instead of `clash-of-clans-api`

### Removed

- Unused `request`, `request-promise`, `ts-node` and `clash-of-clans-api` dependencies

### Security

- Resolve all `pnpm audit` advisories (Next.js, postcss, nanoid, sharp, `request` dependency tree, deepmerge-ts via override)

## [1.1.0] - 2026-03-13

### Added

- Add Primary, Secondary, Accent, Highlight color themes

## [1.0.0] - 2026-03-11

### Added

- Initial template release
- Playthrough management (create, edit, delete, switch)
- localStorage persistence via `storageService`
- `PlaythroughContext` and `UIContext`
- Settings page with export, import, and reset
- Sidebar with playthrough switcher and dark mode toggle
- Create, Edit, and Delete playthrough modals
- Toast notification helpers (success, error, info, warning)
- URL query param service (`urlService`)
- `SaveFAB` opt-in floating save button
- Home/landing page scaffold
- Playthrough list page with search and sort
- GitHub Actions CI (lint + build) and Deploy workflows
- Dependabot dependency update configuration
