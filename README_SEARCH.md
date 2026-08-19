# Pasiya · MongoDB Atlas Fuzzy Search

## What this adds
- `api/search-users.js` — Vercel serverless API
- `search.html` — standalone search page
- `SEARCH_SNIPPET.html` — optional block for `index.html`
- Uses database `pasiya_db`, collection `users`, Atlas Search index `default`

## Vercel setup
1. Ensure env var **MONGODB_URI** is set (Production + Preview)
2. Deploy from GitHub (push these files)
3. Test:
   `https://pasiya-bot-platform.vercel.app/api/search-users?q=test`

## Atlas
- DB: `pasiya_db`
- Collection: `users`
- Search index name: **default** (Atlas Search)
- Insert at least one test document, e.g.:
  ```json
  {
    "name": "Pasindu Demo",
    "email": "demo@example.com",
    "username": "pasiya",
    "bio": "AI builder from Sri Lanka",
    "createdAt": { "$date": "2026-08-19T00:00:00Z" }
  }
  ```

## GitHub Pages note
Static Pages cannot run `api/`.  
`search.html` auto-calls `https://pasiya-bot-platform.vercel.app/api/search-users` when hosted on github.io.

## Security
- Never commit the real connection string
- Only `MONGODB_URI` on Vercel
- Prefer field projection (no passwords in `users` docs)
