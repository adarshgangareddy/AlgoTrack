# AlgoTrack REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. System Health

### `GET /api/health`
Checks server uptime and status.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 124.5,
    "timestamp": "2026-11-01T04:00:00.000Z",
    "service": "AlgoTrack Backend API",
    "version": "1.0.0"
  },
  "message": "AlgoTrack API server is healthy and running"
}
```

---

## 2. Groq AI Code Assistant

### `POST /api/ai/chat`
Analyzes code, explains logic, detects bugs, and answers conversational algorithm questions via Groq API.

**Request Body:**
```json
{
  "problemTitle": "Two Sum",
  "problemDescription": "Given an array of integers nums and an integer target...",
  "language": "python",
  "code": "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i",
  "action": "analyze",
  "question": "Can you review my space complexity?",
  "messages": [
    {
      "role": "user",
      "content": "Can you explain this loop?"
    },
    {
      "role": "assistant",
      "content": "In this loop, enumerate provides both the index and the value..."
    }
  ]
}
```

**Supported Actions:**
- `analyze`: Comprehensive algorithmic and code review.
- `explain`: Step-by-step logic breakdown.
- `errors`: Identification of potential bugs, infinite loops, and logical issues.
- `edge_cases`: Examination of boundary and tricky inputs.
- `complexity`: Asymptotic Big-O time and space evaluation.
- `hint`: Conceptual guidance without revealing full solutions.
- `optimize`: Improvement recommendations for performance and memory.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reply": "### Algorithmic Approach Summary\n\nYour solution uses a **Hash Map (Single Pass)** approach...",
    "model": "llama-3.3-70b-versatile",
    "action": "analyze"
  },
  "message": "AI code assistance response generated"
}
```

### `GET /api/ai/status`
Returns whether the Groq API key is configured on the server.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "provider": "Groq",
    "model": "llama-3.3-70b-versatile"
  },
  "message": "AI status"
}
```

---

## 3. Problems Library

### `GET /api/problems`
Fetches paginated problem list with optional filtering and search.

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)
- `search`: Search query string
- `difficulty`: `Easy` | `Medium` | `Hard`
- `pattern`: Algorithmic pattern name

---

## 4. Problem Workspace & User Progress

### `GET /api/workspace/:problemId`
Loads the authenticated user's personal notes, approach, complexity, and saved solution for a specific problem.

### `PUT /api/workspace/:problemId`
Saves or updates personal learning notes, approach, complexity, and language solution code.

