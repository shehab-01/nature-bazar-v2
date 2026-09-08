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

## Pathao Courier

Keys live in `.env` (runtime vars, so `docker compose up -d --force-recreate api`
after changing them — no rebuild):

| Variable | Sandbox value | Live value |
|---|---|---|
| `PATHAO_BASE_URL` | `https://courier-api-sandbox.pathao.com` | `https://api-hermes.pathao.com` |
| `PATHAO_CLIENT_ID` | `7N1aMJQbWm` | merchant.pathao.com → Developer API → Client ID |
| `PATHAO_CLIENT_SECRET` | `wRcaibZkUdSNz2EI9ZyuXLlNrnAv0TdPUPXMnD39` | same page → Client Secret |
| `PATHAO_USERNAME` | `test@pathao.com` | your merchant panel login email |
| `PATHAO_PASSWORD` | `lovePathao` | your merchant panel password |
| `PATHAO_STORE_ID` | `150833` | from the check below |
| `PATHAO_UNIT_WEIGHT_KG` | `1` | real weight of one combo, in kg |

Check the keys and find the store id (super admin session cookie needed, so
easiest in the browser): open `http://localhost:8085/api/system/pathao`. It
shows `enabled`, whether it is the sandbox, and every store the credentials
can see with its `store_id`. Copy the right one into `PATHAO_STORE_ID`.

Sending happens from Admin → Orders → Ship: tick rows → **Send to Pathao**.
The consignment id appears in the Pathao column and links to Pathao's tracking
page. **Refresh Status** pulls the latest delivery status. Access tokens are
cached in the `integration_tokens` table and renewed automatically. Logs:
`docker compose logs api | grep -i pathao`.

## Attack protection

Two layers. The app layer protects the database; only Cloudflare can absorb a
flood that fills the pipe, so make sure both are on.

**Inside the API (per IP, per 10 minutes — set in `.env`, then
`docker compose up -d --force-recreate api`):**

| Variable | Default | Guards |
|---|---|---|
| `RATE_LIMIT_ORDERS` | 30 | `POST /api/orders` (placing an order) |
| `RATE_LIMIT_DRAFTS` | 300 | `POST /api/orders/draft` (form autosave) |
| `RATE_LIMIT_LOGINS` | 20 | `POST /api/auth/google` |
| `RATE_LIMIT_WINDOW_SECONDS` | 600 | the window for all three |
| `ORDER_COOLDOWN_HOURS` | 24 | one order per phone number per window |

Limits are deliberately loose: Bangladeshi mobile carriers put thousands of
customers behind one shared IP (CGNAT), so a tight limit turns a campaign
spike into lost orders. Counters are per worker (`UVICORN_WORKERS=2`), so the
effective ceiling is up to 2× the number above. Set a value to `0` to turn
that limit off.

The client address comes from `CF-Connecting-IP`, which Cloudflare sets and
clients cannot forge. If the header ever stops arriving (Cloudflare removed),
the limiter switches itself off rather than lock everyone out, and logs a
warning once. Blocked addresses show up as:

```bash
docker compose logs api | grep ratelimit
```

**At the edge (Cloudflare dashboard → the site):**

1. **Security → WAF → Rate limiting rules** — add one:
   expression `(http.request.uri.path eq "/api/orders" and http.request.method eq "POST")`,
   10 requests per 10 seconds per IP, action *Block* for 10 seconds.
   This stops a flood before it reaches the tunnel at all.
2. **Security → Bots → Bot Fight Mode: On.**
3. During an incident: **Overview → Under Attack Mode: On** (every visitor
   gets a 5-second JS challenge; turn it off afterwards).

The origin is only reachable through the tunnel (`8000` and `8085` bind to
`127.0.0.1`), so attackers cannot bypass Cloudflare by hitting the server's
IP directly. Keep it that way.

## Status & logs

Without SSH: **Admin → System** (super admins only) shows API/database health,
requests per minute across both workers, 429/409/5xx counts, who is currently
rate-limited, host load/memory/disk, and the last warnings and errors — refreshed
every 10 s. It also tells you whether Cloudflare's client address is reaching
the API; if that tile ever turns red, per-IP limiting is off.

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
