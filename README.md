# PASiYA MAX // CMD — SaaS Dashboard

Professional dark dashboard (Vercel-style) built with **Next.js 14 App Router + Tailwind**.

## Features
- Left sidebar + top bar (search, notifications, profile)
- Instant client navigation (no full reload)
- Pages: Home, Virtual PC, AI Agent, Web Studio, Hosting, Developer, Social, Settings
- Pro: Analytics, Finance, Team, Automation Lab, Cloud Storage, Security, Marketplace

## Setup
```bash
npm install
cp .env.example .env.local
# add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Deploy (Vercel)
1. Import this folder as a new Vercel project (or replace repo root)
2. Set env vars
3. Deploy

## Notes
- Virtual PC embeds existing https://pasiya-bot-platform.vercel.app
- Many pro modules use localStorage until Supabase tables are created
- Stripe / real Drive / live multiplayer need server secrets & policies
