# CloudTools

CloudTools is a web app for cloud operations teams.

Current app included:
- **Expiration Tracker** for TLS certificates, API keys, and other time-limited items
- Tracks metadata only (never secret values)

## Tech stack

- Backend: FastAPI
- Frontend: React + Tailwind CSS
- Database: PostgreSQL

## Current project structure

```
cloudtools/
  backend/                      # FastAPI app
  frontend/                     # React + Tailwind app
  deploy/single-server/         # Single server deployment notes/templates
  ops/cicd/azure-devops/        # Azure DevOps pipeline templates
  docker-compose.yml            # Local PostgreSQL
```

## Data tracked per item

- `item_type` (example: `tls_certificate`, `api_key`)
- `name`
- `identifier` (optional, example: thumbprint, key id)
- `source`
- `owner`
- `owner_email` (optional, person email or group email)
- `ticket` (optional)
- `environment` (optional)
- `date_created`
- `date_expiration`
- `notes` (optional)
- `is_active`
- `deleted_at` (for soft delete)

Field naming and type suggestions are documented in `docs/tracked-item-fields.md`.
Hosting instructions are documented in `docs/hosting-options.md`.

## Quick start (local)

### 1) Start PostgreSQL

```bash
docker compose up -d
```

### 2) Run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Notes

- This project intentionally avoids advanced architecture so it stays beginner-friendly.
- CI/CD templates are included as planning artifacts only (not production-ready yet).
- Deleting an item is a soft-delete (history is preserved).
