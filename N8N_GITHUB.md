# n8n + GitHub automation

## Create Issue workflow

1. **Webhook** (POST) — path e.g. `github-issue`
2. **GitHub → Create an issue**
   - Owner: `pasindudananjaya92-bot`
   - Repository: `pasiya-bot-platform`
   - Title: from webhook JSON `title`
   - Body: from webhook JSON `body`
3. Publish and paste Production URL into the website **Issue Webhook** field

## Update File workflow (admin)

1. Webhook receives `path`, `content` or `content_base64`, `message`
2. GET `https://api.github.com/repos/pasindudananjaya92-bot/pasiya-bot-platform/contents/{path}`
3. PUT same URL with `message`, `content` (base64), and `sha` from step 2
4. Header: `Authorization: Bearer <PAT>`, `Accept: application/vnd.github+json`

Use least-privilege tokens. Do not expose PAT on the static site.
