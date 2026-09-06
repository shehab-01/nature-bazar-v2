# Nature Bazar — Operations Cheat Sheet

All commands run from the project root: `cd ~/projects/natureBazar`

## URLs
| What | Where |
|---|---|
| Public site | https://naturebazar.iamshehab.com |
| Local web (storefront + admin) | http://localhost:8085 |
| Local API (direct) | http://localhost:8000 (`/docs` = Swagger) |

## Redeploy after code changes

```bash
# Frontend changed (anything under frontend/)
docker compose build web && docker compose up -d web

# Backend changed (anything under backend/) — migrations run automatically on start
docker compose build api && docker compose up -d api

# Both
docker compose build web api && docker compose up -d web api
```

## Restart without rebuilding (no code changes)

```bash
docker compose restart web        # or api
docker compose up -d --force-recreate api   # needed when .env changed
```

`.env` changes (passwords, Google keys, SUPER_ADMIN_EMAILS…) only need the
force-recreate of `api` — no rebuild. Frontend build-time vars
(GOOGLE_CLIENT_ID) DO need `build web`.

## Meta Pixel & Conversions API

| Variable (.env) | Used by | Applies after |
|---|---|---|
| `META_PIXEL_ID` | web (browser pixel) + api (CAPI) | `docker compose build web && docker compose up -d web` and `docker compose up -d --force-recreate api` |
| `META_CAPI_ACCESS_TOKEN` | api | `docker compose up -d --force-recreate api` |
| `META_TEST_EVENT_CODE` | api | same; leave empty in production |

Browser events live in `frontend/src/lib/tracking.ts` (product name/price/ids,
event parameters). Server-side Purchase lives in `backend/api/services/meta_capi.py`.
Debug browser events on the live site: in the console run
`localStorage.trackingDebug = "1"` and reload. CAPI results appear in
`docker compose logs api | grep CAPI`.

## Status & logs

```bash
docker compose ps
docker compose logs -f api        # follow API logs (Ctrl+C to stop)
docker compose logs -f web
docker compose logs api --tail 50 # last 50 lines
```

## Quick health checks

```bash
curl http://localhost:8085/                    # storefront (200)
curl http://localhost:8085/api/orders/stats    # 401 = auth wall working
curl http://localhost:8000/health              # API + DB check
```

## Database

```bash
# psql shell inside the container
docker compose exec db psql -U nature_bazar -d nature_bazar

# one-off queries
docker compose exec -T db psql -U nature_bazar -d nature_bazar \
  -c "SELECT status, count(*) FROM orders GROUP BY 1;"

# backup / restore
docker compose exec -T db pg_dump -U nature_bazar nature_bazar > backup-$(date +%F).sql
cat backup-YYYY-MM-DD.sql | docker compose exec -T db psql -U nature_bazar -d nature_bazar
```

Useful tables: `orders`, `order_tags`, `order_events` (audit trail), `users`.

## Stop / start everything

```bash
docker compose stop               # stop, keep containers
docker compose start
docker compose down               # remove containers (DB data survives in the volume)
docker compose up -d              # bring the whole stack up
docker compose down -v            # DANGER: also deletes the database volume
```

## Local dev (hot reload, without Docker)

```bash
# Frontend on :3000, proxying /api to the dockerized API on :8000
cd frontend && API_URL=http://localhost:8000 npm run dev

# Backend with reload (stop the api container first: docker compose stop api)
cd backend && DATABASE_URL=postgresql://... uvicorn main:app --reload --port 8000
```

## Cleanup

```bash
docker image prune -f             # old image layers after rebuilds
docker system df                  # what's using disk
```

## Access from Mac

Tunnel only port 8085 is needed now (API is proxied through the web app):
```bash
ssh -N -L 8085:localhost:8085 shehab@<server>
# then open http://localhost:8085
```
Or just use https://naturebazar.iamshehab.com.
