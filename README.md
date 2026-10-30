# Clash of Clans Tracker

A progress tracker for Clash of Clans. Manage multiple villages and track upgrades, achievements, and more — all stored locally in your browser, no account required.

## Features

- **Village management** — create, edit, delete, and switch between villages
- **localStorage persistence** — all data stored locally, no backend required
- **Import / Export / Reset** — full data management in the settings page
- **Sidebar navigation** — collapsible sidebar with village switcher
- **19 languages**: English plus Arabic, Chinese (Simplified and Traditional), French, German, Indonesian, Italian, Japanese, Korean, Malay, Portuguese (Brazil and Portugal), Russian, Spanish (Spain and Latin America), Thai, Turkish and Vietnamese, with right-to-left layout for Arabic. Game data names stay English.
- **Toast notifications** — success, error, info, warning helpers
- **CI/CD** — GitHub Actions workflows for lint + build and Vercel deployment

## Tech Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** (strict)
- **Tailwind CSS 4** · **Flowbite-React**
- **pnpm** · **Node >= 24**

## Getting Started

```bash
git clone https://github.com/chiefpansancolt/clash-of-clans-tracker.git
cd clash-of-clans-tracker
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier
node scripts/check-i18n.mjs      # Find text that is not in a message catalog
node scripts/check-catalogs.mjs  # Compare every language with English
```

## Translating

Messages live in `src/i18n/messages/<code>/`, one JSON file per area, in ICU format. English is the source. Change a message in a language folder, then run `node scripts/check-catalogs.mjs <code>` until it reports 0 problems. Run `node scripts/gen-locale-indexes.mjs` after adding a language folder.

## Disclaimer

This application is not affiliated with or endorsed by Supercell. Clash of Clans is a trademark of Supercell. All trademarks are property of their respective owners.

## License

MIT
