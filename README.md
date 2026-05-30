# Dominion Kingdom Randomizer

A React + Vite static frontend for generating random Dominion Kingdoms from the local `cards.json` master list.

## Features

- Generates a 10-card Kingdom from selected expansions.
- Supports Base, Intrigue, Prosperity, Seaside, Rising Sun, and Renaissance data from `cards.json`.
- Stores selected expansions in `localStorage`.
- Rerolls the full Kingdom or a single Kingdom card.
- Rolls configurable chances for Platinum/Colony and up to 2 Events.
- Selects a Prophecy when an Omen card appears.
- Lists setup requirements from selected cards and randomizer choices.

## Local Development

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Card Data

`cards.json` lives in the project root and is imported by the Vite app as the source of truth. Add new Dominion cards there with this shape:

```json
{
  "set": "Base",
  "edition": "2nd",
  "section": "Kingdom",
  "name": "Village",
  "coin_cost": 3,
  "debt_cost": 0,
  "types": ["Action"],
  "setup": ["None"]
}
```

The TypeScript model already allows future sections such as Events, Landmarks, Projects, Ways, Allies, Traits, Omens, and Prophecies.

## Vercel Deployment

This is a normal Vite static frontend app. It does not need environment variables, a backend, a database, or a server-side API.

`cards.json` lives in the project root and is imported by the React app, so Vite bundles the card data into the static JavaScript output during `npm run build`. The build also copies the same root `cards.json` file to `dist/cards.json` so the deployed static output includes the master card list.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

These settings are also captured in `vercel.json`.

### Deploy With The Vercel CLI

Install and log in to the Vercel CLI:

```bash
npm install -g vercel
vercel login
```

Deploy a preview build:

```bash
vercel deploy
```

Deploy to production:

```bash
vercel deploy --prod
```

When prompted:

- Set up and deploy: `Y`
- Which scope: choose your Vercel account or team.
- Link to existing project: choose `N` for the first deploy, or `Y` if you already created the project.
- Project name: accept the default or enter a name.
- Directory: `./`
- Override settings: `N`

### Deploy Through The Vercel Dashboard From GitHub

1. Push this folder to a GitHub repository.
2. Open <https://vercel.com/new>.
3. Import the GitHub repository.
4. Choose Framework Preset: `Vite`.
5. Confirm Build Command is `npm run build`.
6. Confirm Output Directory is `dist`.
7. Confirm Install Command is `npm install`.
8. Leave Environment Variables empty.
9. Click `Deploy`.

After deployment, Vercel serves the static files generated in `dist`.
