# Technical Specification — AI Beat Challenge

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API
- **Price Data**: Binance (or exchange API)
- **Auth**: Supabase Auth
- **Hosting**: Vercel (API), Expo EAS (Mobile)

## Architecture
```
┌──────────────┐
│ Mobile App   │
│ (React Native)│
└──────┬───────┘
       │ HTTPS
       ↓
┌──────────────┐
│ Next.js API  │
│ (Vercel)     │
└──┬───────┬───┘
   │       │
   ↓       ↓
┌─────┐ ┌────────┐
│Claude│ │Supabase│
│ API  │ │   DB   │
└─────┘ └────────┘
```

## Data Model (요약)
- users
- games
- rounds
- leaderboard (materialized view)

## API Design
- `POST /api/game/start`
- `POST /api/game/submit`
- `GET /api/game/result`

## Security
- JWT 인증
- rate limit (IP + user)
- 입력값 검증 (schema validation)

## Performance & Cost
- 세션당 AI 1회 호출
- 캐시: 자산+타임프레임 단위
- 결과 판정은 price snapshot만 저장

## Compliance
- 교육/엔터테인먼트 문구
- 현금성 보상/교환 금지
- 베팅/배당 용어 금지
