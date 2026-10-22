import { createClient } from '@sanity/client';

// Server-only: these env vars are set in Vercel (or .env for local dev) and never reach the browser.
const { SANITY_PROJECT_ID, SANITY_WRITE_TOKEN } = process.env;
const API_VERSION = process.env.SANITY_API_VERSION || '2025-02-19';

export const sanityConfigured = Boolean(SANITY_PROJECT_ID && SANITY_WRITE_TOKEN);

const base = { projectId: SANITY_PROJECT_ID, apiVersion: API_VERSION, token: SANITY_WRITE_TOKEN, useCdn: false };

// Public content (events, settings). Authenticated so we can write sheet links back to events.
export const contentClient = createClient({ ...base, dataset: process.env.SANITY_CONTENT_DATASET || 'production' });

// Private registrations dataset.
export const registrationsClient = createClient({
  ...base,
  dataset: process.env.SANITY_REGISTRATIONS_DATASET || 'registrations',
});
