# Security

## Reporting a vulnerability

Please report suspected security vulnerabilities privately to the maintainers. Do not open a public issue for security bugs. Include enough detail to reproduce the issue and assess impact.

## Trust model

CEH-score is a single-tenant dashboard for tracking one person's CEH exam-prep scores. It has no per-user accounts, no users table, no login, no sessions, and no authentication cookies. The `ceh-theme` preference cookie is not an identity or authorization mechanism.

The supported public single-user browser deployment requires `ALLOW_OPEN_API=true` and `API_SECRET` unset. In this mode, **all shared assessments, settings, and polls reads and writes are unauthenticated**. Anyone who can reach the application can view, create, update, vote on, or delete shared data. Rate limiting and input validation do not provide authorization.

An alternative `API_SECRET` mode is available only for non-browser API clients. When configured, non-health `/api/*` requests must send:

```http
Authorization: Bearer <API_SECRET>
```

`API_SECRET` mode is incompatible with the browser UI until session authentication exists. Browser mutations do not attach the bearer secret, pages are not login-protected, and server-rendered hydration is not an authorization boundary. Do not expose the UI and assume `API_SECRET` makes it private.

The secret must never be placed in a `NEXT_PUBLIC_*` variable or serialized into page props, HTML, JavaScript, React Query dehydration, logs, or client-visible errors. Per-user ownership and authorization are out of scope: settings are one global row, and assessments and polls are shared globally. Private UI access requires session authentication on both pages and API routes.

## Deployment checklist

- [ ] Choose one mode explicitly: public UI with `ALLOW_OPEN_API=true` and `API_SECRET` unset, or API-only with a strong random `API_SECRET` and `ALLOW_OPEN_API` unset.
- [ ] For public UI mode, accept and communicate that every shared read and write is unauthenticated; do not store sensitive or multi-user data.
- [ ] For API-only mode, do not expose the browser UI. Require `Authorization: Bearer <API_SECRET>` from a trusted non-browser client.
- [ ] Never send `API_SECRET` to the browser or include it in hydration data.
- [ ] Use a least-privilege PostgreSQL role for the app connection. Do not use `SUPERUSER` or `CREATEDB`; grant only the DML permissions needed on the app schema.
- [ ] Store secrets in the platform secret manager, such as Railway or Vercel environment variables, or in a dedicated secret manager. Never commit secrets to the repo.
- [ ] Rotate `API_SECRET` and database credentials periodically, and immediately if exposure is suspected.
- [ ] Enforce HTTPS/TLS at the platform edge.
- [ ] Ensure `Strict-Transport-Security` is served. The app sets security headers in `next.config.ts`.
- [ ] Rate limiting uses `x-real-ip` / `X-Forwarded-For` only when proxy headers are trusted (`TRUST_PROXY_HEADERS=true`, or auto-detected on Vercel/Railway). Do not expose the Node process directly to the internet without a trusted edge that overwrites those headers; otherwise set `TRUST_PROXY_HEADERS=false`.
- [ ] Enable backups and point-in-time recovery for the PostgreSQL database.
- [ ] Set up monitoring and alerting for authentication failures, elevated 4xx/5xx rates, and unusual assessment or poll write volume.
- [ ] Forward logs to your platform's log drain. The app emits structured warnings for authentication failures and rate-limit hits.
- [ ] Keep dependencies patched with Dependabot and review CodeQL alerts.

## Application-layer controls already in place

- Zod validation with bounds and enums on every API route.
- Server-side computation of derived fields, including `percentage` and `passed`.
- Server-managed timestamps.
- Database `CHECK` constraints mirroring validation bounds.
- In-memory IP-based rate limiting on write endpoints.
- Security response headers via `next.config.ts`, including HSTS, `nosniff`, frame deny, referrer policy, permissions policy, and CSP (connect-src/script-src allow Vercel Speed Insights endpoints intentionally).
- Proxy-header trust gate for IP-based rate limiting (`TRUST_PROXY_HEADERS` / platform auto-detect).
- React auto-escaping, with no `dangerouslySetInnerHTML`, enforced by a `react/no-danger` lint rule.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
