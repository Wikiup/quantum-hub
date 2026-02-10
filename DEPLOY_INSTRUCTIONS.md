# Deployment Instructions

## Cloudflare Pages Manual Deploy

The automated deployment requires a `CLOUDFLARE_API_TOKEN` environment variable.

### Option 1: Set Token and Deploy via CLI
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
cd /home/ubuntu/.openclaw/workspace/quantum-hub
npx wrangler pages deploy . --project-name=quantum-hub-fuk
```

### Option 2: Manual Upload via Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Workers & Pages > quantum-hub-fuk
3. Click "Create deployment"
4. Upload the entire `/home/ubuntu/.openclaw/workspace/quantum-hub` directory

### Option 3: Git Push (Recommended)
```bash
cd /home/ubuntu/.openclaw/workspace/quantum-hub
git init
git add .
git commit -m "Add Raffle module"
git remote add origin https://github.com/Wikiup/quantum-hub.git
git push -u origin main
```
Then enable Cloudflare Pages Git integration.

---

**Current Status:** Raffle module fully implemented, ready for deployment.
