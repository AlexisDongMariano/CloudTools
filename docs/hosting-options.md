# Hosting Options for CloudTools

This guide is intentionally company-agnostic and works for personal or team repos.

## Option 1: Local (developer machine)

Best for learning and early development.

### Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Node 18+

### Steps

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Run backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Run frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. Open:
- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

---

## Option 2: Azure VM (single server style)

Best when you want full control and simple costs.

### Suggested architecture

- One Linux VM
- PostgreSQL in Docker
- FastAPI process (systemd or container)
- React static build served by Nginx
- Nginx reverse proxy + HTTPS

### High-level steps

1. Create Ubuntu VM in Azure.
2. Install Docker, Docker Compose, Python, Nginx.
3. Run Postgres using `deploy/single-server/docker-compose.postgres.yml`.
4. Deploy backend code and run with `uvicorn` or `gunicorn + uvicorn workers`.
5. Build frontend (`npm run build`) and serve `frontend/dist` with Nginx.
6. Configure Nginx routes:
   - `/api/*` -> FastAPI service
   - `/` -> frontend static files
7. Add TLS certificate (Let's Encrypt or enterprise cert process).
8. Set up backup for Postgres volume and VM snapshots.

### Pros

- Flexible, easy to understand
- Works well for small teams

### Cons

- You manage patching, scaling, uptime, backups

---

## Option 3: Azure Web App (+ managed database)

Best for less ops overhead and cleaner managed platform usage.

### Suggested architecture

- Backend: Azure App Service (Python)
- Frontend: Azure Static Web Apps **or** App Service (Node build)
- Database: Azure Database for PostgreSQL Flexible Server

### High-level steps

1. Create PostgreSQL Flexible Server and database.
2. Create backend App Service and set env vars:
   - `DATABASE_URL`
   - `CORS_ORIGINS`
   - `APP_NAME`
3. Deploy backend from repo or artifact.
4. Deploy frontend:
   - Static Web Apps (recommended) or
   - App Service serving static files
5. Set frontend env `VITE_API_BASE_URL` to backend URL.
6. Restrict network access/security groups as needed.
7. Enable Application Insights / logging.

### Pros

- Managed platform and simpler operations
- Easier scale and monitoring

### Cons

- Slightly more Azure service setup
- Can cost more than single VM at very small scale

---

## Azure DevOps pipeline plan (structure only)

Template files:

- `ops/cicd/azure-devops/azure-pipelines.backend.yml`
- `ops/cicd/azure-devops/azure-pipelines.frontend.yml`

Recommended stages:

1. **Build & validate**
   - Backend dependency install + syntax/test checks
   - Frontend install + lint + build
2. **Package artifacts**
   - Backend package or container image
   - Frontend build artifact
3. **Deploy to Dev**
4. **Manual approval**
5. **Deploy to Prod**

---

## Recommendation for now

- Start with **Local** for feature development.
- Move to **Azure VM** first if you want lowest complexity in early team usage.
- Move to **Azure Web App + managed Postgres** when you need stronger reliability and easier scaling.
