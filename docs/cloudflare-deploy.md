# Cloudflare Deployment (AI Beat Challenge)

## 1) Prerequisites

- GitHub repo: `https://github.com/david1345/ai-beat-challenge`
- Cloudflare account
- Wrangler login:

```bash
cd /Users/kimdonghyouk/project1/ai_challenge/services/api
npx wrangler login
```

## 2) Required runtime secrets

Set these in Cloudflare Worker secrets:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put OPENAI_API_KEY
```

If you use additional keys (Appwrite/Anthropic/etc), set them the same way.

## 3) Build locally

```bash
cd /Users/kimdonghyouk/project1/ai_challenge
npm run cf:build
```

## 4) Preview locally (Worker runtime)

```bash
cd /Users/kimdonghyouk/project1/ai_challenge
npm run cf:preview
```

## 5) Deploy

```bash
cd /Users/kimdonghyouk/project1/ai_challenge
npm run cf:deploy
```

## 6) Verify

- Open deployed URL
- Check health endpoint: `/api/health`
- Test game flow: start → submit → check/result
- Check leaderboard and performance pages

## Notes

- Main worker entry is `.open-next/worker.js`.
- Static assets are served from `.open-next/assets`.
- Current config uses in-memory incremental cache for simplicity.
