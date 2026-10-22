# VECODERS

Club website: a Vite + React SPA with [Sanity](https://www.sanity.io) as the backend.

```
Browser (SPA) ──read, no token──▶ Sanity dataset "production" (public)
      │                            blog, event, achievement, siteSettings
      └── POST /api/register ──▶ Vercel function (holds SANITY_WRITE_TOKEN)
                                   ├──▶ Sanity dataset "registrations" (private)
                                   └──▶ Google Apps Script ──▶ the event's Google Sheet
Studio: publish new event ──Sanity webhook──▶ /api/event-created ──▶ creates the event's sheet,
                                                                      saves its link on the event
Admins ──▶ Sanity Studio (studio/) — content + registrations + CSV export
```

Each event controls its own registration: open/closed, minimum and maximum team size,
description and rules. `/register` sends visitors to the newest open event, and
`/register/<slug>` is the form for a specific event.

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
| `SANITY_PROJECT_ID`, `SANITY_CONTENT_DATASET`, `SANITY_REGISTRATIONS_DATASET`, `SANITY_API_VERSION` | `api/register.js` | No |
| `SANITY_WRITE_TOKEN` | `api/` only | **Yes** |
| `GOOGLE_SCRIPT_URL` | `api/` — the Apps Script web app URL | Treat as secret |
| `GOOGLE_SCRIPT_SECRET` | `api/` and the Apps Script `SHARED_SECRET` property | **Yes** |
| `SANITY_WEBHOOK_SECRET` | `api/event-created.js` and the Sanity webhook | **Yes** |
| `SANITY_STUDIO_*` | `studio/` | No |

Rules:
- **Never** put a token in a `VITE_*` variable. Vite inlines those into public JavaScript.
- `.env` files are gitignored; only `.env.example` files are committed.
- Create tokens at sanity.io/manage → project → API → Tokens. Use an **Editor** token for `SANITY_WRITE_TOKEN`, and rotate it if it ever leaks.
- In production, set the same variables in Vercel → Project → Settings → Environment Variables.

## Development

```bash
npm run dev                   # SPA + api/* (a Vite plugin serves the API functions locally)
npm --prefix studio run dev   # Studio at http://localhost:3333
```

With `GOOGLE_SCRIPT_URL` empty, registrations are still saved to Sanity and the Sheets step is skipped.

## Content management

Admins sign in to Sanity Studio with their Sanity account. Invite people at sanity.io/manage → Members.

- **VECODERS Content** workspace:
  - **Site Settings**, in tabs:
    - **Site:** announcement banner, registrations open/closed.
    - **Stats:** the numbers shown in the Home "Our Legacy" section and on the About page.
    - **Home: Legacy:** that section's title and text.
    - **About page:** hero lines, intro paragraph and stats-grid text.
    - **Footer:** contact email, address and social links. Leave a link empty to hide its icon.
  - **Blogs, events and achievements.**
  - **Timeline year**, **Patron** and **FAQ**: the Timeline page, the About page patrons, and the Home FAQ. Patrons and FAQs are sorted by their *Display order* number.
- **Registrations** workspace: review submissions, change status, and use the **Export CSV** tool.

If Sanity can't be reached, the site falls back to the original content in `src/data/defaults.js`.
To load that content into a fresh dataset, run `node --env-file=.env scripts/seed-content.mjs`. It only creates what's missing and never overwrites edits.

### Why registrations are private on the free plan
Sanity's free plan has no private datasets. When the Growth trial ends, private datasets become public. A public dataset never serves documents whose `_id` contains a dot to unauthenticated requests (drafts rely on the same rule), so registrations are stored as `registration.<n>`.
- They stay readable only with a token or a Studio login.
- Never create registrations with dot-free IDs.
- `scripts/migrate-registration-ids.mjs` moves any old `registration-<n>` documents over.

Deploy the Studio with `npm --prefix studio run deploy`.

The site has no admin link. Admins open the Studio at https://vecoders.sanity.studio, or go to `/studio` on the site, which redirects there.

## Google Sheets

Each event gets its own sheet, owned by the Google account that deploys the Apps Script.

1. Sign in to script.google.com with the account that should own the sheets, create a new project and paste in `scripts/google-apps-script/Code.gs`.
2. Under Project Settings → Script Properties, add `SHARED_SECRET` with the same value as `GOOGLE_SCRIPT_SECRET`. You can optionally add `FOLDER_ID` with a Drive folder ID to keep all the sheets together.
3. Deploy → New deployment → Web app, with Execute as: **Me** and Who has access: **Anyone**. Approve the permission prompt, then copy the `/exec` URL into `GOOGLE_SCRIPT_URL`.
4. If you edit the script later, go to Deploy → Manage deployments → Edit → *New version*. This keeps the same URL.

Sheets are created in two ways:
- **When an event is published.** Set up a webhook at sanity.io/manage → API → Webhooks:
  - URL: `https://<your-domain>/api/event-created`
  - Dataset: `production`
  - Trigger on: **Create**
  - Filter: `_type == "event" && !defined(sheetId)`
  - Projection: `{_id, name}`
  - HTTP method: POST
  - Secret: the value of `SANITY_WEBHOOK_SECRET`
- **On the first registration**, as a fallback for events created before the webhook existed or if a webhook call failed.

The link appears on the event in Studio under the **Google Sheet** tab. A registration still saves to Sanity even when Sheets is down; the CSV export in Studio always has every entry.

## Deployment (Vercel)

1. Import the repo into Vercel (Vite framework preset).
2. Add the environment variables above.
3. Add the production domain as a CORS origin: sanity.io/manage → API → CORS origins (credentials off).
4. Create the Sanity webhook described under [Google Sheets](#google-sheets).

# deployement by @geniusjoelraj
