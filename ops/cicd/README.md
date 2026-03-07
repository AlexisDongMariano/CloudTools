# CI/CD Planning (Structure Only)

This folder contains **planning templates** only.
No production pipeline is active yet.

## Deployment options

### 1) Single server (PostgreSQL dockerized)
- Use `deploy/single-server/docker-compose.postgres.yml` for database.
- Deploy backend and frontend to same VM with reverse proxy.

### 2) Azure Web App
- Backend: Azure App Service (Python)
- Frontend: Azure Static Web Apps or App Service (Node build + static files)
- Database: Azure Database for PostgreSQL (recommended long term)

### 3) Azure DevOps Pipeline
- Build and test backend and frontend
- Publish artifacts
- Add environment stages (Dev, UAT, Prod)

See templates in `ops/cicd/azure-devops/`.
