# API Endpoints Documentation

## Auth Endpoints

### Register
- **URL**: `/api/auth/register`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)"
}
```
- **RESPONSE**:
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "phone": "string | null"
  }
}
```

### Login
- **URL**: `/api/auth/login`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **RESPONSE**:
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "phone": "string | null"
  }
}
```

### Logout
- **URL**: `/api/auth/logout`
- **METHOD**: `POST`
- **BODY REQUEST**: `{}`
- **RESPONSE**:
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## User Endpoints

### Create User
- **URL**: `/api/users`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)"
}
```
- **RESPONSE**:
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "phone": "string | null"
}
```

### Get All Users
- **URL**: `/api/users`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "users": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "phone": "string | null"
    }
  ]
}
```

### Get User By ID
- **URL**: `/api/users/:id`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "phone": "string | null"
}
```

---

## Spot Endpoints

### Get All Spots
- **URL**: `/api/spots`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "place_id": "string",
      "display_name": "string",
      "zona": "string",
      "location": "string",
      "best_conditions": "string",
      "bad_conditions": "string | null"
    }
  ]
}
```

### Get Spot By ID
- **URL**: `/api/spots/:id`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "place_id": "string",
    "display_name": "string",
    "zona": "string",
    "location": "string",
    "best_conditions": "string",
    "bad_conditions": "string | null"
  }
}
```

### Get Spots By Zona
- **URL**: `/api/spots/zona/:zona`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "place_id": "string",
      "display_name": "string",
      "zona": "string",
      "location": "string",
      "best_conditions": "string",
      "bad_conditions": "string | null"
    }
  ]
}
```

### Create Spot
- **URL**: `/api/spots`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "place_id": "string",
  "lat": "number",
  "lon": "number",
  "display_name": "string",
  "zona": "string",
  "best_conditions": "string",
  "bad_conditions": "string (optional)"
}
```
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "place_id": "string",
    "display_name": "string",
    "zona": "string",
    "location": "string",
    "best_conditions": "string",
    "bad_conditions": "string | null"
  }
}
```

---

## Report Endpoints

### Generate Report
- **URL**: `/api/reports/generate`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "spotId": "string",
  "userPreferences": "string (optional)",
  "aiProvider": "string (optional: 'gemini' | 'ollama')",
  "forecastDays": "number (optional, 1-14, default: 7)",
  "targetDate": "string (optional, format: YYYY-MM-DD)",
  "userId": "number (optional)"
}
```
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "spot_id": "string",
    "created_at": "date",
    "ai_analysis": "object",
    "weather_data": "object",
    "location": "string",
    "date": "string",
    "rating": "number",
    "wave_conditions": {
      "height": "string",
      "period": "string",
      "direction": "string"
    },
    "wind_conditions": {
      "speed": "string",
      "direction": "string",
      "condition": "string"
    },
    "tide_conditions": {
      "high_tide": "string",
      "low_tide": "string",
      "best_time": "string"
    },
    "recommendation": "string"
  },
  "message": "Surf report generated successfully"
}
```

### Get Report By ID
- **URL**: `/api/reports/:id`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "spot_id": "string",
    "user_id": "number | null",
    "report_text": "string",
    "weather_data": "object",
    "created_at": "date"
  }
}
```

### Get Reports By Spot
- **URL**: `/api/reports/spot/:spotId?limit=10`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `limit (optional, 1-100, default: 10)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "spot_id": "string",
      "report_text": "string",
      "weather_data": "object",
      "created_at": "date"
    }
  ],
  "meta": {
    "count": "number",
    "limit": "number"
  }
}
```

### Get Recent Reports
- **URL**: `/api/reports/recent?limit=20`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `limit (optional, 1-100, default: 20)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "spot_id": "string",
      "report_text": "string",
      "weather_data": "object",
      "created_at": "date"
    }
  ],
  "meta": {
    "count": "number",
    "limit": "number"
  }
}
```

### Search Reports
- **URL**: `/api/reports/search?q=query&limit=20`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**:
  - `q` (required, min 2 characters)
  - `limit` (optional, 1-100, default: 20)
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "spot_id": "string",
      "report_text": "string",
      "weather_data": "object",
      "created_at": "date"
    }
  ],
  "meta": {
    "count": "number",
    "limit": "number",
    "query": "string"
  }
}
```

