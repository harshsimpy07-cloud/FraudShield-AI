# FraudShield AI

A real-time credit/debit card fraud-detection command-center dashboard, built with React + Vite. This is a **standalone, production-ready web app** — no Claude/Anthropic artifact runtime, branding, or dependency of any kind. It runs in any modern browser and builds to plain static files.

> Note: this package contains only the **frontend** (the dashboard UI you've been previewing, with its in-browser simulated fraud-scoring engine). It is not connected to a real backend/database. If you also have the `fraudshield-source-code.zip` backend (Node/Express + Python ML service + MongoDB) from earlier, see "Connecting a real backend" below for how to wire the two together.

## Project structure

```
fraudshield-web/
├── index.html              # HTML entry point (page title, favicon, root div)
├── package.json             # Dependencies & scripts
├── vite.config.js            # Vite build configuration
├── netlify.toml               # Netlify build/deploy config
├── vercel.json                 # Vercel build/deploy config
├── .gitignore
├── public/
│   └── favicon.svg             # App icon (no third-party branding)
└── src/
    ├── main.jsx                 # React root — mounts <App />
    ├── index.css                  # Minimal global reset
    └── App.jsx                     # The full FraudShield AI dashboard (unchanged UI/logic)
```

`App.jsx` is exactly the dashboard you've been using — same components, same simulated ML scoring engine, same design. The only change made to prepare it for standalone use was swapping a few Tailwind-only utility classes (`animate-spin`, `animate-pulse`, and two arbitrary-value classes) for plain CSS classes defined in `App.jsx`'s own `<style>` block, since this project doesn't include Tailwind. Visually and functionally it's identical.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer
- npm (comes with Node)

## Run it locally

```bash
cd fraudshield-web
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Hot-reload is on — edit `src/App.jsx` and the browser updates instantly.

## Build for production

```bash
npm run build
```

This outputs static files to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm install -g vercel
cd fraudshield-web
vercel        # first deploy, follow the prompts
vercel --prod  # promote to production
```

**Option B — Vercel dashboard (Git-based)**
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. Go to https://vercel.com/new and import the repo.
3. Vercel auto-detects Vite. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. The included `vercel.json` already sets these and adds a SPA rewrite rule so client-side routing (if you add any later) doesn't 404 on refresh.

## Deploy to Netlify

**Option A — Netlify CLI**
```bash
npm install -g netlify-cli
cd fraudshield-web
npm run build
netlify deploy --prod --dir=dist
```

**Option B — Netlify dashboard (Git-based)**
1. Push this folder to a Git repo.
2. Go to https://app.netlify.com → **Add new site → Import an existing project**.
3. Select the repo. Netlify reads `netlify.toml`, which already sets:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**.

**Option C — drag and drop**
1. Run `npm run build` locally.
2. Go to https://app.netlify.com/drop and drag the generated `dist/` folder in.

## Open in VS Code

```bash
cd fraudshield-web
code .
```

Recommended extensions: **ES7+ React/Redux snippets**, **ESLint**. No special setup needed — `npm install` then `npm run dev` works as-is.

## Connecting a real backend (optional)

Right now `src/App.jsx` generates and scores transactions entirely in the browser (see the `generateTransaction()` / `scoreTransaction()` functions near the top of the file) so the dashboard works standalone with zero setup. To connect it to the Node/Express + Python ML backend from earlier:

1. In `App.jsx`, replace the `setInterval` block inside the root `FraudShieldApp` component (the one calling `generateTransaction()`) with a `fetch('http://localhost:5000/api/transactions')` poll, or a WebSocket subscription.
2. Point the "Submit Transaction" form's `onSubmit` handler at `POST http://localhost:5000/api/transactions` instead of `buildManualTransaction()`.
3. During local development, add a proxy in `vite.config.js` to avoid CORS issues:
   ```js
   server: {
     proxy: { '/api': 'http://localhost:5000' }
   }
   ```

## Troubleshooting

- **Blank page after deploy**: check the browser console — almost always a missing `npm install` before build, or a build-directory mismatch (should be `dist`).
- **Fonts look different**: the app loads Google Fonts (Chakra Petch, Inter, JetBrains Mono) via an `@import` in `App.jsx`. This requires the deployed site to have outbound internet access to `fonts.googleapis.com`, which both Vercel and Netlify allow by default.
- **`vite: command not found`**: run `npm install` first — `vite` is a dev dependency, not a global tool.
