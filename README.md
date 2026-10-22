# VECODERS

Club website: a Vite + React SPA with [Sanity](https://www.sanity.io) as the backend.

```
Browser (SPA) ──read, no token──▶ Sanity dataset "production" (public)
      │                            blog, event, achievement, siteSettings
      └── POST /api/register ──▶ Vercel function (holds SANITY_WRITE_TOKEN)
                                   └──▶ Sanity dataset "registrations" (private)
Admins ──▶ Sanity Studio (studio/) — content + registrations + CSV export
```

## Setup

Requires Node 22.12+.

```bash
cp .env.example .env               # fill in values (see below)
cp studio/.env.example studio/.env
npm install
npm --prefix studio install
```

### Environment variables

| Variable | Where it's used | Secret? |
|---|---|---|
| `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION` | Browser bundle (read-only queries) | No |
| `VITE_STUDIO_URL` | `/admin` redirect and the Admin button | No |
| `SANITY_PROJECT_ID`, `SANITY_CONTENT_DATASET`, `SANITY_REGISTRATIONS_DATASET`, `SANITY_API_VERSION` | `api/register.js` | No |
| `SANITY_WRITE_TOKEN` | `api/register.js` only | **Yes** |
| `SANITY_STUDIO_*` | `studio/` | No |

Rules:
- **Never** put a token in a `VITE_*` variable. Vite inlines those into public JavaScript.
- `.env` files are gitignored; only `.env.example` files are committed.
- Create tokens at sanity.io/manage → project → API → Tokens. Use an **Editor** token for `SANITY_WRITE_TOKEN`, and rotate it if it ever leaks.
- In production, set the same variables in Vercel → Project → Settings → Environment Variables.

## Development

```bash
npx vercel dev       # SPA + /api/register (needed to test registration)
npm run dev          # SPA only — reading content works, registration does not
npm --prefix studio run dev   # Studio at http://localhost:3333
```

## Content management

Admins sign in to Sanity Studio with their Sanity account. Invite people at sanity.io/manage → Members.

- **VECODERS Content** workspace: blogs, events, achievements, and the **Site Settings** singleton (announcement banner, registrations open/closed, homepage stats).
- **Registrations (private)** workspace: review submissions, change status, and use the **Export CSV** tool.

Deploy the Studio with `npm --prefix studio run deploy`.

## Deployment (Vercel)

1. Import the repo into Vercel (Vite framework preset).
2. Add the environment variables above.
3. Add the production domain as a CORS origin: sanity.io/manage → API → CORS origins (credentials off).
