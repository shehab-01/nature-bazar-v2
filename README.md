# Nature Bazar

Fresh Docker starter with a Next.js frontend, FastAPI backend, and PostgreSQL database.

## Start on the server

```bash
cp .env.example .env
# Edit .env and set a real POSTGRES_PASSWORD
docker compose up -d --build
docker compose ps
```

The web app is available on the server at `127.0.0.1:3000`. The API is available on the server at `127.0.0.1:8000`. PostgreSQL is internal to the Compose network.

Useful checks:

```bash
curl http://127.0.0.1:3000
curl http://127.0.0.1:8000/health
docker compose logs -f web api
```

## Open it from a Mac over SSH

Run this on the Mac, replacing `SERVER_USER` and `SERVER_HOST`:

```bash
ssh -N -L 3000:127.0.0.1:3000 SERVER_USER@SERVER_HOST
```

Keep that terminal open, then visit <http://localhost:3000> in the Mac browser. The `-L` flag forwards the Mac's port 3000 to the server's loopback port 3000, so no public firewall rule is needed.

To open the API docs from the Mac as well:

```bash
ssh -N -L 8000:127.0.0.1:8000 SERVER_USER@SERVER_HOST
```

Then visit <http://localhost:8000/docs>.

## Stop

```bash
docker compose down
```

`docker compose down` keeps the `postgres-data` volume. Use `docker compose down -v` only when you intentionally want to delete the database.
