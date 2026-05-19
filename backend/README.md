# 1092 Helpline - Node.js Backend Service

This is the primary backend for the 1092 Helpline, built with **Node.js**. It follows a modular architecture and coordinates between the citizen-facing frontend and the specialized Python AI Service layer.

## Features

- **AI Service Integration**: Acts as a high-speed proxy connecting the citizen-facing frontend with the FastAPI `ai_service` for heavy ML processing.
- **Unified Pipeline Proxying**: Forwards unified analysis requests (Severity, Reply, Summary) directly to the Python Brain.
- **Modular Architecture**: Built cleanly with Routes, Controllers, and Services.
- **WebRTC/WebSocket Audio**: Handles live audio chunk streaming between the citizen browser and the telephony logic.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Real-Time**: WebSockets / WebRTC

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
1. Navigate to the directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and set the Python service URL:
   ```env
   AI_SERVICE_URL=http://localhost:8001/api/v1
   ```

### Running the Service
```bash
npm run dev
```
The Node.js server will run on `http://localhost:3000`.

## API Endpoints

All API routes are prefixed with `/api/v1`.

### 1. Case Management & AI (Proxies to Python AI Service)

#### Unified Pipeline
**Endpoint**: `POST /api/v1/cases/pipeline/analyze`
- Processes text to get Severity, Safe Reply, and Summary in one call.

#### Case Analysis
**Endpoint**: `POST /api/v1/cases/analyze`
- Gets text analysis and severity.

#### Case Summarization
**Endpoint**: `POST /api/v1/cases/summarize`
- Generates a summary for a given transcript.

---

### 2. Telephony & Call Control

**Base Path**: `/api/v1/telephony`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/incoming-call` | Handles new incoming SOS calls |
| POST | `/call-status` | Webhook for call status updates |
| POST | `/forward-agent` | Triggers call forwarding to a human agent |
| GET | `/health` | Telephony service health check |

---

### 3. Service Health

- **Root**: `GET /`
- Returns: `{ "message": "1092 Helpline Node.js Backend is running" }`

---

# Author

1092 Helpline Engineering Team
