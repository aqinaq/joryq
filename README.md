# JORYQ Travel

A bilingual Kazakh/Russian travel portfolio demo built with React, TypeScript, Vite and Leaflet.

## Run

```sh
npm install
npm run dev -- --port 4177
```

Open http://localhost:4177. Production build: `npm run build`. Preview it with `npm run preview`.

## Features

- Real, draggable OpenTopoMap topographic tiles, keyboard-accessible markers, zoom buttons and a route reset control. The homepage focuses on the destination; tour pages show the entire route.
- Six Kazakhstan tours with direct `/tours/:id` URLs, day-by-day programs, maps, packing lists and related tours.
- Five catalog filters, result counts, removable filter chips and a mobile filter dialog.
- Two-tour comparison, including accommodation, transport, walking load and sample prices.
- A desired date, party size, live sample total and validated demo request. There is no backend, booking, payment or submission to a travel company.
- Language preference in localStorage; filters, selected map destination and comparison in sessionStorage. Name and phone remain in component memory only and are cleared after demo completion or closing the form. Date/party size survive language changes within the current session.
- Responsive layouts, modal focus management, Escape handling, keyboard gallery controls and reduced motion support.

## Maps and photos

Map tiles require internet access. No API key is needed. Tile failures show a retry action. Geographic markers identify real places; connecting lines are explicitly labeled as a schematic itinerary, **not navigational tracks**. Demo programs, prices, walking distances and inclusions are illustrative, not advertised departures.

Map attribution is displayed in each map. Data: [OpenStreetMap](https://www.openstreetmap.org/copyright), SRTM; map style: [OpenTopoMap](https://opentopomap.org/about), CC BY-SA 3.0. Review the provider's usage policy before a production launch at scale.

Local photographs come from Wikimedia Commons. Original source links, authors and licenses are stored in `src/credits.json` and accessible from the site's photo credits dialog. Photos are resized and converted to WebP. `scripts/assets.py` refreshes them (requires Python 3, curl and cwebp).

## Project structure

- `src/data.ts`: bilingual tour data and real marker coordinates.
- `src/i18n.ts`: interface translations, process and FAQ content.
- `src/components/Map.tsx`: interactive Leaflet map and error handling.
- `src/components/Modal.tsx`: native accessible dialog.
- `src/App.tsx`: routes, catalog, comparison, forms and application state.
- `src/styles.css`: responsive styles and reduced motion.

## Verification

With the dev server running on port 4177:

```sh
npm run test:e2e
```

Tests cover Kazakh and Russian on desktop and mobile: filtering → comparison → tour program → completed demo request; language changes preserve choices. Additional checks cover live map zoom, destination selection, direct URLs, empty results, keyboard gallery controls and form errors.

The test configuration defaults to installed Google Chrome on macOS. Set `PLAYWRIGHT_CHROMIUM_PATH` to another Chromium executable, or install Playwright Chromium using `npx playwright install chromium` and remove the default executable path from the config.

## Deployment

The build output is in `dist/`. Static hosting must rewrite non-file requests to `index.html` so direct `/tours/kolsai` and other route URLs work. `public/_redirects` supplies this rule for Netlify-compatible hosts. No secrets or server-side services are used.
# joryq
