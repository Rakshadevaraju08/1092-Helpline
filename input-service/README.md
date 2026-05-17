# 1092 AI Helpline — Input Service

The first layer of the 1092 emergency helpline pipeline. Receives raw caller speech, detects language, and translates to English before passing to the AI layer.

## What It Does

- **Language Detection**: Identifies Kannada, Hindi, Tamil, Telugu, English
- **Translation**: Converts regional language text to English via Sarvam API
- **Edge Case Handling**: Manages silence, unknown languages, and short inputs

## Getting Started

### Prerequisites
- Python 3.9+
- Sarvam API Key

### Installation & Run

#### Input Service (Port 8001)
```bash
cd input-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

## API

### POST /api/v1/pipeline/input
```json
Request:  { "text": "ಬೆಂಕಿ ಅಪಾಯ", "originalText": "ಬೆಂಕಿ ಅಪಾಯ" }
Response: { "text": "Fire hazard", "language": "Kannada", "originalText": "ಬೆಂಕಿ ಅಪಾಯ" }
```

### GET /health
```json
{ "status": "healthy", "service": "input-service" }
```

## Environment Variables
Add to `input-service/.env`:
SARVAM_API_KEY=sk_8burotyr_r6myhPIDI2cWvidJdHIN9K8B

## Pipeline Position
Twilio → backend:5000 → input-service:8001 → ai_service:8000 → Dashboard

