# 1092 Helpline - AI Service Layer

This is the intelligence layer of the 1092 Helpline, built with **FastAPI** and powered by **Groq AI, Google Gemini, and HuggingFace DeBERTa**. It handles computationally intensive AI tasks, classifications, and responses.

---

## Features

- **Translation & Input Processing (Merged from input-service)**
  - **Language Detection**: Identifies Kannada, Hindi, Tamil, Telugu, and English.
  - **Translation**: Converts regional language text to English via Sarvam API.
  - **Edge Case Validation**: Handles empty texts, short descriptions, and numbers-only inputs.

- **DeBERTa v3 Zeroshot**
  - **AI Analysis**: Classifies citizen intent and emergency type.
  - **Severity Detection**: Detects severity from LOW to CRITICAL.

- **Google Gemini 2.5 Flash**
  - **AI Reply Generator**: Generates context-aware, calming, safe responses for the caller.

- **Groq Llama 3.3 70B**
  - **Case Summary Generation**: Generates concise, factual summaries from call transcripts for officer dashboards.

- **Unified Pipeline**
  - **Pipeline API**: Processes severity, reply, and summary concurrently for ultra-fast latency.

---

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **AI Models**:
  - HuggingFace `cross-encoder/nli-deberta-v3-small`
  - Groq `llama-3.3-70b-versatile`
  - Google Gemini `gemini-2.5-flash`
- **Libraries**: Transformers, Torch, Pydantic, HTTPX, Google Generative AI

---

## Installation

### 1. Navigate to the directory

```bash
cd ai_service
```

### 2. Create and activate virtual environment

#### Windows
```bash
python -m venv venv
venv\Scripts\activate
```

#### Linux / Mac
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create `.env` file:

```env
PROJECT_NAME="1092 Helpline AI Service"
VERSION="1.0.0"

# DeBERTa Model
DEBERTA_MODEL_NAME="cross-encoder/nli-deberta-v3-small"

# Groq Configuration
GROQ_API_KEY="your_groq_api_key"
GROQ_BASE_URL="https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL_NAME="llama-3.3-70b-versatile"

# Gemini Configuration
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"

# Sarvam Translation API Key (from merged input-service)
SARVAM_API_KEY="your_sarvam_api_key"
```

---

## Running the Service

Run the server:

```bash
python -m uvicorn app.main:app --reload --port 8001
```

- **Base URL**: `http://127.0.0.1:8001`
- **Swagger Docs**: `http://127.0.0.1:8001/docs`

---

## API Endpoints

### 1. Unified Pipeline (Recommended)

Combines Severity detection, Safe Reply generation, and Summarization in a single concurrent call.

**Endpoint**: `POST /api/v1/pipeline/analyze`

**Request Body**:
```json
{
  "text": "My father hit me"
}
```

**Response**:
```json
{
  "severity": "CRITICAL",
  "reply": "I have noted your emergency. Help is being dispatched immediately, please stay safe and on the line.",
  "summary": "Citizen reported domestic violence from father."
}
```

---

### 2. Pipeline Input (Merged from input-service)

Validates inputs, detects language, and translates raw regional emergency texts into English.

**Endpoint**: `POST /api/v1/pipeline/input`

**Request Body**:
```json
{
  "text": "ಬೆಂಕಿ ಅಪಾಯ",
  "originalText": "ಬೆಂಕಿ ಅಪಾಯ"
}
```

**Response**:
```json
{
  "text": "Fire hazard",
  "language": "Kannada",
  "originalText": "ಬೆಂಕಿ ಅಪಾಯ"
}
```

---

### 3. Analysis Tools

#### Text Analysis
**Endpoint**: `POST /api/v1/analysis/analyze`
- Generates a general analysis/summary of the input text using Groq.

**Request**: `{ "text": "..." }`

#### Severity Detection
**Endpoint**: `POST /api/v1/analysis/severity`
- Specifically classifies the text into `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` using LLM logic.

**Response**: `{ "severity": "HIGH" }`

---

### 4. Summarization Tools

#### Case Summarization
**Endpoint**: `POST /api/v1/summary/summarize`
- Generates a concise summary from a full transcript.

**Request Body**:
```json
{
  "transcript": "Full call transcript text..."
}
```

**Response**:
```json
{
  "success": true,
  "summary": "..."
}
```

---

## Health Check
- **Endpoint**: `GET /`
- Returns service status, version, and active model name.

---

# Author

1092 Helpline AI Backend Team
