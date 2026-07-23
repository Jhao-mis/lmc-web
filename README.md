# Elemsi | LMC

Black / white / red redesign. Photos and comments live together on one
public "Wall" — anyone can pin a photo, a message, or both.

## Storage: Netlify Blobs (no database needed)

`window.storage` (the one in the original file) only exists inside Claude's
own artifact preview — it will not work once this is a real site. This
version replaces it with **Netlify Blobs**, a key-value store built into
Netlify itself. There's nothing to sign up for or configure — it's enabled
automatically on any Netlify deploy that has functions.

- `netlify/functions/comments.js` — serverless function that reads/writes
  the comment list to a blob store called `lmc-comments`.
- The frontend calls `/api/comments` (redirected to that function by
  `netlify.toml`).
- `GET /api/comments` → returns all posted comments as JSON.
- `POST /api/comments` → body `{ name, text, image }`, appends a new entry.

Images are resized/compressed to ~900px JPEG in the browser before upload,
so the blob store stays small. There's a hard cap of ~1.5MB per image and
the wall keeps the most recent 500 posts.

## Before you deploy

1. Keep your existing `img/` folder (`h.png`, `m.png`, `icon.png`) — the
   two original photos are shown "pinned" at the top of the wall.
2. Nothing else to configure — Netlify auto-detects `@netlify/blobs` from
   `package.json` and installs it during the build.

## Deploy to Netlify

**Option A — drag and drop:**
1. Zip this whole folder (keep `netlify.toml`, `package.json`, `netlify/`,
   `index.html`, and `img/` at the top level).
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drop it in.

**Option B — connect a Git repo (recommended, supports future edits):**
1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings can stay default (`publish = "."` is already set in
   `netlify.toml`).
4. Deploy.

No environment variables or extra setup needed — Netlify Blobs works out
of the box on any site with functions enabled (this includes the free tier).

## Local testing

```
npm install
netlify dev
```

(Requires the [Netlify CLI](https://docs.netlify.com/cli/get-started/):
`npm install -g netlify-cli`.)
