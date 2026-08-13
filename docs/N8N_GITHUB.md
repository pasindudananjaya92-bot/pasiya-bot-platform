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
2. GET contents API for the file → read `sha`
3. PUT contents API with `message`, base64 `content`, and `sha`
4. Use PAT only inside n8n — never in index.html 
