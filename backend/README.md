# Backend (FastAPI)

This backend stores **tracking metadata only**.
It does not store any secret value (no private keys, no API key values).

## Run locally

1. Create virtual environment and install dependencies:
   - `python -m venv .venv`
   - `source .venv/bin/activate`
   - `pip install -r requirements.txt`
2. Copy env file:
   - `cp .env.example .env`
3. Start API:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

API docs will be available at: `http://localhost:8000/docs`
