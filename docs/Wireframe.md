# Wireframe — AI Beat Challenge

## Low-Fi (개념 레이아웃)
```
[Top Nav]

[Mode Cards]
- FLASH (3분)
- SPEED (5분)

[Start Button]

---
[Round Selection]
Round 1: 30s  [UP] [DOWN]
Round 2: 1m   [UP] [DOWN]
Round 3: 2m   [UP] [DOWN]

[Submit]

---
[AI Analyzing...]

---
[Result]
Round 1: YOU vs AI vs ACTUAL
Round 2: YOU vs AI vs ACTUAL
Round 3: YOU vs AI vs ACTUAL
Final Winner + Points
```

## Mid-Fi (컴포넌트 배치)
```
┌──────────────────────────────┐
│ AI Beat Challenge            │
│ FLASH (3m)  SPEED (5m)       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Round 1 / 3  | BTC 30s        │
│ [mini chart] | RSI 45         │
│ [UP] [DOWN]                 │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Round 2 / 3  | ETH 1m         │
│ [mini chart] | RSI 58         │
│ [UP] [DOWN]                 │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Round 3 / 3  | BNB 2m         │
│ [mini chart] | RSI 32         │
│ [UP] [DOWN]                 │
└──────────────────────────────┘

[Submit]
```

## High-Fi (상세 UX)
- 상단 타이머 (30초 선택 제한)
- 선택 완료 후 “AI 분석 중…” progress
- 라운드별 결과 카드
- 최종 승패 카드 + 포인트 애니메이션
- 하단 고정 문구: “교육/엔터테인먼트 목적”

## Notes
- 모바일 우선 UI
- 카드형 레이아웃
- 결과 화면은 공유 가능한 요약 카드 제공
