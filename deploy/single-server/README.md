# Single Server Deployment Notes

Goal: deploy `CloudTools` on one VM/server with PostgreSQL running in Docker.

## Suggested approach

1. Run PostgreSQL via Docker Compose on the server.
2. Run FastAPI + React build (or Nginx static) as systemd services or containers.
3. Put Nginx/Caddy in front for TLS and reverse proxy.

## Why this works well

- Simple setup for small team usage
- Easy backup for Postgres volume
- Easy to migrate later to Azure services
