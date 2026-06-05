# Deploy: Brain Connectivity Explorer

## Prerequisites
- Node.js 18+
- A Hugging Face dataset repo with processed artifacts (see backend pipeline)

## Steps

1. **Install dependencies**
   ```bash
   cd brain-ui
   npm install
   ```

2. **Configure your HF repo**
   Create `.env.local`:
   ```
   VITE_HF_REPO=your-username/your-dataset-repo
   ```

3. **Ensure your HF repo has a `manifest.json`** at the repo root:
   ```json
   {
     "subjects": [
       {
         "id": "sub-001",
         "processed_at": "2025-06-01T12:00:00Z",
         "dmn_connectivity": 0.48,
         "fpn_connectivity": 0.39,
         "dmn_fpn_anticorrelation": -0.12
       }
     ]
   }
   ```
   The backend pipeline should generate and upload this automatically.

4. **Local preview**
   ```bash
   npm run dev
   ```
   Opens at http://localhost:5173 — HF requests are proxied through Vite to avoid CORS.

5. **Configure GitHub Pages homepage** in `package.json`:
   ```json
   "homepage": "https://<your-github-username>.github.io/<repo-name>"
   ```

6. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```
   This runs `npm run build` then publishes `dist/` to the `gh-pages` branch.

7. **Visit your app**
   `https://<your-github-username>.github.io/<repo-name>`

## Notes
- `public/manifest.json` is a sample manifest for offline testing only.
  In production, the app always fetches from your HF repo.
- The app uses hash-based routing (`#/sub-001`) to avoid 404s on GitHub Pages.
- Brain data is cached in memory: navigating between subjects and back does not re-fetch.
- Slice images are lazy-loaded only when a parcel is selected.
