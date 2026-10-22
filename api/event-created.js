import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
import { contentClient, sanityConfigured } from './_lib/sanity.js';
import { createEventSheet, sheetsConfigured } from './_lib/sheets.js';

// Sanity webhook (sanity.io/manage → API → Webhooks), fired when an event is first published.
// Creates the event's registrations sheet and writes its link back onto the event.
const { SANITY_WEBHOOK_SECRET } = process.env;

// Uses a Web-standard handler so request.text() gives the exact bytes Sanity signed.
export async function POST(request) {
  if (!SANITY_WEBHOOK_SECRET || !sanityConfigured || !sheetsConfigured) {
    console.error('event-created: missing SANITY_WEBHOOK_SECRET, Sanity or Google Script env vars');
    return Response.json({ error: 'Not configured.' }, { status: 500 });
  }

  const raw = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature || !(await isValidSignature(raw, signature, SANITY_WEBHOOK_SECRET))) {
    return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let id;
  try {
    id = JSON.parse(raw)._id;
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  if (typeof id !== 'string' || !id) return Response.json({ error: 'Missing _id.' }, { status: 400 });

  try {
    // Re-read rather than trust the payload; skip if a sheet already exists (webhook retries, races).
    const event = await contentClient.fetch(
      '*[_type == "event" && _id == $id][0]{_id, name, maxTeamSize, sheetId, sheetUrl}',
      { id },
    );
    if (!event) return Response.json({ error: 'Event not found.' }, { status: 404 });
    if (event.sheetId) return Response.json({ sheetUrl: event.sheetUrl, created: false });

    const { sheetUrl } = await createEventSheet(event);
    return Response.json({ sheetUrl, created: true }, { status: 201 });
  } catch (err) {
    console.error('event-created: failed to create sheet', err);
    return Response.json({ error: 'Failed to create sheet.' }, { status: 500 });
  }
}
