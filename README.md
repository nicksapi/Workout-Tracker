# Workout Tracker

A local-first workout tracking web app you can install on your phone like a
native app. No server, no account, no cloud — all your data lives in your
browser's IndexedDB storage, on your device.

- **Exercise Library** — ~75 pre-seeded exercises tagged by muscle group and
  category, plus your own custom exercises.
- **Workout Logging** — start a workout, add exercises, and log sets Hevy-style:
  tap **+ Add set** and it appends a new set prefilled from the previous one
  (or your last session, if it's the first set this time), editable inline.
  A live elapsed-time timer runs while the workout is active.
- **Templates** — save any workout as a named template ("Push Day A") and
  reload it with one tap next time.
- **History & Progress** — past sessions with full set detail, plus a
  weight/volume trend chart per exercise.
- **Muscle Coverage** — a front/back body map shaded by how much volume
  you've hit per muscle group over the last 7 or 30 days, with a percentage
  breakdown legend.
- **Backup/restore** — export everything to a JSON file and import it again
  (e.g. when moving to a new phone) from the Settings tab.

## Install it on your phone

Open the deployed URL in your phone's browser, then:

- **iOS (Safari):** tap the Share icon → **Add to Home Screen**.
- **Android (Chrome):** tap the **⋮** menu → **Install app** (or you'll see
  an automatic install prompt).

That gives you a real home-screen icon that opens full-screen, no browser
address bar — like any other app. It works offline after the first load.

**Your data stays on that one device/browser.** There's no account and
nothing syncs automatically. If you switch phones, use **Settings → Export
backup** on the old device and **Settings → Import backup** on the new one
to carry your history over.

## Run / deploy it

This is a fully static site — no backend to run. Any static host works
(Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.), or you can run it
locally.

**Locally:**

```
npm install
npm start
```

Then open **http://localhost:4173**.

**Deploying (e.g. Vercel):** point it at this repo — build command
`npm run build`, output directory `dist`. No environment variables, no
database to provision.

## Data model

Everything lives in IndexedDB (see `src/lib/db.js`), in three object stores:

- `exercises` — the library, each with a `muscles: [{ muscle, role }]` array
  (role is `primary` or `secondary`).
- `workouts` — a logged session; each embeds its `exercises`, which each
  embed their `sets` (reps/weight/etc). Denormalized on purpose — no joins
  needed for a single-user local app.
- `templates` — a reusable named workout, with its own embedded exercises
  list (target sets/reps/weight).

`src/lib/api.js` is the data-access layer the UI calls — same shape
regardless of what's backing it, so the components don't know or care that
storage is IndexedDB rather than a server.

## Project structure

```
public/             manifest, icons, service worker (PWA install support)
src/
  components/         one component per tab/feature
  lib/
    db.js               IndexedDB schema + seeding
    api.js              data-access layer used by all components
    seedExercises.js    the ~75 built-in exercises
    backup.js           export/import (JSON) for device transfers
    bodyMapData.js       simplified body-map SVG geometry
    coverageColor.js     dark-surface sequential color ramp for coverage
```

UI font is [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
(SIL Open Font License), self-hosted from `public/fonts/` so it works
offline like everything else here.
