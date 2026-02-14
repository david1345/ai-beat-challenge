# API Documentation — AI Beat Challenge

## Start Game
`POST /api/game/start`

Request:
```json
{
  "mode": "FLASH",
  "assets": ["BTC", "ETH", "BNB"]
}
```

Response:
```json
{
  "game_id": "game_123",
  "rounds": [
    {
      "round_id": "round_1",
      "asset": "BTC",
      "timeframe": "30s",
      "current_price": 71190
    }
  ]
}
```

## Submit Predictions
`POST /api/game/submit`

Request:
```json
{
  "game_id": "game_123",
  "predictions": [
    {"round_id": "round_1", "direction": "UP"},
    {"round_id": "round_2", "direction": "DOWN"}
  ]
}
```

Response:
```json
{
  "status": "accepted",
  "lock_time": "2026-02-08T12:00:00Z"
}
```

## Get Result
`GET /api/game/result?game_id=game_123`

Response:
```json
{
  "game_id": "game_123",
  "status": "completed",
  "user_score": 2,
  "ai_score": 1,
  "points_earned": 20,
  "rounds": [
    {
      "round_id": "round_1",
      "asset": "BTC",
      "timeframe": "30s",
      "start_price": 71190,
      "end_price": 71230,
      "user_prediction": "UP",
      "ai_prediction": "DOWN",
      "result": "user_win"
    }
  ]
}
```
