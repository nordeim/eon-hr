# Deployment Guide — Eon HR

Eon HR ships as a single Next.js **standalone** build with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths: build, run, the environment contract, and the
TLS-fronted deployment story (§8).

## 1. Build

```bash
bun install
bun run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the 61-route page shell and the 42 API route
handlers (54 endpoints), then copies `.next/static` and `public/` into
`.next/standalone/` (see the `build` script in `package.json`).
`next.config.ts` pins `outputFileTracingRoot` to the repo root — keep it;
the standalone trace depends on it.

## 2. Run

```bash
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the npm/bun script — the scripts guarantee the
working directory that the SQLite path resolution and the standalone trace
rely on. Behind a reverse proxy, forward `X-Forwarded-Proto` (and the
standard `Host`) so cookie attributes, canonical/og URLs, `sitemap.xml`
and `robots.txt` all derive the right scheme — see §8.

## 3. Environment variables

Only two variables are read by the codebase (see `src/lib/db-path.ts` and
`src/lib/auth.ts`; the process.env sweep is pinned by the test pyramid):

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. An insecure dev constant is used when unset — never ship that (the standalone refuses to boot without it; `src/instrumentation.ts`). |

There is no `NEXT_PUBLIC_SITE_URL` or equivalent — the public origin is
derived **per request** from the proxy headers (`x-forwarded-proto` +
`host`), which is exactly what makes the TLS-fronted story (§8) zero-config:
the same build serves `http://localhost:3000`, `http://127.0.0.1:3200` and
`https://your-domain` correctly without rebuilds or env flips. The contract
is pinned by `tests/e2e/session71-tls-origin.spec.ts`.

## 4. Database location (§4 — the `.env.example` reference)

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build` and the running server alike, regardless of the process
   working directory. The resolution rule lives in
   `src/lib/db-path.ts` and is pinned by `tests/db-path.test.ts`.

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/eon-hr/custom.db"
   ```
   Absolute paths pass through untouched — immune to any working-directory
   ambiguity across service managers, containers, or cron wrappers. Point
   them at a persisted volume and back the file up.

3. **PostgreSQL.** Switch `provider = "postgresql"` in
   `prisma/schema.prisma`, set a `postgresql://` URL, then
   `bun run db:push && bun run db:seed`.

Initialize (or reset) the database with:

```bash
bun run db:push        # apply schema (db push — no migrations folder)
bun run db:seed        # idempotent demo workspace (wipes domain tables)
```

`db/*.db` is gitignored; every fresh clone recreates it from the two
commands above.

## 5. Updating

```bash
git pull
bun install
bunx prisma generate   # after schema changes
bun run db:push
bun run build
# restart the server process
```

## 6. Verification checklist

```bash
curl -s https://your-host/api/health          # {"status":"ok",...}
bun run lint && bun run typecheck && bun run test
bun run test:e2e                              # Playwright suite (local)
```

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory that has no `prisma/schema.prisma` and no absolute `DATABASE_URL` | Start via `bun run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to `/login` | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| Rate-limited logins (429) | 10 attempts/IP/15 min fixed window | Wait for `Retry-After`, or restart to clear the in-memory buckets (single-node) |
| Canonical/sitemap URLs read `http://` behind TLS | The proxy does not forward `X-Forwarded-Proto` | Forward the header (§8) |

## 8. The TLS-fronted deployment story

The app serves its own transport-layer hardening — you do NOT need to
configure any security headers at the proxy:

- **The 5-header security set** (r69, parity with the reference platform):
  `x-content-type-options nosniff`, `x-frame-options DENY`,
  `referrer-policy strict-origin-when-cross-origin`,
  `strict-transport-security max-age=31536000` (HSTS), and the
  locked-down `permissions-policy` — on every page AND API route.
- **The CSP nonce pipeline** (r70/r71, a superset — the reference serves
  none): `default-src 'self'` with per-request nonces on scripts and
  style elements, `'strict-dynamic'`, and the deliberate
  **no `upgrade-insecure-requests`** (the local/E2E transport is plain
  HTTP; behind TLS the `https:` origins are already correct, and HSTS
  covers the upgrade on the browser side).

### The proxy contract

Forward the scheme and host; the app derives everything else per request:

| Header | Required | Feeds |
|--------|----------|-------|
| `X-Forwarded-Proto: https` | Yes (TLS only) | cookie `Secure` derivation, `metadataBase` → per-route canonicals + og/twitter URLs, `sitemap.xml` `<loc>` set, `robots.txt` `Sitemap:` line |
| `Host` (standard forwarding) | Yes | the same origin chain |

The whole chain is pinned by `tests/e2e/session71-tls-origin.spec.ts`
(the spoofed-header proof: sitemap locs, the robots Sitemap line and the
canonical/og URLs all flip to `https://` with the single header).

### nginx example

```nginx
server {
    listen 443 ssl;
    server_name hr.example.com;
    ssl_certificate     /etc/letsencrypt/live/hr.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hr.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
# HSTS fires on the browser's next visit — served by the app already.
```

### Caddy example

```caddy
hr.example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Forwarded-Proto https
    }
}
# Caddy manages the certificate (ACME) automatically.
```

### Why no app-side TLS termination

The standalone Node server serves plain HTTP by design: TLS termination
belongs to the proxy (certificate rotation, ACME, HTTP/2, load balancing
are proxy concerns). HSTS — which the app serves unconditionally — only
takes effect once the browser sees the site over real TLS, which is
exactly the deployment shape above.
