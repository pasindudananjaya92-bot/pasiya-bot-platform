# Architecture

## Overview

Pasiya Max Platform is a **static** front-end (GitHub Pages) plus optional **n8n Cloud** automations.

```
Browser (index.html)
├── BOT CORE → Groq / Google / OpenRouter (user API key in localStorage)
├── N8N Public Bot → pasiyamax.app.n8n.cloud webhook → Groq
├── AI Service Desk → local routes or N8N
├── GitHub Automation forms → n8n → GitHub API
└── Tool directories → external free services (links)
```

## Trust boundaries

| Secret | Where it may live |
|--------|-------------------|
| User LLM API key | Browser localStorage only |
| n8n Groq credential | n8n only |
| GitHub PAT | n8n only |
| Supabase service_role | Never in this repo |

## Deployment

- Host: GitHub Pages (`main` branch)
- Optional: `.github/workflows/deploy.yml`
- Live: https://pasindudananjaya92-bot.github.io/pasiya-bot-platform/