### Get Report Stats
- **URL**: `/api/reports/stats`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "total_reports": "number",
    "reports_by_spot": "object",
    "average_wave_height": "number"
  }
}
```

### Get Reports With Good Conditions
- **URL**: `/api/reports/good-conditions?minWaveHeight=1.0`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `minWaveHeight (optional, 0-10, default: 1.0)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "spot_id": "string",
      "report_text": "string",
      "weather_data": "object",
      "created_at": "date"
    }
  ],
  "meta": {
    "count": "number",
    "minWaveHeight": "number"
  }
}
```

### Get Weather Forecast
- **URL**: `/api/reports/weather/forecast/:spotId?forecastDays=7`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `forecastDays (optional, 1-14, default: 7)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "forecast": "object"
  },
  "meta": {
    "forecastDays": "number"
  }
}
```

### Test Services
- **URL**: `/api/reports/test/services`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "services": {
      "weather": "boolean",
      "ai": "boolean"
    },
    "allServicesWorking": "boolean",
    "timestamp": "string"
  }
}
```

### Submit Feedback
- **URL**: `/api/reports/:reportId/feedback`
- **METHOD**: `POST`
- **BODY REQUEST**:
```json
{
  "rating": "number (1-5)",
  "comment": "string (optional)",
  "weather_accuracy_rating": "number (optional, 1-5)",
  "recommendation_helpfulness": "number (optional, 1-5)"
}
```
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "report_id": "string",
    "user_id": "number | null",
    "rating": "number",
    "comment": "string | null",
    "weather_accuracy_rating": "number | null",
    "recommendation_helpfulness": "number | null",
    "created_at": "date"
  },
  "message": "Feedback submitted successfully"
}
```

### Get Report Feedback
- **URL**: `/api/reports/:reportId/feedback`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "id": "string",
        "rating": "number",
        "comment": "string | null",
        "created_at": "date"
      }
    ],
    "stats": {
      "average_rating": "number",
      "total_feedbacks": "number"
    }
  }
}
```

### Get Similar Reports
- **URL**: `/api/reports/:reportId/similar?limit=5`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `limit (optional, 1-20, default: 5)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "original_report": "object",
    "similar_reports": [
      {
        "report": "object",
        "similarity": "number"
      }
    ]
  },
  "meta": {
    "similar_count": "number",
    "limit": "number"
  }
}
```

### Get Embedding Stats
- **URL**: `/api/reports/embeddings/stats`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "total_embeddings": "number",
    "average_vector_size": "number"
  }
}
```

### Get Top Rated Reports
- **URL**: `/api/reports/top-rated?limit=10`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **QUERY PARAMS**: `limit (optional, 1-50, default: 10)`
- **RESPONSE**:
```json
{
  "success": true,
  "data": [
    {
      "report": "object",
      "average_rating": "number",
      "feedback_count": "number"
    }
  ],
  "meta": {
    "count": "number",
    "limit": "number"
  }
}
```

---

## Profile Endpoints

### Get User Reports
- **URL**: `/api/profile/:userId/reports`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "userId": "number",
    "totalReports": "number",
    "reports": [
      {
        "id": "string",
        "spot_id": "string",
        "ai_analysis": "object",
        "weather_data": "object",
        "created_at": "date",
        "updated_at": "date"
      }
    ]
  }
}
```

### Get Report By ID (for sharing)
- **URL**: `/api/profile/reports/:reportId`
- **METHOD**: `GET`
- **BODY REQUEST**: `N/A`
- **RESPONSE**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "spot_id": "string",
    "user_id": "number | null",
    "ai_analysis": "object",
    "weather_data": "object",
    "created_at": "date",
    "updated_at": "date"
  }
}
```
