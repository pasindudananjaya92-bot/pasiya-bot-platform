# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| main (live site) | Yes |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

1. Contact the maintainer via GitHub Security Advisories for this repository, or
2. Use the website **GitHub Automation → Feedback** form with title starting with `[SECURITY]`.

## Public client rules

- Never put GitHub `service` / admin tokens or Supabase `service_role` keys in `index.html`.
- Only use browser `localStorage` for user-provided free API keys on that device.
- n8n credentials and GitHub PATs must live only inside n8n (or other private secret stores).
- Prefer least-privilege tokens (Issues + Contents on this repo only).

## Scope

This project is a static free-tools hub + client-side / n8n-connected assistants. It is not a bank-grade app. Use at your own risk.
